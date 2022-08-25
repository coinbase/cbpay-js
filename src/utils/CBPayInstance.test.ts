import { PIXEL_ID } from './CoinbasePixel';
import { CBPayInstance } from './CBPayInstance';

describe('CBPayInstance', () => {
  it('creating CBPayInstance instance should embed a pixel in document', () => {
    new CBPayInstance(DEFAULT_ARGS);

    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeTruthy();
  });

  it('.destroy should remove embedded pixel', () => {
    const i = new CBPayInstance(DEFAULT_ARGS);
    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeTruthy();

    i.destroy();
    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeNull();
  });

  // TODO: Plenty of more tests we _should_ add here (regarding events/messaging/etc)
});

const DEFAULT_ARGS: ConstructorParameters<typeof CBPayInstance>[0] = {
  appId: 'abc123',
  appParams: {},
  widget: 'buy',
  onReady: jest.fn(),
  experienceLoggedIn: 'popup',
  experienceLoggedOut: 'popup',
};
