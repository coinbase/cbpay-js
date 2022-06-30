import { CBPayExperienceOptions } from '../types/widget';
import { CBPayInstance, CBPayInstanceType } from '../utils/CBPayInstance';
import { OnRampAppParams } from '../types/onramp';

export type InitOnRampParams = CBPayExperienceOptions<OnRampAppParams>;

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
