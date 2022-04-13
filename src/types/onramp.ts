export type SupportedBlockchains = 'ethereum' | 'avalanche-c-chain' | 'solana';

export type DestinationWallet = {
  address: string;
  blockchains?: SupportedBlockchains[];
  assets?: string[];
};
