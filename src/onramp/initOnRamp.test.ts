import { initOnRamp } from './initOnRamp';
import { CBPayInstance } from '../utils/CBPayInstance';

describe('initOnRamp', () => {
  it('should return CBPayInstance', () => {
    let instance: unknown;
    initOnRamp(
      {
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup',
        appId: 'abc123',
        widgetParameters: { destinationWallets: [] },
      },
      (_, i) => {
        instance = i;
      },
    );

    expect(instance instanceof CBPayInstance).toBe(true);
  });

  // TODO: More tests
});
