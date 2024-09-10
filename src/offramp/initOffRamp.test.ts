import { initOffRamp } from './initOffRamp';
import { CBPayInstance } from '../utils/CBPayInstance';

jest.mock('../utils/CBPayInstance');

describe('initOffRamp', () => {
  it('should return CBPayInstance', async () => {
    let instance: unknown;
    initOffRamp(
      {
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup',
        appId: 'abc123',
        widgetParameters: { addresses: { '0x1': ['base'] }, redirectUrl: 'https://example.com' },
      },
      (_, newInstance) => {
        instance = newInstance;
      },
    );

    expect(CBPayInstance).toHaveBeenCalledTimes(1);

    expect(instance instanceof CBPayInstance).toBe(true);
  });
});
