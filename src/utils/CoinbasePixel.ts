import { DEFAULT_HOST } from '../config';
import { EmbeddedContentStyles, Experience, Theme } from 'types/widget';
import { createEmbeddedContent, EMBEDDED_IFRAME_ID } from './createEmbeddedContent';
import { JsonObject } from 'types/JsonTypes';
import { onBroadcastedPostMessage } from './postMessage';
import { EventMetadata } from 'types/events';
import { generateOnRampURL } from '../onramp/generateOnRampURL';

const PopupSizes: Record<'signin' | 'widget', { width: number; height: number }> = {
  signin: {
    width: 460,
    height: 730,
  },
  widget: {
    width: 430,
    height: 600,
  },
};

export type ExperienceListeners = {
  onExit?: (data?: JsonObject) => void;
  onSuccess?: (data?: JsonObject) => void;
  onEvent?: (event: EventMetadata) => void;
  onRequestedUrl?: (url: string) => void;
};

export type CoinbasePixelConstructorParams = {
  host?: string;
  appId: string;
  appParams: JsonObject;
  debug?: boolean;
  theme?: Theme;
};

export type OpenExperienceOptions = {
  path: string;
  experienceLoggedIn: Experience;
  experienceLoggedOut?: Experience;
  embeddedContentStyles?: EmbeddedContentStyles;
} & ExperienceListeners;

export class CoinbasePixel {
  private debug: boolean;
  private host: string;
  private appId: string;
  private eventStreamListeners: Partial<Record<EventMetadata['eventName'], (() => void)[]>> = {};
  private unsubs: (() => void)[] = [];
  private appParams: JsonObject;
  private removeEventListener?: () => void;
  private theme: Theme | null | undefined;

  constructor({
    host = DEFAULT_HOST,
    appId,
    appParams,
    debug,
    theme,
  }: CoinbasePixelConstructorParams) {
    this.host = host;
    this.appId = appId;
    this.appParams = appParams;
    this.debug = debug || false;
    this.theme = theme;
  }

  /** Opens the CB Pay experience */
  public openExperience = (options: OpenExperienceOptions): void => {
    this.log('Attempting to open experience');

    this.setupExperienceListeners(options);

    const { experienceLoggedIn, experienceLoggedOut, embeddedContentStyles } = options;

    const experience = experienceLoggedOut || experienceLoggedIn;

    const url = generateOnRampURL({
      appId: this.appId,
      host: this.host,
      theme: this.theme ?? undefined,
      ...this.appParams,
    });

    this.log('Opening experience', { experience });

    if (experience === 'embedded') {
      this.log(
        'DEPRECATION WARNING: Two factor authentication does not work in an iframe, so the embedded experience should not be used. It will be removed in a future release',
      );
      const openEmbeddedExperience = () => {
        const embedded = createEmbeddedContent({ url, ...embeddedContentStyles });
        if (embeddedContentStyles?.target) {
          document.querySelector(embeddedContentStyles?.target)?.replaceChildren(embedded);
        } else {
          document.body.appendChild(embedded);
        }
      };

      this.startDirectSignin(openEmbeddedExperience);
    } else if (experience === 'popup' && window.chrome?.windows?.create) {
      void window.chrome.windows.create(
        {
          url,
          setSelfAsOpener: true,
          type: 'popup',
          focused: true,
          width: PopupSizes.signin.width,
          height: PopupSizes.signin.height,
          left: window.screenLeft - PopupSizes.signin.width - 10,
          top: window.screenTop,
        },
        (winRef) => {
          const onOpenCallback = () => {
            if (winRef?.id) {
              chrome.windows.update(winRef.id, {
                width: PopupSizes.widget.width,
                height: PopupSizes.widget.height,
                left: window.screenLeft - PopupSizes.widget.width - 10,
                top: window.screenTop,
              });
              this.removeEventStreamListener('open', onOpenCallback);
            }
          };
          this.addEventStreamListener('open', onOpenCallback);
        },
      );
    } else if (experience === 'new_tab' && window.chrome?.tabs?.create) {
      void window.chrome.tabs.create({ url });
    } else {
      openWindow(url, experience);
    }
  };

  public endExperience = (): void => {
    document.getElementById(EMBEDDED_IFRAME_ID)?.remove();
  };

  public destroy = (): void => {
    this.unsubs.forEach((unsub) => unsub());
  };

  private setupExperienceListeners = ({
    onSuccess,
    onExit,
    onEvent,
    onRequestedUrl,
  }: ExperienceListeners) => {
    // Unsubscribe from events in case there's still an active listener
    if (this.removeEventListener) {
      this.removeEventListener();
    }

    this.removeEventListener = this.onMessage('event', {
      shouldUnsubscribe: false,
      onMessage: (data) => {
        const metadata = data as EventMetadata;

        this.eventStreamListeners[metadata.eventName]?.forEach((cb) => cb?.());

        if (metadata.eventName === 'success') {
          onSuccess?.();
        }
        if (metadata.eventName === 'exit') {
          onExit?.(metadata.error);
        }
        if (metadata.eventName === 'request_open_url') {
          onRequestedUrl?.(metadata.url);
        }
        onEvent?.(data as EventMetadata);
      },
    });
  };

  private startDirectSignin = (callback: () => void) => {
    const queryParams = new URLSearchParams();
    queryParams.set('appId', this.appId);
    queryParams.set('type', 'direct');
    const directSigninUrl = `${this.host}/signin?${queryParams.toString()}`;
    const signinWinRef = openWindow(directSigninUrl, 'popup');

    this.onMessage('signin_success', {
      onMessage: () => {
        signinWinRef?.close();
        callback();
      },
    });
  };

  private addEventStreamListener = (name: EventMetadata['eventName'], cb: () => void) => {
    if (this.eventStreamListeners[name]) {
      this.eventStreamListeners[name]?.push(cb);
    } else {
      this.eventStreamListeners[name] = [cb];
    }
  };

  private removeEventStreamListener = (name: EventMetadata['eventName'], callback: () => void) => {
    if (this.eventStreamListeners[name]) {
      const filteredListeners = this.eventStreamListeners[name]?.filter((cb) => cb !== callback);
      this.eventStreamListeners[name] = filteredListeners;
    }
  };

  private onMessage = (...args: Parameters<typeof onBroadcastedPostMessage>) => {
    const unsubFxn = onBroadcastedPostMessage(args[0], { allowedOrigin: this.host, ...args[1] });
    this.unsubs.push(unsubFxn);

    return unsubFxn;
  };

  private log = (...args: Parameters<typeof console.log>) => {
    if (this.debug) {
      console.log('[CBPAY]', ...args);
    }
  };
}

function openWindow(url: string, experience: Experience) {
  return window.open(
    url,
    'Coinbase',
    experience === 'popup'
      ? `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, height=${PopupSizes.signin.height},width=${PopupSizes.signin.width}`
      : undefined,
  );
}
