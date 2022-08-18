/**
 * @jest-environment jsdom
 */
import { onBroadcastedPostMessage, broadcastPostMessage, getSdkTarget } from './postMessage';

const flushMessages = () => new Promise((resolve) => setTimeout(resolve, 10));

const domain = 'https://coinbase.com';

const patchOriginEvent = (event: MessageEvent) => {
  if (event.origin === '') {
    event.stopImmediatePropagation();
    const eventWithOrigin = new MessageEvent('message', {
      data: event.data,
      origin: domain,
    });
    window.dispatchEvent(eventWithOrigin);
  }
};

describe('postMessage', () => {
  beforeAll(() => {
    window.addEventListener('message', patchOriginEvent);
  });

  afterAll(() => {
    window.removeEventListener('message', patchOriginEvent);
  });

  describe('onBroadcastedPostMessage', () => {
    it('triggers callback on message', async () => {
      const callbackMock = jest.fn();
      onBroadcastedPostMessage('pixel_ready', { onMessage: callbackMock });

      window.postMessage('pixel_ready', '*');

      await flushMessages();

      expect(callbackMock).toHaveBeenCalled();
    });

    it.each([
      ['https://coinbase.com', true],
      ['https://bad-website.com', false],
    ])('validates origin for %s', async (allowedOrigin, isCallbackExpected) => {
      const callbackMock = jest.fn();
      const onValidateOriginMock = jest.fn(async (origin) => origin === allowedOrigin);
      onBroadcastedPostMessage('pixel_ready', {
        onMessage: callbackMock,
        onValidateOrigin: onValidateOriginMock,
      });

      window.postMessage('pixel_ready', '*');

      await flushMessages();

      expect(onValidateOriginMock).toHaveBeenCalled();
      expect(await onValidateOriginMock.mock.results[0].value).toEqual(isCallbackExpected);
      expect(callbackMock).toHaveBeenCalledTimes(isCallbackExpected ? 1 : 0);
    });

    it.each([
      ['https://coinbase.com', true],
      ['https://bad-website.com', false],
    ])('triggers callback for allowedOrigin for %s', async (allowedOrigin, isCallbackExpected) => {
      const callbackMock = jest.fn();
      onBroadcastedPostMessage('pixel_ready', {
        onMessage: callbackMock,
        allowedOrigin,
      });

      window.postMessage('pixel_ready', '*');

      await flushMessages();

      expect(callbackMock).toHaveBeenCalledTimes(isCallbackExpected ? 1 : 0);
    });
  });

  describe('broadcastPostMessage', () => {
    let onMessageMock = jest.fn();

    const onMessage = (e: MessageEvent) => {
      onMessageMock({ data: e.data, origin: e.origin });
    };

    beforeEach(() => {
      onMessageMock = jest.fn();
      window.addEventListener('message', onMessage);
    });

    afterEach(() => {
      window.removeEventListener('message', onMessage);
    });

    it('sends post message', async () => {
      broadcastPostMessage(window, 'pixel_ready');

      await flushMessages();

      expect(onMessageMock).toBeCalledWith({
        data: 'pixel_ready',
        origin: 'https://coinbase.com',
      });
    });

    it('sends formats data correctly', async () => {
      broadcastPostMessage(window, 'pixel_ready', { data: { test: 'hi' } });

      await flushMessages();

      expect(onMessageMock).toBeCalledWith(
        expect.objectContaining({
          data: '{"eventName":"pixel_ready","data":{"test":"hi"}}',
        }),
      );
    });
  });

  describe('getSdkTarget', () => {
    type RNWindow = Window & typeof globalThis & { ReactNativeWebView: unknown };

    const originalOpener = window.opener;
    const originalParent = Object.getOwnPropertyDescriptor(window, 'parent') ?? {};

    afterEach(() => {
      window.opener = originalOpener;
      Object.defineProperty(window, 'parent', originalParent);
      delete (window as RNWindow).ReactNativeWebView;
    });

    it("returns the widget's window when called from the SDK internally", () => {
      const otherWin = {} as Window; // TODO: Get a different window object somehow?
      const target = getSdkTarget(otherWin);

      expect(target).toBe(otherWin);
    });

    it('else returns a postMessage object for RN (Mobile SDK)', () => {
      const ReactNativeWebView = {
        postMessage: jest.fn(),
      };
      (window as RNWindow).ReactNativeWebView = ReactNativeWebView;
      const target = getSdkTarget(window);
      target?.postMessage('test', '');

      expect(ReactNativeWebView.postMessage).toHaveBeenCalledTimes(1);
    });

    it("else returns the window's opener (Button Proxy) ", () => {
      const opener = {} as unknown as Window;
      window.opener = opener;
      const target = getSdkTarget(window);

      expect(target).toBe(opener);
    });

    it('else returns parent window (Third party / SDK)', () => {
      const parent = {} as unknown as Window;
      Object.defineProperty(window, 'parent', {
        get: () => parent,
      });
      const target = getSdkTarget(window);

      expect(target).toBe(parent);
    });
  });
});
