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
};

export type CoinbasePixelConstructorParams = {
  host?: string;
  appId: string;
  appParams: JsonObject;
  onReady?: (error?: Error) => void;
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
  /** A reference to a queued options to open the experience with if pixel isn't ready */
  private queuedOpenOptions: OpenExperienceOptions | undefined;
  private debug: boolean;

  private host: string;
  private pixelIframe?: HTMLIFrameElement;
  private appId: string;
  private nonce = '';
  private eventStreamListeners: Partial<Record<EventMetadata['eventName'], (() => void)[]>> = {};
  private unsubs: (() => void)[] = [];
  private appParams: JsonObject;
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
      this.queuedOpenOptions = options;
      return;
    }

    // Pixel failed to load or ran into a critical error, run fallback if provided.
    if (this.state === 'failed') {
      this.onFallbackOpen?.();
      return;
    }

    this.setupExperienceListeners(options);

    this.sendAppParams(this.appParams, (nonce) => {
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
    });
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
        this.onReadyCallback?.();

        // Preload the app parameters immediately
        this.state = 'waiting_for_response';
        this.sendAppParams(this.appParams, (nonce) => {
          this.log('Pixel received app params nonce', nonce);
          this.state = 'ready';
          this.nonce = nonce;
          this.runQueuedOpenExperience();
        });
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
    const message = 'Failed to load CB Pay pixel. Falling back to opening in new tab.';
    this.state = 'failed';
    console.warn(message);
    this.onReadyCallback?.(new Error(message));
    this.runQueuedOpenExperience();
  };

  /** Run any queued open experience options. Note: the window.open may not work outside of a click event and fail on browsers like Safari. */
  private runQueuedOpenExperience = () => {
    if (this.queuedOpenOptions) {
      this.log('Running queued experience');
      const options = { ...this.queuedOpenOptions };
      this.queuedOpenOptions = undefined;
      this.openExperience(options);
    }
  };

  private sendAppParams = (appParams: JsonObject, callback?: (nonce: string) => void): void => {
    // Preloaded nonce already exists.
    if (this.nonce) {
      const nonce = this.nonce;
      this.nonce = '';
      this.log('Using preloaded nonce', nonce);
      callback?.(nonce);
      return;
    }

    // Fetch a new nonce from the pixel
    if (this.pixelIframe?.contentWindow) {
      this.log('Sending message: app_params');
      this.onMessage('on_app_params_nonce', {
        onMessage: (data) => {
          this.state = 'ready';
          const nonce = (data?.nonce as string) || '';
          callback?.(nonce);
        },
      });

      this.state = 'waiting_for_response';
      broadcastPostMessage(this.pixelIframe.contentWindow, 'app_params', {
        data: appParams,
      });
    } else {
      // Shouldn't be here after loading the pixel.
      console.error('Failed to find pixel content window');
      // Set the pixel to the failed state and attempt to open using the fallback method.
      this.state = 'failed';
      this.onFallbackOpen?.();
    }
  };

  private setupExperienceListeners = ({ onSuccess, onExit, onEvent }: ExperienceListeners) => {
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

  private onMessage = (...args: Parameters<typeof onBroadcastedPostMessage>) => {
    this.unsubs.push(
      onBroadcastedPostMessage(args[0], {
        allowedOrigin: this.host,
        ...args[1],
      }),
    );
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
