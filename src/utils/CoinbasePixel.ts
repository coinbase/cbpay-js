import { DEFAULT_HOST } from '../config';
import { EmbeddedContentStyles, Experience } from 'types/widget';
import { createEmbeddedContent, EMBEDDED_IFRAME_ID } from './createEmbeddedContent';
import { JsonObject } from 'types/JsonTypes';
import { broadcastPostMessage, onBroadcastedPostMessage } from './postMessage';
import { EventMetadata } from 'types/events';

const PIXEL_PATH = '/embed';
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
};

type CoinbasePixelConstructorParams = {
  host?: string;
  appId: string;
  appParams: JsonObject;
  onReady?: (error?: Error) => void;
};

export class CoinbasePixel {
  private host: string;
  private pixelIframe?: HTMLIFrameElement;
  private appId: string;
  private nonce = '';
  private eventStreamListeners: Partial<Record<EventMetadata['eventName'], (() => void)[]>> = {};
  private unsubs: (() => void)[] = [];
  private appParams: JsonObject;
  private onReadyCallback: CoinbasePixelConstructorParams['onReady'];

  public isReady = false;
  public isLoggedIn = false;

  constructor({ host = DEFAULT_HOST, appId, appParams, onReady }: CoinbasePixelConstructorParams) {
    this.host = host;
    this.appId = appId;
    this.appParams = appParams;
    this.onReadyCallback = onReady;

    this.setupListeners();
    this.embedPixel();
  }

  public openExperience = (
    options: {
      path: string;
      experienceLoggedIn: Experience;
      experienceLoggedOut?: Experience;
      embeddedContentStyles?: EmbeddedContentStyles;
    } & ExperienceListeners,
  ): void => {
    if (!this.isReady) {
      this.onMessage('on_app_params_nonce', {
        onMessage: () => {
          this.openExperience(options);
        },
      });
      return;
    }

    const {
      path,
      experienceLoggedIn,
      experienceLoggedOut,
      embeddedContentStyles,
      onExit,
      onSuccess,
      onEvent,
    } = options;

    const widgetUrl = new URL(`${this.host}${path}`);
    widgetUrl.searchParams.append('appId', this.appId);
    widgetUrl.searchParams.append('type', 'secure_standalone');

    const experience = this.isLoggedIn
      ? experienceLoggedIn
      : experienceLoggedOut || experienceLoggedIn;

    this.setupExperienceListeners({ onExit, onSuccess, onEvent });

    this.sendAppParams(this.appParams, () => {
      widgetUrl.searchParams.append('nonce', this.nonce);
      const url = widgetUrl.toString();
      this.nonce = '';

      if (experience === 'embedded') {
        const openEmbeddedExperience = () => {
          const embedded = createEmbeddedContent({ url, ...embeddedContentStyles });
          if (embeddedContentStyles?.target) {
            document.querySelector(embeddedContentStyles?.target)?.appendChild(embedded);
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
    });
  };

  public endExperience = (): void => {
    document.getElementById(EMBEDDED_IFRAME_ID)?.remove();
  };

  public destroy = (): void => {
    document.getElementById(PIXEL_ID)?.remove();
    this.unsubs.forEach((unsub) => unsub());
  };

  private setupListeners = (): void => {
    this.onMessage('pixel_ready', {
      shouldUnsubscribe: false,
      onMessage: (data) => {
        this.isLoggedIn = !!data?.isLoggedIn as boolean;
        this.sendAppParams(this.appParams);
      },
    });

    // First time only. Pixel is considered ready when we've setup the
    // app params for the first time - this avoids race conditions with nonces when opening.
    this.onMessage('on_app_params_nonce', {
      shouldUnsubscribe: true,
      onMessage: () => {
        this.isReady = true;
        this.onReadyCallback?.();
      },
    });

    this.onMessage('on_app_params_nonce', {
      shouldUnsubscribe: false,
      onMessage: (data) => {
        this.nonce = (data?.nonce as string) || '';
      },
    });
  };

  private embedPixel = (): void => {
    document.getElementById(PIXEL_ID)?.remove();
    const pixel = createPixel({
      host: this.host,
      appId: this.appId,
    });
    pixel.onerror = () => {
      this.onReadyCallback?.(new Error('Failed to initialize app'));
    };
    this.pixelIframe = pixel;
    document.body.appendChild(pixel);
  };

  private sendAppParams = (appParams: JsonObject, callback?: () => void): void => {
    if (this.nonce) {
      callback?.();
    } else if (this.pixelIframe && this.pixelIframe.contentWindow) {
      broadcastPostMessage(this.pixelIframe.contentWindow, 'app_params', {
        data: appParams,
      });
      this.onMessage('on_app_params_nonce', {
        onMessage: () => callback?.(),
      });
    }
  };

  private setupExperienceListeners = ({ onSuccess, onExit, onEvent }: ExperienceListeners) => {
    if (onEvent) {
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
          onEvent(data as EventMetadata);
        },
      });
    }
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

  private onMessage = (...args: Parameters<typeof onBroadcastedPostMessage>) => {
    this.unsubs.push(
      onBroadcastedPostMessage(args[0], {
        allowedOrigin: this.host,
        ...args[1],
      }),
    );
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
