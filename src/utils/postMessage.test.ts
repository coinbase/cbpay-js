/**
 * @jest-environment jsdom
 */
import { onBroadcastedPostMessage, broadcastPostMessage } from './postMessage';

const flushMessages = () => new Promise((resolve) => setTimeout(resolve, 10));

const domain = 'https://coinbase.com';

const patchOriginEvent = (event: MessageEvent<unknown>) => {
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
      onBroadcastedPostMessage('app_ready', { onMessage: callbackMock });

      window.postMessage('app_ready', '*');

      await flushMessages();

      expect(callbackMock).toHaveBeenCalled();
    });

    it.each([
      ['https://coinbase.com', true],
      ['https://bad-website.com', false],
    ])('validates origin for %s', async (allowedOrigin, isCallbackExpected) => {
      const callbackMock = jest.fn();
      const onValidateOriginMock = jest.fn(async (origin) => origin === allowedOrigin);
      onBroadcastedPostMessage('app_ready', {
        onMessage: callbackMock,
        onValidateOrigin: onValidateOriginMock,
      });

      window.postMessage('app_ready', '*');

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
      onBroadcastedPostMessage('app_ready', {
        onMessage: callbackMock,
        allowedOrigin,
      });

      window.postMessage('app_ready', '*');

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
      broadcastPostMessage(window, 'app_ready');

      await flushMessages();

      expect(onMessageMock).toBeCalledWith({
        data: 'app_ready',
        origin: 'https://coinbase.com',
      });
    });

    it('sends formats data correctly', async () => {
      broadcastPostMessage(window, 'app_ready', { data: { test: 'hi' } });

      await flushMessages();

      expect(onMessageMock).toBeCalledWith(
        expect.objectContaining({
          data: '{"eventName":"app_ready","data":{"test":"hi"}}',
        }),
      );
    });
  });
});
