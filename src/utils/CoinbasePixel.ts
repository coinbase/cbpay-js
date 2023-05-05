import { DEFAULT_HOST } from '../config';
import { EmbeddedContentStyles, Experience } from 'types/widget';
import { createEmbeddedContent, EMBEDDED_IFRAME_ID } from './createEmbeddedContent';
import { JsonObject } from 'types/JsonTypes';
import { broadcastPostMessage, onBroadcastedPostMessage } from './postMessage';
import { EventMetadata } from 'types/events';

const PIXEL_PATH = '/embed';

/** Default time to wait before setting loading to "failed" state */
const DEFAULT_MAX_LOAD_TIMEOUT = 5000;
export const PIXEL_ID = 'coinbase-sdk-connect';

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
  onReady: (error?: Error) => void;
  /** Fallback open callback when the pixel failed to load */
  onFallbackOpen?: () => void;
  debug?: boolean;
};

export type OpenExperienceOptions = {
  path: string;
  experienceLoggedIn: Experience;
  experienceLoggedOut?: Experience;
  embeddedContentStyles?: EmbeddedContentStyles;
} & ExperienceListeners;

export class CoinbasePixel {
  /**
   * Tracks the loading state of the embedded pixel
   * - loading: Attempting to embed iframe, waiting for pixel ready message.
   * - ready:   Received pixel_ready message to indicate listeners are ready.
   * - failed:  Failed to load the pixel or an error occurred while loading pixel context.
   * - waiting_for_response:  Waiting for a post message response.
   */
  private state: 'loading' | 'ready' | 'waiting_for_response' | 'failed' = 'loading';
  private debug: boolean;

  private host: string;
  private pixelIframe?: HTMLIFrameElement;
  private appId: string;
  private nonce = '';
  private eventStreamListeners: Partial<Record<EventMetadata['eventName'], (() => void)[]>> = {};
  private unsubs: (() => void)[] = [];
  private appParams: JsonObject;
  /** This will be called when the pixel successfully initializes to the error listener event. */
  private removeErrorListener?: () => void;
  /** onReady callback which should be triggered when a nonce has successfully been retrieved */
  private onReadyCallback: CoinbasePixelConstructorParams['onReady'];
  private onFallbackOpen: CoinbasePixelConstructorParams['onFallbackOpen'];

  public isLoggedIn = false;

  constructor({
    host = DEFAULT_HOST,
    appId,
    appParams,
    onReady,
    onFallbackOpen,
    debug,
  }: CoinbasePixelConstructorParams) {
    this.host = host;
    this.appId = appId;
    this.appParams = appParams;
    this.onReadyCallback = onReady;
    this.onFallbackOpen = onFallbackOpen;
    this.debug = debug || false;

    this.addPixelReadyListener();
    this.addErrorListener();
    this.embedPixel();

    // Setup a timeout for errors that might stop the window from loading i.e. CSP
    setTimeout(() => {
      if (this.state !== 'ready') {
        this.onFailedToLoad();
      }
    }, DEFAULT_MAX_LOAD_TIMEOUT);
  }

