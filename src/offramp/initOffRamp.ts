import { CBPayExperienceOptions } from '../types/widget';
import { CBPayInstance, CBPayInstanceType } from '../utils/CBPayInstance';
import { OffRampAppParams } from '../types/offramp';

export type InitOffRampParams = CBPayExperienceOptions<OffRampAppParams>;

export type InitOffRampCallback = {
  (error: Error, instance: null): void;
  (error: null, instance: CBPayInstanceType): void;
};

export const initOffRamp = (
  {
    experienceLoggedIn = 'new_tab', // default experience type
    widgetParameters,
    ...options
  }: InitOffRampParams,
  callback: InitOffRampCallback,
): void => {
  const instance = new CBPayInstance({
    ...options,
    widget: 'sell',
    experienceLoggedIn,
    appParams: widgetParameters,
  });
  callback(null, instance);
};
