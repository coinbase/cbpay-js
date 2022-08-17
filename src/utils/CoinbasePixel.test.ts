import { CoinbasePixel, PIXEL_ID, CoinbasePixelConstructorParams } from './CoinbasePixel';

import { onBroadcastedPostMessage } from './postMessage';

jest.mock('./postMessage', () => ({
  onBroadcastedPostMessage: jest.fn(),
  broadcastPostMessage: jest.fn(),
}));

describe('CoinbasePixel', () => {
  let mockOnReady: jest.Mock;
  let defaultArgs: CoinbasePixelConstructorParams;

  beforeEach(() => {
    mockOnReady = jest.fn();
    (onBroadcastedPostMessage as jest.Mock).mockReturnValue(jest.fn());
    defaultArgs = {
      appId: 'test',
      appParams: {
        parameter: 'mock-app-params',
      },
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
    expect(instance.unsubs.length).toEqual(3);
    expect(instance.appParams).toEqual(defaultArgs.appParams);
    expect(instance.isReady).toEqual(false);
    expect(instance.isLoggedIn).toEqual(false);
  });

  it('should setup default listeners', () => {
    createUntypedPixel(defaultArgs);

    expect(onBroadcastedPostMessage).toHaveBeenCalledTimes(3);
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
    expect(onBroadcastedPostMessage).toHaveBeenCalledWith('on_app_params_nonce', {
      allowedOrigin: 'https://pay.coinbase.com',
      onMessage: expect.any(Function),
      shouldUnsubscribe: true,
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
});

// Used to assert private properties without type errors
function createUntypedPixel(options: CoinbasePixelConstructorParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new CoinbasePixel(options) as any;
}
