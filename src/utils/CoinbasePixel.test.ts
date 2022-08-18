import {
  CoinbasePixel,
  PIXEL_ID,
  CoinbasePixelConstructorParams,
  OpenExperienceOptions,
} from './CoinbasePixel';
import { EMBEDDED_IFRAME_ID } from './createEmbeddedContent';

import { broadcastPostMessage, onBroadcastedPostMessage } from './postMessage';

jest.mock('./postMessage', () => ({
  onBroadcastedPostMessage: jest.fn(),
  broadcastPostMessage: jest.fn(),
}));

describe('CoinbasePixel', () => {
  window.open = jest.fn();

  let mockOnReady: jest.Mock;
  let mockUnsubCallback: jest.Mock;
  let mockOnFallbackOpen: jest.Mock;
  let defaultArgs: CoinbasePixelConstructorParams;
  const defaultAppParams = {
    parameter: 'mock-app-params',
  };
  const defaultOpenOptions: OpenExperienceOptions = {
    path: '/buy',
    experienceLoggedIn: 'embedded',
  };

  beforeEach(() => {
    mockOnReady = jest.fn();
    mockOnFallbackOpen = jest.fn();
    mockUnsubCallback = jest.fn();
    (onBroadcastedPostMessage as jest.Mock).mockReturnValue(mockUnsubCallback);
    defaultArgs = {
      appId: 'test',
      appParams: defaultAppParams,
      onReady: mockOnReady,
      onFallbackOpen: mockOnFallbackOpen,
    };
  });

  afterEach(() => {
    document.getElementById(PIXEL_ID)?.remove();
    document.getElementById(EMBEDDED_IFRAME_ID)?.remove();
    // @ts-expect-error - test
    window.chrome = undefined;
    jest.resetAllMocks();
  });

  it('should initialize with default values', () => {
    const instance = createUntypedPixel(defaultArgs);

    expect(instance.appId).toEqual('test');
    expect(instance.host).toEqual('https://pay.coinbase.com');
    expect(instance.pixelIframe).toEqual(expect.any(HTMLIFrameElement));
    expect(instance.nonce).toEqual('');
    expect(instance.onReadyCallback).toEqual(mockOnReady);
    expect(instance.unsubs.length).toEqual(1);
    expect(instance.appParams).toEqual(defaultArgs.appParams);
    expect(instance.state).toEqual('loading');
    expect(instance.isLoggedIn).toEqual(false);
  });

  it('should setup pixel ready listener', () => {
    createUntypedPixel(defaultArgs);

    expect(onBroadcastedPostMessage).toHaveBeenCalledTimes(1);
    expect(onBroadcastedPostMessage).toHaveBeenCalledWith('pixel_ready', {
      allowedOrigin: 'https://pay.coinbase.com',
      onMessage: expect.any(Function),
      shouldUnsubscribe: false,
    });
  });

  it('should embed the pixel in document', () => {
    createUntypedPixel(defaultArgs);
    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeTruthy();
  });

  it('.destroy should remove embedded pixel', () => {
    const pixel = createUntypedPixel(defaultArgs);
    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeTruthy();

    mockPixelReady();
    mockOnAppParamsNonce('mock-nonce');

    expect(pixel.unsubs).toHaveLength(2);

    pixel.destroy();
    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeNull();
    expect(mockUnsubCallback).toHaveBeenCalledTimes(2);
  });

  it('should handle pixel_ready message', () => {
    const instance = createUntypedPixel(defaultArgs);

    mockPixelReady();

    expect(broadcastPostMessage).toHaveBeenCalledWith(expect.any(Object), 'app_params', {
      data: defaultAppParams,
    });

    expect(
      (onBroadcastedPostMessage as jest.Mock).mock.calls.filter(
        ([message]) => message === 'on_app_params_nonce',
      ).length,
    ).toEqual(1);

    expect(instance.isLoggedIn).toEqual(true);
    expect(instance.state).toEqual('waiting_for_response');
    expect(mockOnReady).toHaveBeenCalledWith();
  });

  it('should handle on_app_params_nonce', () => {
    const instance = createUntypedPixel(defaultArgs);

    mockPixelReady();
    mockOnAppParamsNonce('mock-nonce');

    expect(instance.nonce).toEqual('mock-nonce');
    expect(instance.state).toEqual('ready');
  });

  it('should handle openExperience when pixel is ready', () => {
    const pixel = new CoinbasePixel(defaultArgs);

    mockPixelReady();
    mockOnAppParamsNonce('mock-nonce');

    pixel.openExperience(defaultOpenOptions);

    expect(document.querySelector(`iframe#${EMBEDDED_IFRAME_ID}`)).toBeTruthy();
  });

  it('should handle openExperience when pixel has status "loading"', () => {
    const instance = createUntypedPixel(defaultArgs);

    expect(instance.state).toEqual('loading');
    instance.openExperience(defaultOpenOptions);

    expect(instance.queuedOpenOptions).toBeTruthy();
    expect(document.querySelector(`iframe#${EMBEDDED_IFRAME_ID}`)).toBeFalsy();
  });

  it('should handle openExperience when pixel has status "waiting_for_response"', () => {
    const instance = createUntypedPixel(defaultArgs);

    instance.state = 'waiting_for_response';
    instance.openExperience(defaultOpenOptions);

    expect(instance.queuedOpenOptions).toBeFalsy();
    expect(document.querySelector(`iframe#${EMBEDDED_IFRAME_ID}`)).toBeFalsy();
  });

  it('should handle openExperience when pixel has status "failed"', () => {
    const instance = createUntypedPixel(defaultArgs);

    instance.state = 'failed';
    instance.openExperience(defaultOpenOptions);

    expect(instance.queuedOpenOptions).toBeFalsy();
    expect(document.querySelector(`iframe#${EMBEDDED_IFRAME_ID}`)).toBeFalsy();
  });

  it('should handle openExperience with no preloaded nonce', () => {
    const instance = createUntypedPixel(defaultArgs);

    instance.state = 'ready';
    instance.isLoggedIn = true;
    instance.openExperience(defaultOpenOptions);

    expect(instance.state).toEqual('waiting_for_response');
    mockOnAppParamsNonce('mock-nonce');

    expect(document.querySelector(`iframe#${EMBEDDED_IFRAME_ID}`)).toBeTruthy();
  });

  it('should handle queued open options', () => {
    const instance = createUntypedPixel(defaultArgs);

    instance.openExperience(defaultOpenOptions); // trigger queued open
    mockPixelReady();
    mockOnAppParamsNonce('mock-nonce');

    expect(document.querySelector(`iframe#${EMBEDDED_IFRAME_ID}`)).toBeTruthy();
  });

  it('should handle opening the embedded experience when logged out', () => {
    const instance = createUntypedPixel(defaultArgs);

    mockPixelReady(false);
    mockOnAppParamsNonce('mock-nonce');
    instance.openExperience(defaultOpenOptions);

    expect(window.open).toHaveBeenCalledWith(
      'https://pay.coinbase.com/signin?appId=test&type=direct',
      'Coinbase',
      'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, height=730,width=460',
    );
    expect(findMockedListeners('signin_success')).toHaveLength(1);
  });

  it('should handle opening the popup experience in chrome extensions', () => {
    window.chrome = {
      // @ts-expect-error - test
      windows: {
        create: jest.fn(),
      },
    };

    const instance = new CoinbasePixel(defaultArgs);

    mockPixelReady(false);
    mockOnAppParamsNonce('mock-nonce');
    instance.openExperience({ ...defaultOpenOptions, experienceLoggedIn: 'popup' });

    expect(window.chrome.windows.create).toHaveBeenCalledWith(
      {
        focused: true,
        height: 730,
        left: -470,
        setSelfAsOpener: true,
        top: 0,
        type: 'popup',
        url: 'https://pay.coinbase.com/buy?appId=test&type=secure_standalone&nonce=mock-nonce',
        width: 460,
      },
      expect.any(Function),
    );
  });

  it('should handle opening the new_tab experience in chrome extensions', () => {
    window.chrome = {
      // @ts-expect-error - test
      tabs: {
        create: jest.fn(),
      },
    };

    const instance = new CoinbasePixel(defaultArgs);

    mockPixelReady(false);
    mockOnAppParamsNonce('mock-nonce');
    instance.openExperience({ ...defaultOpenOptions, experienceLoggedIn: 'new_tab' });

    expect(window.chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://pay.coinbase.com/buy?appId=test&type=secure_standalone&nonce=mock-nonce',
    });
  });

  it('should handle opening the popup experience in browsers', () => {
    const instance = new CoinbasePixel(defaultArgs);

    mockPixelReady(false);
    mockOnAppParamsNonce('mock-nonce');
    instance.openExperience({ ...defaultOpenOptions, experienceLoggedIn: 'popup' });

    expect(window.open).toHaveBeenCalledWith(
      'https://pay.coinbase.com/buy?appId=test&type=secure_standalone&nonce=mock-nonce',
      'Coinbase',
      'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, height=730,width=460',
    );
  });

  it('should handle opening the new_tab experience in browsers', () => {
    const instance = new CoinbasePixel(defaultArgs);

    mockPixelReady(false);
    mockOnAppParamsNonce('mock-nonce');
    instance.openExperience({ ...defaultOpenOptions, experienceLoggedIn: 'new_tab' });

    expect(window.open).toHaveBeenCalledWith(
      'https://pay.coinbase.com/buy?appId=test&type=secure_standalone&nonce=mock-nonce',
      'Coinbase',
      undefined,
    );
  });

  it('should handle max timeout for ready status', () => {
    jest.useFakeTimers();
    const originalWarn = console.warn;
    console.warn = jest.fn();

    const instance = createUntypedPixel(defaultArgs);

    instance.openExperience(defaultOpenOptions); // trigger queued open
    jest.advanceTimersToNextTimer();

    expect(instance.state).toEqual('failed');
    expect(mockOnReady).toHaveBeenCalledWith(expect.any(Error));
    expect(mockOnFallbackOpen).toHaveBeenCalled();

    jest.useRealTimers();
    console.warn = originalWarn;
  });
});

// Used to assert private properties without type errors
function createUntypedPixel(options: CoinbasePixelConstructorParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new CoinbasePixel(options) as any;
}

function mockPixelReady(isLoggedIn = true) {
  const onMessageCall = (onBroadcastedPostMessage as jest.Mock).mock.calls.find(
    ([message]) => message === 'pixel_ready',
  );
  expect(onMessageCall).toBeTruthy();
  onMessageCall[1].onMessage({ isLoggedIn });
}

function mockOnAppParamsNonce(nonce: string) {
  const onMessageCalls = (onBroadcastedPostMessage as jest.Mock).mock.calls.filter(
    ([message]) => message === 'on_app_params_nonce',
  );
  onMessageCalls.forEach((call) => {
    call[1].onMessage({ nonce });
  });
}

function findMockedListeners(message: string) {
  return (onBroadcastedPostMessage as jest.Mock).mock.calls.filter(([m]) => m === message);
}
