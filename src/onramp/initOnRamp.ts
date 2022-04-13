import { CBPayExperienceOptions } from '../types/widget';
import { CBPayInstance, CBPayInstanceType } from '../utils/CBPayInstance';
import { DestinationWallet } from '../types/onramp';

type Amount = {
  /** fiat currency code (e.g. USD, EUR) */
  currencySymbol: string;
  value: number;
};

type OnRampAppParams = {
  destinationWallets: DestinationWallet[];
  // TODO: add support for amount
  amount?: Amount;
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
