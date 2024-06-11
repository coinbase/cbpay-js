import { CBPayExperienceOptions } from '../types/widget';
import { CBPayInstance, CBPayInstanceType } from '../utils/CBPayInstance';
import { OnRampAppParams } from '../types/onramp';

export type InitOnRampParams = CBPayExperienceOptions<OnRampAppParams>;

export type InitOnRampCallback = {
  (error: Error, instance: null): void;
  (error: null, instance: CBPayInstanceType): void;
};

export const initOnRamp = (
  {
    experienceLoggedIn = 'new_tab', // default experience type
    widgetParameters,
    ...options
  }: InitOnRampParams,
  callback: InitOnRampCallback,
): void => {
  const instance = new CBPayInstance({
    ...options,
    widget: 'buy',
    experienceLoggedIn,
    appParams: widgetParameters,
  });
  callback(null, instance);
};
