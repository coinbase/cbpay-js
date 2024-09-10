export type BaseOffRampAppParams = {
  /**
   *
   * Each entry in the record represents a wallet address and the networks it is valid for. There should only be a
   * single address for each network your app supports. Users will be able to cash out any owned assets supported by any of
   * the networks you specify. See the assets parameter if you want to restrict the available assets.
   *
   * Some common examples:
   *
   * Show all assets users have on the base network, only on the base network:
   *
   * `{ "0x1": ["base"] }`
   */
  addresses?: Record<string, string[]>;
  /** A URL that the user will be redirected to after to sign their transaction after the transaction has been committed. */
  redirectUrl?: string;
  /**
   * This optional parameter will restrict the assets available for the user to cash out. It acts as a filter on the
   * networks specified in the {addresses} param.
   *
   * Some common examples:
   *
   * Support only USDC on either the base network or the ethereum network:
   *
   * `addresses: { "0x1": ["base", "ethereum"] }, assets: ["USDC"]`
   *
   */
  assets?: string[];
  /** The default network that should be selected when multiple networks are present. */
  defaultNetwork?: string;
  /** The preset input amount as a crypto value. i.e. 0.1 ETH. */
  presetCryptoAmount?: number;
  /**
   * The preset input amount as a fiat value. i.e. 15 USD.
   * Ignored if presetCryptoAmount is also set.
   * Also note this only works for a subset of fiat currencies: USD, CAD, GBP, EUR
   * */
  presetFiatAmount?: number;
  /** ID used to link all user transactions created during the session. */
  partnerUserId?: string;
};

export type OffRampAggregatorAppParams = {
  quoteId: string;
  defaultAsset: string;
  defaultNetwork?: string;
  defaultDepositMethod: string; // "CRYPTO_ACCOUNT" | "FIAT_WALLET" | "CARD" | "ACH_BANK_ACCOUNT" | "PAYPAL"
  presetFiatAmount: number;
  fiatCurrency: string;
};

export type OffRampAppParams =
  | BaseOffRampAppParams
  | (BaseOffRampAppParams & OffRampAggregatorAppParams);
