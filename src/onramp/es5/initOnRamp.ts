import { CBPayExperienceOptions } from '../../types/widget';
import { CBPayInstance, CBPayInstanceType } from '../../utils/CBPayInstance';
import { OnRampAppParams } from '../../types/onramp';
import { generateOnRampURL } from '../generateOnRampURL';

export type InitOnRampParams = CBPayExperienceOptions<OnRampAppParams>;

export type InitOnRampCallback = (error: Error | undefined, instance: CBPayInstanceType) => void;

export const initOnRamp = (
  {
    experienceLoggedIn = 'embedded', // default experience type
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
    onReady: (error) => {
      callback(error, instance);
    },
    onFallbackOpen: () => {
      const url = generateOnRampURL({
        ...options,
        ...widgetParameters,
      });
      window.open(url);
    },
  });
};
