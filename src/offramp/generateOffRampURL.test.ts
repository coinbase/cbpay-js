import { generateOffRampURL } from './generateOffRampURL';

describe('generateOffRampURL', () => {
  it('generates URL with expected default parameters', () => {
    const url = new URL(
      generateOffRampURL({
        appId: 'test',
        addresses: { '0x1': ['base'] },
        redirectUrl: 'https://example.com',
      }),
    );

    expect(url.origin).toEqual('https://pay.coinbase.com');
    expect(url.pathname).toEqual('/v3/offramp/input');
    expect(url.searchParams.get('appId')).toEqual('test');
    expect(url.searchParams.get('addresses')).toEqual('{"0x1":["base"]}');
    expect(url.searchParams.get('redirectUrl')).toEqual('https://example.com');
  });

  it('generates URL with multiple addresses', () => {
    const addresses = {
      '0x1': ['base', 'ethereum'],
      '123abc': ['solana'],
    };

    const url = new URL(
      generateOffRampURL({
        appId: 'test',
        addresses,
        redirectUrl: 'https://example.com',
      }),
    );

    expect(url.searchParams.get('addresses')).toEqual(
      '{"0x1":["base","ethereum"],"123abc":["solana"]}',
    );
  });

  it('generates URL with multiple addresses and assets', () => {
    const url = new URL(
      generateOffRampURL({
        appId: 'test',
        addresses: {
          '0x5ome4ddre55': ['ethereum', 'avalanche-c-chain'],
          '90123jd09ef09df': ['solana'],
        },
        assets: ['USDC', 'SOL'],
        redirectUrl: 'https://example.com',
      }),
    );

    expect(url.searchParams.get('addresses')).toEqual(
      `{\"0x5ome4ddre55\":[\"ethereum\",\"avalanche-c-chain\"],\"90123jd09ef09df\":[\"solana\"]}`,
    );
    expect(url.searchParams.get('assets')).toEqual('["USDC","SOL"]');
  });

  it('should support dynamic host', () => {
    const url = new URL(
      generateOffRampURL({
        host: 'http://localhost:3000',
        appId: 'test',
        addresses: { '0x1': ['base'] },
        redirectUrl: 'https://example.com',
      }),
    );

    expect(url.origin).toEqual('http://localhost:3000');
    expect(url.pathname).toEqual('/v3/offramp/input');
    expect(url.searchParams.get('appId')).toEqual('test');
  });

  it('should support preset amounts', () => {
    const url = new URL(
      generateOffRampURL({
        appId: 'test',
        addresses: { '0x1': ['base'] },
        redirectUrl: 'https://example.com',
        presetCryptoAmount: 0.1,
        presetFiatAmount: 20,
      }),
    );

    expect(url.searchParams.get('presetFiatAmount')).toEqual('20');
    expect(url.searchParams.get('presetCryptoAmount')).toEqual('0.1');
  });

  it('should support defaultNetwork', () => {
    const url = new URL(
      generateOffRampURL({
        appId: 'test',
        addresses: { '0x1': ['base'] },
        redirectUrl: 'https://example.com',
        defaultNetwork: 'ethereum',
      }),
    );
    expect(url.searchParams.get('defaultNetwork')).toEqual('ethereum');
  });
});
