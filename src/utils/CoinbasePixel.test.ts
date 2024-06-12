import {
  CoinbasePixel,
  CoinbasePixelConstructorParams,
  OpenExperienceOptions,
} from './CoinbasePixel';
import { EMBEDDED_IFRAME_ID } from './createEmbeddedContent';

import { onBroadcastedPostMessage } from './postMessage';

jest.mock('./postMessage', () => ({
  onBroadcastedPostMessage: jest.fn(),
  broadcastPostMessage: jest.fn(),
}));

describe('CoinbasePixel', () => {
  window.open = jest.fn();

  let mockUnsubCallback: jest.Mock;
  let defaultArgs: CoinbasePixelConstructorParams;
  const defaultAppParams = {
    addresses: { '0x0': ['ethereum'] },
  };
  const defaultOpenOptions: OpenExperienceOptions = {
    path: '/buy',
    experienceLoggedIn: 'embedded',
  };

  beforeEach(() => {
    mockUnsubCallback = jest.fn();
    (onBroadcastedPostMessage as jest.Mock).mockReturnValue(mockUnsubCallback);
    defaultArgs = {
      appId: 'test',
      appParams: defaultAppParams,
    };
  });

  afterEach(() => {
    document.getElementById(EMBEDDED_IFRAME_ID)?.remove();
    // @ts-expect-error - test
    window.chrome = undefined;
    jest.resetAllMocks();
  });

  it('should initialize with default values', () => {
    const instance = createUntypedPixel(defaultArgs);

    expect(instance.appId).toEqual('test');
    expect(instance.host).toEqual('https://pay.coinbase.com');
    expect(instance.unsubs.length).toEqual(0);
    expect(instance.appParams).toEqual(defaultArgs.appParams);
  });

  it('should handle opening the embedded experience when logged out', () => {
    const instance = createUntypedPixel(defaultArgs);

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

    instance.openExperience({ ...defaultOpenOptions, experienceLoggedIn: 'popup' });

    expect(window.chrome.windows.create).toHaveBeenCalledWith(
      {
        focused: true,
        height: 730,
        left: -470,
        setSelfAsOpener: true,
        top: 0,
        type: 'popup',
        url: 'https://pay.coinbase.com/buy/select-asset?addresses=%7B%220x0%22%3A%5B%22ethereum%22%5D%7D&appId=test',
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

    instance.openExperience({ ...defaultOpenOptions, experienceLoggedIn: 'new_tab' });

    expect(window.chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://pay.coinbase.com/buy/select-asset?addresses=%7B%220x0%22%3A%5B%22ethereum%22%5D%7D&appId=test',
    });
  });

  it('should handle opening the popup experience in browsers', () => {
    const instance = new CoinbasePixel(defaultArgs);

    instance.openExperience({ ...defaultOpenOptions, experienceLoggedIn: 'popup' });

    expect(window.open).toHaveBeenCalledWith(
      'https://pay.coinbase.com/buy/select-asset?addresses=%7B%220x0%22%3A%5B%22ethereum%22%5D%7D&appId=test',
      'Coinbase',
      'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, height=730,width=460',
    );
  });

  it('should handle opening the new_tab experience in browsers', () => {
    const instance = new CoinbasePixel(defaultArgs);

    instance.openExperience({ ...defaultOpenOptions, experienceLoggedIn: 'new_tab' });

    expect(window.open).toHaveBeenCalledWith(
      'https://pay.coinbase.com/buy/select-asset?addresses=%7B%220x0%22%3A%5B%22ethereum%22%5D%7D&appId=test',
      'Coinbase',
      undefined,
    );
  });

  it('.destroy should remove embedded pixel', () => {
    const instance = createUntypedPixel(defaultArgs);
    expect(instance.unsubs).toHaveLength(0);

    instance.openExperience(defaultOpenOptions);
    expect(instance.unsubs).toHaveLength(2);

    instance.destroy();
    expect(mockUnsubCallback).toHaveBeenCalledTimes(2);
  });
});

// Used to assert private properties without type errors
function createUntypedPixel(options: CoinbasePixelConstructorParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new CoinbasePixel(options) as any;
}

function findMockedListeners(message: string) {
  return (onBroadcastedPostMessage as jest.Mock).mock.calls.filter(([m]) => m === message);
}
