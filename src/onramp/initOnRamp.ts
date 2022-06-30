import { CBPayExperienceOptions } from '../types/widget';
import { CBPayInstance, CBPayInstanceType } from '../utils/CBPayInstance';
import { DestinationWallet } from '../types/onramp';

type OnRampAppParams = {
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

type InitOnRampParams = CBPayExperienceOptions<OnRampAppParams>;

export const initOnRamp = ({
  experienceLoggedIn = 'embedded', // default experience type
  widgetParameters,
  ...options
}: InitOnRampParams): CBPayInstanceType => {
  const instance = new CBPayInstance({
    ...options,
    widget: 'buy',
    experienceLoggedIn,
    appParams: widgetParameters,
  });
  return instance;
};
