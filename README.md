# @coinbase/cbpay-js

The Coinbase Pay JS SDK provides a fiat onramp experience for approved partners. Wallet providers and dapps can leverage Coinbase Pay and let their users top up their self-custody wallets.

## Documentation

See the [Coinbase Pay documentation](https://docs.cloud.coinbase.com/pay-sdk) for configuration options. Developers interested in using Coinbase Pay will need to contact the Coinbase Pay team to get their domains/extension IDs added to the Coinbase Pay allowlist. Please contact the Coinbase Pay team by filling [this form](https://www.coinbase.com/cloud/cloud-interest) and selecting “Coinbase Pay SDK” in the product dropdown menu.

## Installation

With `yarn`:

```shell
yarn add @coinbase/cbpay-js
```

With `npm`:

```shell
npm install @coinbase/cbpay-js
```

## Basic example

```jsx
import { initOnramp } from '@coinbase/cbpay-js';

const destinationWallets = [
  {
    address: '0xabc123',
    blockchains: ['ethereum', 'avalanche-c-chain'],
  },
];

const instance = initOnramp({
  target: '#button-container',
  appId: 'your_app_id',
  widgetParameters: {
    destinationWallets,
  },
  onExit: () => {
    alert('On Exit');
  },
  onSuccess: () => {
    alert('On Success');
  },
  onEvent: (metadata) => {
    console.log(metadata);
  },
  closeOnExit: true,
  closeOnSuccess: true,
  embeddedContentStyles: {
    top: '100px',
    width: '50%',
  },
});

// When button unmounts destroy the instance
instance.destroy();
```

## React example

```jsx
import { initOnramp } from '@coinbase/cbpay-js';

const PayWithCoinbaseButton: React.FC = () => {
  const onrampInstance = useRef();

  useEffect(() => {
    onrampInstance.current = initOnramp({
      appId: 'your_app_id',
      widgetParameters: {
        destinationWallets: [
          {
            address: '0xabc123',
            blockchains: ['ethereum', 'avalanche-c-chain'],
          },
        ],
      },
      onSuccess: () => {
        console.log('success');
      },
      onExit: () => {
        console.log('exit');
      },
      onEvent: (event) => {
        console.log('event', event);
      },
      experienceLoggedIn: 'popup',
      experienceLoggedOut: 'popup',
      closeOnExit: true,
      closeOnSuccess: true,
    });

    return () => {
      onrampInstance.current?.destroy();
    };
  }, []);

  const handleClick = () => {
    onrampInstance.current?.open();
  };

  return <Button onClick={handleClick}>Buy with Coinbase</Button>;
};
```

## Contributing

Commit signing is required for contributing to this repo. For details, see the docs on [contributing](./CONTRIBUTING.md) and [commit-signing](./docs/commit-signing.md).
