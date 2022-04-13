import { createCoinbaseButton } from '../utils/createCoinbaseButton';
import { createEmbeddedContent, EMBEDDED_IFRAME_ID } from '../utils/createEmbeddedContent';
import { DEFAULT_HOST } from '../config';
import { onBroadcastedPostMessage, broadcastPostMessage } from '../utils/postMessage';
import { DestinationWallet } from '../types/onramp';

const ONRAMP_PATH = '/buy/';

export type IframeStyles = {
  width?: string;
  height?: string;
  position?: string;
  top?: string;
};

type EmbeddedExperience = 'embedded' | 'popup';

type Amount = {
  /** fiat currency code (e.g. USD, EUR) */
  currencySymbol: string;
  value: number;
};

type InitOnRampButtonParams = {
  // DOM element to attach iframe to (query selector format)
  target?: string;
  appId: string;
  destinationWallets: DestinationWallet[];
  //TODO: add support for amount
  amount?: Amount;
  // iframe host
  host?: string;
  onExit?: (error?: Error) => void;
  onSuccess?: () => void;
  closeOnExit?: boolean;
  closeOnSuccess?: boolean;
  iframeStyles?: IframeStyles;
  experienceLoggedin: EmbeddedExperience;
};

export const initOnRampButton = ({
  appId,
  destinationWallets,
  target = '.coinbase-login-button',
  // do not add trailing "/"
  host = DEFAULT_HOST,
  onExit,
  onSuccess,
  closeOnExit,
  closeOnSuccess,
  iframeStyles,
  experienceLoggedin = 'embedded',
}: InitOnRampButtonParams): void => {
  const button = createCoinbaseButton({
    appId,
    host,
    // logged out experience will always be popup to avoid the bad experience of both extension and popup closing after authentication
    experienceLoggedout: 'popup',
    experienceLoggedin,
    type: 'secure_standalone',
  });

  // add app_ready listeners for the standalone proxy request from the button
  setupAppReadyListeners(button, host, destinationWallets);

  setupLaunchEmbeddedListeners(appId, host, destinationWallets, iframeStyles);

  if (onExit) {
    setupCallbackListener(onExit, 'exit', host, closeOnExit);
  }

  if (onSuccess) {
    setupCallbackListener(onSuccess, 'success', host, closeOnSuccess);
  }

  //Add button iframe to DOM
  document.querySelector(target)?.appendChild(button);
};

const setupAppReadyListeners = (
  button: HTMLIFrameElement,
  host: string,
  destinationWallets: DestinationWallet[],
) => {
  onBroadcastedPostMessage('app_ready', {
    allowedOrigin: host,
    shouldUnsubscribe: false,
    onMessage: () => {
      broadcastPostMessage(button.contentWindow as Window, 'app_params', {
        allowedOrigin: host,
        data: {
          widget: 'buy',
          destinationWallets,
        },
      });
    },
  });
};

const setupLaunchEmbeddedListeners = (
  appId: string,
  host: string,
  destinationWallets: DestinationWallet[],
  iframeStyles?: IframeStyles,
) => {
  onBroadcastedPostMessage('launch_embedded', {
    allowedOrigin: host,
    shouldUnsubscribe: false,
    onMessage: () => {
      //create new full screen iframe
      // Embed url
      const embeddedUrl = new URL(`${host}${ONRAMP_PATH}`);
      embeddedUrl.searchParams.append('appId', appId);
      embeddedUrl.searchParams.append('type', 'secure_standalone');

      const embedded = createEmbeddedContent({ url: embeddedUrl.toString(), ...iframeStyles });

      // add app_ready listeners for the embedded iframe
      setupAppReadyListeners(embedded, host, destinationWallets);

      document.body.appendChild(embedded);
    },
  });
};

const setupCallbackListener = (
  callback: () => void,
  event: 'success' | 'exit',
  host: string,
  closeOnEvent = false,
) => {
  onBroadcastedPostMessage(event, {
    allowedOrigin: host,
    shouldUnsubscribe: false,
    onMessage: () => {
      callback();
      if (closeOnEvent) {
        const iframe = document.getElementById(EMBEDDED_IFRAME_ID);
        iframe?.remove();
      }
    },
  });
};
