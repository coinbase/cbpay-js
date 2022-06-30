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

export type OnRampAppParams = {
  /** The destination wallets supported by your application (BTC, ETH, etc). */
  destinationWallets: DestinationWallet[];
  /** The preset input amount as a crypto value. i.e. 0.1 ETH. This will be the initial default for all cryptocurrencies. */
  presetCryptoAmount?: number;
  /**
   * The preset input amount as a fiat value. i.e. 15 USD.
   * This will be the initial default for all cryptocurrencies. Ignored if presetCryptoAmount is also set.
   * Also note this only works for a subset of fiat currencies: USD, CAD, GBP, EUR
   * */
  presetFiatAmount?: number;
};
