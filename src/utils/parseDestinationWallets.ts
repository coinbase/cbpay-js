import { DestinationWallet } from '../types/onramp';

// Returns shape {"0x1A2C69d3F9...":["blockchain:ETH", "blockchain:AVAX"]}
export function parseDestinationWallets(wallets: DestinationWallet[]): Record<string, string[]> {
  // Build the address:blockchain[] mapping, no deduplication
  const map = wallets.reduce<Record<string, string[]>>(
    (prev, { address, blockchains, assets }: DestinationWallet) => {
      prev[address] = (prev[address] || []).concat(blockchains || []).concat(assets || []);
      return prev;
    },
    {},
  );

  // Deduplicate the map values
  Object.entries(map).forEach(([address, blockchains]) => {
    map[address] = [...new Set(blockchains)];
  });

  return map;
}
