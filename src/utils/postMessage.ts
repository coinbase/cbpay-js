import { JsonObject } from '../types/JsonTypes';

export enum MessageCodes {
  LaunchEmbedded = 'launch_embedded',
  AppReady = 'app_ready',
  AppParams = 'app_params',
  SigninSuccess = 'signin_success',
  Success = 'success', // TODO: deprecate
  Exit = 'exit', // TODO: deprecate
  Event = 'event',
  Error = 'error',

  PixelReady = 'pixel_ready',
  OnAppParamsNonce = 'on_app_params_nonce',
}

export type MessageCode = `${MessageCodes}`;

export type MessageData = JsonObject;

export type PostMessageData = {
  eventName: MessageCode;
  data?: MessageData;
};

export const onBroadcastedPostMessage = (
  messageCode: MessageCode,
  {
    onMessage: callback,
    shouldUnsubscribe = true,
    allowedOrigin,
    onValidateOrigin = () => Promise.resolve(true),
  }: {
    onMessage: (data?: MessageData) => void;
    shouldUnsubscribe?: boolean;
    allowedOrigin?: string;
    onValidateOrigin?: (origin: string) => Promise<boolean>;
  },
): (() => void) => {
  const onMessage = (e: MessageEvent) => {
    const { eventName, data } = parsePostMessage(e.data as string);
    const isOriginAllowed = !allowedOrigin || e.origin === allowedOrigin;

    if (eventName === messageCode) {
      void (async () => {
        if (isOriginAllowed && (await onValidateOrigin(e.origin))) {
          callback(data);
          if (shouldUnsubscribe) {
            window.removeEventListener('message', onMessage);
          }
        }
      })();
    }
  };

  window.addEventListener('message', onMessage);

  // Unsubscribe
  return () => {
    window.removeEventListener('message', onMessage);
  };
};

export type SdkTarget = Window | { postMessage: typeof window.postMessage };

export const getSdkTarget = (win: Window): SdkTarget | undefined => {
  if (win !== window) {
    // Internal to SDK
    return win;
  } else if (isMobileSdkTarget(win)) {
    // Mobile SDK
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { postMessage: (message: string) => win.ReactNativeWebView!.postMessage!(message) };
  } else if (win.opener) {
    // Button proxy
    return win.opener;
  } else if (win.parent !== win.self) {
    // Third party / SDK
    return win.parent;
  } else {
    return undefined;
  }
};

const isMobileSdkTarget = (win: Window) => {
  try {
    return win.ReactNativeWebView?.postMessage !== undefined;
  } catch {
    return false;
  }
};

export const broadcastPostMessage = (
  win: SdkTarget,
  eventName: MessageCode,
  { allowedOrigin = '*', data }: { allowedOrigin?: string; data?: MessageData } = {},
): void => {
  const message = formatPostMessage(eventName, data);
  win.postMessage(message, allowedOrigin);
};

const parsePostMessage = (data: string): PostMessageData => {
  try {
    return JSON.parse(data) as PostMessageData;
  } catch {
    return { eventName: data as MessageCode }; // event name only
  }
};

const formatPostMessage = (
  eventName: PostMessageData['eventName'],
  data?: PostMessageData['data'],
): string => {
  if (data) {
    return JSON.stringify({ eventName, data });
  }
  return eventName;
};
