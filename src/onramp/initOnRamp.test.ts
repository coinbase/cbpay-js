import { initOnRamp } from './initOnRamp';
import { CBPayInstance } from '../utils/CBPayInstance';

jest.mock('../utils/CBPayInstance');

describe('initOnRamp', () => {
  it('should return CBPayInstance', async () => {
    let instance: unknown;
    initOnRamp(
      {
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup',
        appId: 'abc123',
        widgetParameters: { destinationWallets: [] },
      },
      (_, newInstance) => {
        instance = newInstance;
      },
    );

    expect(CBPayInstance).toHaveBeenCalledTimes(1);

    expect(instance instanceof CBPayInstance).toBe(true);
  });

  // TODO: More tests
});
