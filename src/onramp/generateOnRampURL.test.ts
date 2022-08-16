import { DestinationWallet } from '../types/onramp';
import { generateOnRampURL } from './generateOnRampURL';

describe('generateOnrampURL', () => {
  it('generates URL with empty destination wallets', () => {
    expect(
      generateOnRampURL({
        appId: 'test',
        destinationWallets: [],
      }),
    ).toEqual(`${BASE_URL}?appId=test&${EMPTY_DESTINATION_WALLETS}`);
  });

  it('generates URL with non-empty wallet info', () => {
    const destinationWallets: DestinationWallet[] = [
      {
        address: '0x5ome4ddre55',
        blockchains: ['ethereum', 'avalanche-c-chain'],
        assets: ['APE'],
      },
      {
        address: '90123jd09ef09df',
        blockchains: ['solana'],
      },
    ];

    expect(
      generateOnRampURL({
        appId: 'test',
        destinationWallets,
      }),
    ).toEqual(
      `${BASE_URL}?appId=test&destinationWallets=${encodeURIComponent(
        JSON.stringify({
          '0x5ome4ddre55': ['ethereum', 'avalanche-c-chain', 'APE'],
          '90123jd09ef09df': ['solana'],
        }),
      )}`,
    );
  });

  it('should support dynamic appId', () => {
    expect(generateOnRampURL({ appId: 'foobar', destinationWallets: [] })).toEqual(
      `${BASE_URL}?appId=foobar&${EMPTY_DESTINATION_WALLETS}`,
    );
  });

  it('should support dynamic host', () => {
    expect(
      generateOnRampURL({ appId: 'test', destinationWallets: [], host: 'http://localhost:3000' }),
    ).toEqual(`http://localhost:3000/buy/select-asset?appId=test&${EMPTY_DESTINATION_WALLETS}`);
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

const BASE_URL = 'https://pay.coinbase.com/buy/select-asset';
const EMPTY_DESTINATION_WALLETS = `destinationWallets=${encodeURIComponent(JSON.stringify({}))}`;
