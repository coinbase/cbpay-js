import { initOnRampButton } from './initOnRampButton';

describe('initOnRampButton', () => {
  it('creates coinbase button and embeds it', () => {
    // Create a home for button
    const container = document.createElement('div');
    container.id = 'my-id';
    document.body.appendChild(container);

    initOnRampButton({ ...DEFAULT_ARGS, target: '#my-id' });

    expect(document.querySelector('iframe')).toBeTruthy();
  });

  // TODO: Tests regarding listeners
});

const DEFAULT_ARGS: Parameters<typeof initOnRampButton>[0] = {
  appId: 'abc123',
  destinationWallets: [],
  experienceLoggedin: 'popup',
};
