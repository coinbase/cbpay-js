import { initOnRamp } from './initOnRamp';
import { CBPayInstance } from '../utils/CBPayInstance';

describe('initOnRamp', () => {
  it('should return CBPayInstance', () => {
    const instance = initOnRamp({
      experienceLoggedIn: 'popup',
      experienceLoggedOut: 'popup',
      appId: 'abc123',
      widgetParameters: { destinationWallets: [] },
    });

    expect(instance instanceof CBPayInstance).toBe(true);
  });

  // TODO: More tests
});
