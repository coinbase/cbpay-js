import { parseDestinationWallets } from './parseDestinationWallets';

describe('parseDestinationWallets', () => {
  it('should condense duplicate addresses', () => {
    expect(
      parseDestinationWallets([
        { address: 'abc123', blockchains: ['ethereum'] },
        { address: 'abc123', blockchains: ['solana'] },
      ]),
    ).toEqual({ abc123: ['ethereum', 'solana'] });
  });

  it('should de-duplicate blockchains', () => {
    expect(
      parseDestinationWallets([{ address: 'abc123', blockchains: ['ethereum', 'ethereum'] }]),
    ).toEqual({
      abc123: ['ethereum'],
    });

    expect(
      parseDestinationWallets([
        { address: 'abc123', blockchains: ['ethereum'] },
        { address: 'abc123', blockchains: ['ethereum'] },
      ]),
    ).toEqual({
      abc123: ['ethereum'],
    });
  });

  it('should allow assets', () => {
    expect(
      parseDestinationWallets([
        { address: 'abc123', blockchains: ['ethereum'], assets: ['ETH', 'AVAX'] },
      ]),
    ).toEqual({ abc123: ['ethereum', 'ETH', 'AVAX'] });
  });
});
