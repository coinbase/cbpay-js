import { DestinationWallet } from '../types/onramp';
import { generateOnRampURL } from './generateOnRampURL';

describe('generateOnrampURL', () => {
  it('generates URL with empty destination wallets', () => {
    expect(
      generateOnRampURL({
        appId: 'test',
        destinationWallets: [],
      }),
    ).toEqual(`${BASE_URL}?appId=test&${EMPTY_DESTINATION_WALLETS}&${EMPTY_PM_SUPPORTED}`);
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
      )}&${EMPTY_PM_SUPPORTED}`,
    );
  });

  it('should support dynamic appId', () => {
    expect(generateOnRampURL({ appId: 'foobar', destinationWallets: [] })).toEqual(
      `${BASE_URL}?appId=foobar&${EMPTY_DESTINATION_WALLETS}&${EMPTY_PM_SUPPORTED}`,
    );
  });

  it('should support dynamic host', () => {
    expect(
      generateOnRampURL({ appId: 'test', destinationWallets: [], host: 'http://localhost:3000' }),
    ).toEqual(
      `http://localhost:3000/buy/select-asset?appId=test&${EMPTY_DESTINATION_WALLETS}&${EMPTY_PM_SUPPORTED}`,
    );
  });

  it('should support dynamic payment methods', () => {
    expect(
      generateOnRampURL({
        appId: 'test',
        destinationWallets: [],
        paymentMethodsSupported: [{ type: 'debit' }],
      }),
    ).toEqual(
      `${BASE_URL}?appId=test&${EMPTY_DESTINATION_WALLETS}&paymentMethodsSupported=${encodeURIComponent(
        JSON.stringify([{ type: 'debit' }]),
      )}`,
    );
  });
});

const BASE_URL = 'https://pay.coinbase.com/buy/select-asset';
const EMPTY_DESTINATION_WALLETS = `destinationWallets=${encodeURIComponent(JSON.stringify({}))}`;
const EMPTY_PM_SUPPORTED = `paymentMethodsSupported=${encodeURIComponent(JSON.stringify([]))}`;
