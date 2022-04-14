# @coinbase/cbpay-js

This repository houses the source code for the Coinbase Pay Javascript SDK. This SDK allows third-party partners to integrate with the Coinbase Pay service.

## Installation

To use the Coinbase Pay JS SDK, install the SDK from NPM:

```shell
# yarn
yarn add @coinbase/cbpay-js

# or NPM
npm install @coinbase/cbpay-js
```

## OnRamp Experience

Coinbase Pay provides an "OnRamp" experience for approved partners that allows wallet providers to leverage Coinbase Pay to help their users top up their self-custody wallet.

To launch the OnRamp experience from your app, use the `initOnRamp` method from `@coinbase/cbpay-js`. A simple example is shown below.

```ts
import { initOnRamp } from '@coinbase/cbpay-js';

const destinationWallets = [
  {
    address: '0x571a6a108adb08f9ca54fe8605280F9EE0eD4AF6',
    blockchains: ['ethereum', 'avalanche-c-chain'],
  },
];

const instance = initOnRamp({
  target: '#button-container',
  appId: 'yourAppId', // Provided by the Coinbase Pay team
  widgetParameters: {
    destinationWallets,
  },
  closeOnExit: true,
  closeOnSuccess: true,
});

// When button unmounts destroy the instance
instance.destroy();
```

A more in-depth set of docs for `initOnRamp` can be found in [this doc](./docs/initialization/init-onramp.md).

## Contributing

See [the Contributing doc](./CONTRIBUTING.md) for more information on contributing. Commit signing is required for contributing to this repo – see [this document on commit-signing](./docs/commit-signing.md) for information on getting setup with commit signing.