# @coinbase/cbpay-js

The Coinbase Onramp JS SDK contains helper methods to simplify integrating with our fiat onramp. Wallet providers and dapps can leverage Coinbase Onramp and let their users top up their self-custody wallets.

## Documentation

See the [Coinbase Onramp documentation](https://docs.cdp.coinbase.com/onramp/docs/getting-started/) for instructions on how to onboard to Coinbase Onramp and get started.

## Installation

With `yarn`:

```shell
yarn add @coinbase/cbpay-js
```

With `npm`:

```shell
npm install @coinbase/cbpay-js
```

The package is distributed as both ESModules and CommonJS. To use the CommonJS output, the `regenerator-runtime` package will also need to be installed:

With `yarn`:

```shell
yarn add regenerator-runtime
```

With `npm`:

```shell
npm install regenerator-runtime
```

## Basic example

```jsx
import { initOnRamp } from '@coinbase/cbpay-js';

const options = {
  appId: '<Your Project ID obtained from Coinbase Developer Platform>',
  widgetParameters: {
    // Specify the addresses and which networks they support
    addresses: { '0x0': ['ethereum','base'], 'bc1': ['bitcoin']},
    // Filter the available assets on the above networks to just these ones
    assets: ['ETH','USDC','BTC'],
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
};

// Initialize the CB Pay instance
let onrampInstance;
initOnRamp(options, (error, instance) => {
  onrampInstance = instance;
});

// Open the widget when the user clicks a button
onrampInstance.open();
```

## React example

```tsx
import { CBPayInstanceType, initOnRamp } from "@coinbase/cbpay-js";
import { useEffect, useState } from "react";

export const PayWithCoinbaseButton: React.FC = () => {
  const [onrampInstance, setOnrampInstance] = useState<CBPayInstanceType | null>();

  useEffect(() => {
    initOnRamp({
      appId: '<Your Project ID obtained from Coinbase Developer Platform>',
      widgetParameters: {
        // Specify the addresses and which networks they support
        addresses: { '0x0': ['ethereum','base'], 'bc1': ['bitcoin']},
        // Filter the available assets on the above networks to just these ones
        assets: ['ETH','USDC','BTC'],
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
    }, (_, instance) => {
      setOnrampInstance(instance);
    });

    // When button unmounts destroy the instance
    return () => {
      onrampInstance?.destroy();
    };
  }, []);

  const handleClick = () => {
    onrampInstance?.open();
  };

  return <button onClick={handleClick} disabled={!onrampInstance}>Buy with Coinbase</button>;
};
```

## React-Native example

### Prerequisites

``` 
yarn add react-native-url-polyfill
```

```tsx
import React, { useMemo } from 'react'
import { WebView } from 'react-native-webview'
import { generateOnRampURL } from '@coinbase/cbpay-js'
import 'react-native-url-polyfill/auto'

const CoinbaseWebView = ({ currentAmount }) => {
  const coinbaseURL = useMemo(() => {
    const options = {
      appId: '<Your Project ID obtained from Coinbase Developer Platform>',
      // Specify the addresses and which networks they support
      addresses: { '0x0': ['ethereum','base'], 'bc1': ['bitcoin']},
      // Filter the available assets on the above networks to just these ones
      assets: ['ETH','USDC','BTC'],
      handlingRequestedUrls: true,
      presetCryptoAmount: currentAmount,
    }

    return generateOnRampURL(options)
  }, [currentAmount, destinationAddress])

  const onMessage = useCallback((event) => {
    // Check for Success and Error Messages here
    console.log('onMessage', event.nativeEvent.data)
    try {
      const { data } = JSON.parse(event.nativeEvent.data);
      if (data.eventName === 'request_open_url') {
        viewUrlInSecondWebview(data.url);
      }
    } catch (error) {
      console.error(error);
    }
  }, [])

  return (
    <WebView source={{ uri: coinbaseURL }} onMessage={onMessage} />
  )
}

export default CoinbaseWebView
```

## Aggregator Example
Review the [Coinbase Developer docs](https://docs.cdp.coinbase.com/onramp/docs/api-aggregating/) for how to produce the parameters for use within an on ramp aggregator.

```tsx
import { CBPayInstanceType, initOnRamp } from "@coinbase/cbpay-js";
import { useEffect, useState } from "react";

export const PayWithCoinbaseButton: React.FC = () => {
  const [onrampInstance, setOnrampInstance] = useState<CBPayInstanceType | null>();

  useEffect(() => {
    initOnRamp({
      appId: '<Your Project ID obtained from Coinbase Developer Platform>',
      widgetParameters: {
        // Specify the addresses and which networks they support
        addresses: { '0x0': ['ethereum','base'], 'bc1': ['bitcoin']},
        // Filter the available assets on the above networks to just these ones
        assets: ['ETH','USDC','BTC'],
        // Aggregator params are ignored unless they are all provided.
        // defaultNetwork is the exception - it's optional.
        quoteId: '<quote_id from the Buy Quote API>',
        defaultAsset: 'USDC',
        defaultNetwork: 'base',
        defaultPaymentMethod: 'CARD',
        presetFiatAmount: 20,
        fiatCurrency: 'USD',
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
    }, (_, instance) => {
      setOnrampInstance(instance);
    });

    // When button unmounts destroy the instance
    return () => {
      onrampInstance?.destroy();
    };
  }, []);

  const handleClick = () => {
    onrampInstance?.open();
  };

  return <button onClick={handleClick} disabled={!onrampInstance}>Buy with Coinbase</button>;
};
```

## Contributing

Commit signing is required for contributing to this repo. For details, see the docs on [contributing](./CONTRIBUTING.md) and [commit-signing](./docs/commit-signing.md).
