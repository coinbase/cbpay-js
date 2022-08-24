import { CBPayInstanceType } from 'utils/CBPayInstance';
import { initOnRamp as initOnRampSync, InitOnRampParams } from './es5/initOnRamp';

export const initOnRamp = (options: InitOnRampParams): Promise<CBPayInstanceType> =>
  new Promise((res, rej) => {
    initOnRampSync(options, (error, instance) => {
      if (error) {
        rej(error);
      } else {
        res(instance);
      }
    });
  });