  /** Opens the CB Pay experience */
  public openExperience = (options: OpenExperienceOptions): void => {
    this.log('Attempting to open experience', { state: this.state });

    // Avoid double clicking when we are waiting on a response for a new nonce
    if (this.state === 'waiting_for_response') {
      return;
    }

    // Still waiting on pixel to load. Queue the options.
    if (this.state === 'loading') {
      return;
    }

    // Pixel failed to load or ran into a critical error, run fallback if provided.
    if (this.state === 'failed') {
      this.onFallbackOpen?.();
      return;
    }

    if (!this.nonce) {
      throw new Error('Attempted to open CB Pay experience without nonce');
    }

    const nonce = this.nonce;
    this.nonce = '';

    this.setupExperienceListeners(options);

    const { path, experienceLoggedIn, experienceLoggedOut, embeddedContentStyles } = options;

    const widgetUrl = new URL(`${this.host}${path}`);
    widgetUrl.searchParams.append('appId', this.appId);
    widgetUrl.searchParams.append('type', 'secure_standalone');

    const experience = this.isLoggedIn
      ? experienceLoggedIn
      : experienceLoggedOut || experienceLoggedIn;

    widgetUrl.searchParams.append('nonce', nonce);
    const url = widgetUrl.toString();

    this.log('Opening experience', { experience, isLoggedIn: this.isLoggedIn });

    if (experience === 'embedded') {
      const openEmbeddedExperience = () => {
        const embedded = createEmbeddedContent({ url, ...embeddedContentStyles });
        if (embeddedContentStyles?.target) {
          document.querySelector(embeddedContentStyles?.target)?.replaceChildren(embedded);
        } else {
          document.body.appendChild(embedded);
        }
      };

      if (!this.isLoggedIn) {
        // Embedded experience opens popup for signin
        this.startDirectSignin(openEmbeddedExperience);
      } else {
        openEmbeddedExperience();
      }
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
          this.addEventStreamListener('open', () => {
            if (winRef?.id) {
              chrome.windows.update(winRef.id, {
                width: PopupSizes.widget.width,
                height: PopupSizes.widget.height,
                left: window.screenLeft - PopupSizes.widget.width - 10,
                top: window.screenTop,
              });
            }
          });
        },
      );
    } else if (experience === 'new_tab' && window.chrome?.tabs?.create) {
      void window.chrome.tabs.create({ url });
    } else {
      openWindow(url, experience);
    }

    // For users who exit the experience and want to re-enter, we need a fresh nonce to use.
    // Additionally, if we trigger sendAppParams too early we'll invalidate the nonce they're opening in this current attempt.
    // Adding an event listener for when the widget opens allows us to safely request a new nonce for another session.
    const onOpen = () => {
      this.sendAppParams();
      this.removeEventStreamListener('open', onOpen);
    };
    this.addEventStreamListener('open', onOpen);
  };

  public endExperience = (): void => {
    document.getElementById(EMBEDDED_IFRAME_ID)?.remove();
  };

  public destroy = (): void => {
    document.getElementById(PIXEL_ID)?.remove();
    this.unsubs.forEach((unsub) => unsub());
  };

  /** Adds a listener for when the pixel is ready and requests an app params nonce when ready */
  private addPixelReadyListener = (): void => {
    this.onMessage('pixel_ready', {
      shouldUnsubscribe: false,
      onMessage: (data) => {
        this.log('Received message: pixel_ready');
        this.isLoggedIn = !!data?.isLoggedIn as boolean;

        this.removeErrorListener?.();
        this.sendAppParams(() => {
          this.onReadyCallback?.();
        });
      },
    });
  };

  private addErrorListener = (): void => {
    this.removeErrorListener = this.onMessage('error', {
      shouldUnsubscribe: true,
      onMessage: (data) => {
        this.log('Received message: error');

        if (data) {
          const message = typeof data === 'string' ? data : JSON.stringify(data);
          this.onReadyCallback?.(new Error(message));
        }
      },
    });
  };

  /** Creates and adds the pixel to the document */
  private embedPixel = (): void => {
    document.getElementById(PIXEL_ID)?.remove();
    const pixel = createPixel({
      host: this.host,
      appId: this.appId,
    });

    pixel.onerror = this.onFailedToLoad;

    this.pixelIframe = pixel;
    document.body.appendChild(pixel);
  };

  /** Failed to load the pixel iframe */
  private onFailedToLoad = () => {
    this.state = 'failed';

    // If a fallback option is provided we only want to provide a warning since we can still attempt to open the widget
    if (this.onFallbackOpen) {
      if (this.debug) {
        console.warn('Failed to load CB Pay pixel. Falling back to opening in new tab.');
      }
      this.onReadyCallback?.();
    } else {
      const error = new Error('Failed to load CB Pay pixel');
      if (this.debug) {
        console.error(error);
      }
      // If no fallback option provided we're in a critical error state
      this.onReadyCallback?.(error);
    }
  };

  private sendAppParams = (callback?: () => void): void => {
    // Fetch a new nonce from the pixel
    if (this.pixelIframe?.contentWindow) {
      this.log('Sending message: app_params');
      this.onMessage('on_app_params_nonce', {
        onMessage: (data) => {
          this.state = 'ready';
          this.nonce = (data?.nonce as string) || '';
          callback?.();
        },
      });

      this.state = 'waiting_for_response';
      broadcastPostMessage(this.pixelIframe.contentWindow, 'app_params', {
        data: this.appParams,
      });
    } else {
      // Shouldn't be here after loading the pixel.
      console.error('Failed to find pixel content window');
      // Set the pixel to the failed state and attempt to open using the fallback method.
      this.state = 'failed';
      this.onFallbackOpen?.();
    }
  };

  private setupExperienceListeners = ({
    onSuccess,
    onExit,
    onEvent,
    onRequestedUrl,
  }: ExperienceListeners) => {
    this.onMessage('event', {
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

function createPixel({ host, appId }: { host: string; appId: string }) {
  const pixel = document.createElement('iframe');
  pixel.style.border = 'unset';
  pixel.style.borderWidth = '0';
  pixel.style.width = '0';
  pixel.style.height = '0';
  pixel.style.height = '0';
  pixel.id = PIXEL_ID;

  const url = new URL(`${host}${PIXEL_PATH}`);
  url.searchParams.append('appId', appId);
  pixel.src = url.toString();

  return pixel;
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
