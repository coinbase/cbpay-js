import { DestinationWallet } from '../types/onramp';
import { generateOnRampURL } from './generateOnRampURL';

describe('generateOnrampURL', () => {
  it('generates URL with expected default parameters', () => {
    const url = new URL(
      generateOnRampURL({
        appId: 'test',
        destinationWallets: [],
      }),
    );

    expect(url.origin).toEqual('https://pay.coinbase.com');
    expect(url.pathname).toEqual('/buy/select-asset');
    expect(url.searchParams.get('appId')).toEqual('test');
  });

  it('generates URL with empty destination wallets', () => {
    const url = new URL(
      generateOnRampURL({
        appId: 'test',
        destinationWallets: [],
      }),
    );

    expect(url.searchParams.get('destinationWallets')).toEqual('[]');
  });

  it('generates URL with multiple destination wallet configs', () => {
    const destinationWallets: DestinationWallet[] = [
      {
        address: '0x5ome4ddre55',
        blockchains: ['ethereum', 'avalanche-c-chain'],
        assets: ['APE'],
      },
      {
        address: '0x5ome4ddre55',
        assets: ['MATIC'],
        supportedNetworks: ['polygon'],
      },
      {
        address: '90123jd09ef09df',
        blockchains: ['solana'],
      },
    ];

    const url = new URL(
      generateOnRampURL({
        appId: 'test',
        destinationWallets,
      }),
    );

    expect(url.searchParams.get('destinationWallets')).toEqual(
      `[{\"address\":\"0x5ome4ddre55\",\"blockchains\":[\"ethereum\",\"avalanche-c-chain\"],\"assets\":[\"APE\"]},{\"address\":\"0x5ome4ddre55\",\"assets\":[\"MATIC\"],\"supportedNetworks\":[\"polygon\"]},{\"address\":\"90123jd09ef09df\",\"blockchains\":[\"solana\"]}]`,
    );
  });

  it('should support dynamic host', () => {
    const url = new URL(
      generateOnRampURL({
        host: 'http://localhost:3000',
        appId: 'test',
        destinationWallets: [],
      }),
    );

    expect(url.origin).toEqual('http://localhost:3000');
    expect(url.pathname).toEqual('/buy/select-asset');
    expect(url.searchParams.get('appId')).toEqual('test');
  });

  it('should support preset amounts', () => {
    const url = new URL(
      generateOnRampURL({
        appId: 'test',
        destinationWallets: [],
        presetCryptoAmount: 0.1,
        presetFiatAmount: 20,
      }),
    );

    expect(url.searchParams.get('presetFiatAmount')).toEqual('20');
    expect(url.searchParams.get('presetCryptoAmount')).toEqual('0.1');
  });

  it('should support defaultNetwork', () => {
    const url = new URL(
      generateOnRampURL({
        appId: 'test',
        destinationWallets: [],
        defaultNetwork: 'polygon',
      }),
    );
    expect(url.searchParams.get('defaultNetwork')).toEqual('polygon');
  });
});
