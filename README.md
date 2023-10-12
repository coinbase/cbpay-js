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
  appId: 'your_app_id',
  widgetParameters: {
    destinationWallets: [{
      address: '0xabc123',
      blockchains: ['ethereum', 'avalanche-c-chain'],
    }],
  },
  closeOnExit: true,
  closeOnSuccess: true,
  embeddedContentStyles: {
    target: '#target-area',
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
}

// Initialize the CB Pay instance
let onrampInstance;
const instance = initOnRamp(options, (error, instance) => {
  onrampInstance = instance;
});

// Open the widget when the user clicks a button
onrampInstance.open();

// When button unmounts destroy the instance
onrampInstance.destroy();
```

## React example

```tsx
import type { CBPayInstanceType, InitOnRampParams } from '@coinbase/cbpay-js';
import { initOnRamp } from '@coinbase/cbpay-js';

const PayWithCoinbaseButton: React.FC = () => {
  const [onrampInstance, setOnrampInstance] = useState<CBPayInstanceType | undefined>();

  useEffect(() => {
    initOnRamp({
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
    }, (_, instance) => {
      setOnrampInstance(instance);
    });

    return () => {
      onrampInstance?.destroy();
    };
  }, []);

  const handleClick = () => {
    onrampInstance?.open();
  };

  return <Button onClick={handleClick} disabled={!onrampInstance}>Buy with Coinbase</Button>;
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
      appId: 'your_app_id',
      destinationWallets: [
        {
          address: destinationAddress,
          blockchains: ['solana', 'ethereum'],
        },
      ],
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
Review the [Coinbase Cloud docs](https://docs.cloud.coinbase.com/pay-sdk/) for how to produce the parameters for use within an on ramp aggregator.
```tsx
import type { CBPayInstanceType, InitOnRampParams } from '@coinbase/cbpay-js';
import { initOnRamp } from '@coinbase/cbpay-js';

const PayWithCoinbaseButton: React.FC = () => {
  const [onrampInstance, setOnrampInstance] = useState<CBPayInstanceType | undefined>();

  useEffect(() => {
    initOnRamp({
      appId: 'your_app_id',
      widgetParameters: {
        destinationWallets: [
          {
            address: '0xabc123',
            blockchains: ['ethereum', 'avalanche-c-chain'],
          },
        ],
        // Aggregator params are ignored unless they are all provided.
        // defaultNetwork is the exception - it's optional.
        quoteId: 'quote_id_from_buy_quote_api',
        defaultAsset: 'asset_uuid_from_buy_options_api',
        defaultNetwork: 'network_name_from_buy_options_api',
        defaultPaymentMethod: 'payment_method_from_buy_options_api',
        presetFiatAmount: 50,
        fiatCurrency: 'payment_currency_from_buy_options_api',
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

    return () => {
      onrampInstance?.destroy();
    };
  }, []);

  const handleClick = () => {
    onrampInstance?.open();
  };

  return <Button onClick={handleClick} disabled={!onrampInstance}>Buy with Coinbase</Button>;
};
```


## Contributing

Commit signing is required for contributing to this repo. For details, see the docs on [contributing](./CONTRIBUTING.md) and [commit-signing](./docs/commit-signing.md).
