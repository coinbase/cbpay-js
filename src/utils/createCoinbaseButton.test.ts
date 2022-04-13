import { createCoinbaseButton } from './createCoinbaseButton';

describe('createCoinbaseButton', () => {
  it('creates an iframe element with proper src set', () => {
    const iframe = createCoinbaseButton(DEFAULT_ARGS);

    expect(iframe instanceof HTMLIFrameElement).toBe(true);
    const url = new URL(iframe.src);
    expect(url.host).toBe('pay.coinbase.com');
    expect(url.pathname).toBe('/embed/button');
    expect(url.searchParams.get('appId')).toBe(DEFAULT_ARGS.appId);
    expect(url.searchParams.get('experience_loggedin')).toBe('embedded');
    expect(url.searchParams.get('experience_loggedout')).toBe('embedded');
  });

  it('allows for width/height override', () => {
    const iframe = createCoinbaseButton({ ...DEFAULT_ARGS, width: '100%', height: '20vh' });

    const { width, height } = iframe.style;
    expect(width).toBe('100%');
    expect(height).toBe('20vh');
  });

  it('allows for experience type override', () => {
    const iframe = createCoinbaseButton({
      ...DEFAULT_ARGS,
      experienceLoggedin: 'popup',
      experienceLoggedout: 'popup',
    });

    const url = new URL(iframe.src);
    expect(url.searchParams.get('experience_loggedin')).toBe('popup');
    expect(url.searchParams.get('experience_loggedout')).toBe('popup');
  });
});

const DEFAULT_ARGS: Parameters<typeof createCoinbaseButton>[0] = {
  appId: '123',
};
