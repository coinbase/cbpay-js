import { CoinbasePixel, PIXEL_ID } from './CoinbasePixel';

describe('CoinbasePixel', () => {
  it('creating CoinbasePixel instance should embed a pixel in document', () => {
    new CoinbasePixel(DEFAULT_ARGS);

    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeTruthy();
  });

  it('.destroy should remove embedded pixel', () => {
    const pixel = new CoinbasePixel(DEFAULT_ARGS);
    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeTruthy();

    pixel.destroy();
    expect(document.querySelector(`iframe#${PIXEL_ID}`)).toBeNull();
  });

  // TODO: Plenty of more tests we _should_ add here (regarding events/messaging/etc)
});

const DEFAULT_ARGS: ConstructorParameters<typeof CoinbasePixel>[0] = {
  appId: 'abc123',
  appParams: {},
};
