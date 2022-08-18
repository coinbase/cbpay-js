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
  let mockOnReady: jest.Mock;
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
    (onBroadcastedPostMessage as jest.Mock).mockReturnValue(jest.fn());
    defaultArgs = {
      appId: 'test',
      appParams: defaultAppParams,
      onReady: mockOnReady,
      onFallbackOpen: mockOnFallbackOpen,
    };
  });

  afterEach(() => {
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
    const pixel = new CoinbasePixel(defaultArgs);
    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeTruthy();

    pixel.destroy();
    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeNull();
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

  it.todo('should handle openExperience when pixel has status "loading"');
  it.todo('should handle openExperience when pixel has status "waiting_for_response"');
  it.todo('should handle openExperience when pixel has status "failed"');

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

  it.todo('should unsubscribe from messages');
});

// Used to assert private properties without type errors
function createUntypedPixel(options: CoinbasePixelConstructorParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new CoinbasePixel(options) as any;
}

function mockPixelReady() {
  const onMessageCall = (onBroadcastedPostMessage as jest.Mock).mock.calls.find(
    ([message]) => message === 'pixel_ready',
  );
  expect(onMessageCall).toBeTruthy();
  onMessageCall[1].onMessage({ isLoggedIn: true });
}

function mockOnAppParamsNonce(nonce: string) {
  const onMessageCalls = (onBroadcastedPostMessage as jest.Mock).mock.calls.filter(
    ([message]) => message === 'on_app_params_nonce',
  );
  onMessageCalls.forEach((call) => {
    call[1].onMessage({ nonce });
  });
}
