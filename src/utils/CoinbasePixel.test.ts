import { CoinbasePixel, PIXEL_ID, CoinbasePixelConstructorParams } from './CoinbasePixel';

import { broadcastPostMessage, onBroadcastedPostMessage } from './postMessage';

jest.mock('./postMessage', () => ({
  onBroadcastedPostMessage: jest.fn(),
  broadcastPostMessage: jest.fn(),
}));

describe('CoinbasePixel', () => {
  let mockOnReady: jest.Mock;
  let defaultArgs: CoinbasePixelConstructorParams;
  const defaultAppParams = {
    parameter: 'mock-app-params',
  };

  beforeEach(() => {
    mockOnReady = jest.fn();
    (onBroadcastedPostMessage as jest.Mock).mockReturnValue(jest.fn());
    defaultArgs = {
      appId: 'test',
      appParams: defaultAppParams,
      onReady: mockOnReady,
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
    expect(instance.unsubs.length).toEqual(2);
    expect(instance.appParams).toEqual(defaultArgs.appParams);
    expect(instance.isReady).toEqual(false);
    expect(instance.isLoggedIn).toEqual(false);
  });

  it('should setup default listeners', () => {
    createUntypedPixel(defaultArgs);

    expect(onBroadcastedPostMessage).toHaveBeenCalledTimes(2);
    expect(onBroadcastedPostMessage).toHaveBeenCalledWith('pixel_ready', {
      allowedOrigin: 'https://pay.coinbase.com',
      onMessage: expect.any(Function),
      shouldUnsubscribe: false,
    });
    expect(onBroadcastedPostMessage).toHaveBeenCalledWith('on_app_params_nonce', {
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

    // 2 listeners now for nonce callback
    expect(
      (onBroadcastedPostMessage as jest.Mock).mock.calls.filter(
        ([message]) => message === 'on_app_params_nonce',
      ).length,
    ).toEqual(2);

    expect(instance.isLoggedIn).toEqual(true);
  });

  it('should handle on_app_params_nonce', () => {
    const instance = createUntypedPixel(defaultArgs);

    mockPixelReady();
    mockOnAppParamsNonce('mock-nonce');

    expect(instance.nonce).toEqual('mock-nonce');
    expect(instance.isReady).toEqual(true);
    expect(mockOnReady).toHaveBeenCalledWith();
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
