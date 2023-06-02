import { CBPayExperienceOptions } from '../types/widget';
import { CBPayInstance, CBPayInstanceType } from '../utils/CBPayInstance';
import { OnRampAppParams } from '../types/onramp';
import { generateOnRampURL } from './generateOnRampURL';

export type InitOnRampParams = CBPayExperienceOptions<OnRampAppParams>;

export type InitOnRampCallback = {
  (error: Error, instance: null): void;
  (error: null, instance: CBPayInstanceType): void;
};

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
      if (error) {
        callback(error, null);
      } else {
        callback(null, instance);
      }
    },
    onFallbackOpen: () => {
      const url = generateOnRampURL({
        appId: options.appId,
        host: options.host,
        ...widgetParameters,
      });
      window.open(url);
    },
  });
};
