export type SupportedBlockchains =
  | 'algorand'
  | 'avalanche-c-chain'
  | 'bitcoin'
  | 'bitcoin-cash'
  | 'cardano'
  | 'celo'
  | 'cosmos'
  | 'dash'
  | 'dfinity'
  | 'dogecoin'
  | 'eos'
  | 'ethereum'
  | 'ethereum-classic'
  | 'filecoin'
  | 'horizen'
  | 'litecoin'
  | 'polkadot'
  | 'solana'
  | 'stellar'
  | 'tezos'
  | 'zcash';

export type DestinationWallet = {
  address: string;
  blockchains?: SupportedBlockchains[];
  assets?: string[];
};
