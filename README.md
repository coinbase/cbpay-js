# @coinbase/cbpay-js

This repository houses the source code for the Coinbase Pay Javascript SDK. This SDK allows third-party partners to integrate with the Coinbase Pay service.

## Basic Usage

Start by installing the SDK from NPM (NOTE: this is not yet public, so this call will fail):

```shell
# yarn
yarn add @coinbase/pay

# or NPM
npm install @coinbase/pay
```

Then, you can import and call various methods from the `@coinbase/pay` package.

```ts
import { openBuyStandalone } from '@coinbase/pay';

// ...

openBuyStandalone({
  appId: 'yourAppId',
  destinationWallets: [
    { address: '0x123456789', blockchains: ['ETH'] }
  ]
});
```