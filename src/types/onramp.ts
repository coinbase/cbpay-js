export type DestinationWallet = {
  /**
   * Destination address where the purchased assets will be sent for the assets/networks listed in the other fields.
   */
  address: string;
  /**
   * List of networks enabled for the associated address. For any networks in this field, the user will be able to
   * buy/send any asset that is supported on this network.
   *
   * If you only want to support a subset of assets, leave this empty and use the assets field instead.
   */
  blockchains?: string[];
  /**
   * List of assets enabled for the associated address. If blockchains is non-empty, these assets will be available in
   * addition to all assets supported by the networks in the blockchains field. If blockchains is empty, only these
   * asset will be available.
   */
  assets?: string[];
  /**
   * Restrict the networks available for assets in the assets field. If the blockchains field is empty, only these
   * networks will be available. Otherwise these networks will be available in addition to the networks in blockchains.
   */
  supportedNetworks?: string[];
};

export type OnRampExperience = 'buy' | 'send';

type BaseOnRampAppParams = {
  /**
   * @deprecated Please use the addresses and assets params instead. This parameter will be removed in a future release.
   *
   * This parameter controls which crypto assets your user will be able to buy/send, which wallet address their asset
   * will be delivered to, and which networks their assets will be delivered on. If this parameter is not provided, the
   * {addresses} param must be provided.
   *
   * Some common examples:
   *
   * Support all assets that are available for sending on the base network, only on the base network:
   *
   * `[{ address: "0x1", blockchains: ["base"] }]`
   *
   * Support only USDC on either the base network or the ethereum network:
   *
   * `[{ address: "0x1", assets: ["USDC"], supportedNetworks: ["base", "ethereum"] }]`
   *
   */
  destinationWallets?: DestinationWallet[];
  /**
   * The addresses parameter is a simpler way to provide the addresses customers funds should be delivered to. One of
   * either {addresses} or {destinationWallets} must be provided.
   *
   * Each entry in the record represents a wallet address and the networks it is valid for. There should only be a
   * single address for each network your app supports. Users will be able to buy/send any asset supported by any of
   * the networks you specify. See the assets param if you want to restrict the avaialable assets.
   *
   * Some common examples:
   *
   * Support all assets that are available for sending on the base network, only on the base network:
   *
   * `{ "0x1": ["base"] }`
   */
  addresses?: Record<string, string[]>;
  /**
   * This optional parameter will restrict the assets available for the user to buy/send. It acts as a filter on the
   * networks specified in the {addresses} param.
   *
   * Some common examples:
   *
   * Support only USDC on either the base network or the ethereum network:
   *
   * `addresses: { "0x1": ["base", "ethereum"] }, assets: ["USDC"]`
   *
   * The values in this list can either be asset symbols like BTC, ETH, or asset UUIDs that you can get from the Buy
   * Options API {@link https://docs-cdp-onramp-preview.cbhq.net/onramp/docs/api-configurations/#buy-options}.
   */
  assets?: string[];
  /** The preset input amount as a crypto value. i.e. 0.1 ETH. This will be the initial default for all cryptocurrencies. */
  presetCryptoAmount?: number;
  /**
   * The preset input amount as a fiat value. i.e. 15 USD.
   * This will be the initial default for all cryptocurrencies. Ignored if presetCryptoAmount is also set.
   * Also note this only works for a subset of fiat currencies: USD, CAD, GBP, EUR
   * */
  presetFiatAmount?: number;
  /** The default network that should be selected when multiple networks are present. */
  defaultNetwork?: string;
  /** The default experience the user should see: either transfer funds from Coinbase (`'send'`) or buy them (`'buy'`). */
  defaultExperience?: OnRampExperience;
  handlingRequestedUrls?: boolean;
  /** ID used to link all user transactions created during the session. */
  partnerUserId?: string;
};

export type OnRampAggregatorAppParams = {
  quoteId: string;
  defaultAsset: string;
  defaultNetwork?: string;
  defaultPaymentMethod: string;
  presetFiatAmount: number;
  fiatCurrency: string;
};

export type OnRampAppParams =
  | BaseOnRampAppParams
  | (BaseOnRampAppParams & OnRampAggregatorAppParams);
