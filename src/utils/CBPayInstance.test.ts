import { CBPayInstance } from './CBPayInstance';

describe('CBPayInstance', () => {
  it('creating CBPayInstance instance should be ok', () => {
    new CBPayInstance(DEFAULT_ARGS);
  });

  // TODO: Plenty of more tests we _should_ add here (regarding events/messaging/etc)
});

const DEFAULT_ARGS: ConstructorParameters<typeof CBPayInstance>[0] = {
  appId: 'abc123',
  appParams: {},
  widget: 'buy',
  experienceLoggedIn: 'popup',
  experienceLoggedOut: 'popup',
};
