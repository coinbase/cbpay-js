# Initializing the Onramp Embedded experience

This doc describes how to initialize the "OnRamp" experience. 

## Config parameters

| Property                | Type                    | Required | Description                                                                       |
|-------------------------|-------------------------|----------|-----------------------------------------------------------------------------------|
| `appId`                 | `string`                | yes      | Your predefined application ID                                                    |
| `widgetParameters`      | `WidgetParameters`      | yes      | Parameters for the widget. See [WidgetParameters](#widgetparameters) for details. |
| `target`                | `string`                | no       | Target Element to embed button                                                    |
| `onExit`                | `() => void`            | no       | onExit callback                                                                   |
| `onSuccess`             | `() => void`            | no       | onSuccess callback                                                                |
| `onEvent`               | `(metadata) => void`    | no       | onEvent event stream callback                                                     |
| `closeOnExit`           | `boolean`               | no       | Automatically close the experience on exit?                                       |
| `closeOnSuccess`        | `boolean`               | no       | Automatically close the experience on success?                                    |
| `embeddedContentStyles` | `EmbeddedContentStyles` | no       | Customize embedded experience styles                                              |
| `experienceLoggedIn`    | `EmbeddedExperience`    | no       | Experience type when logged in. Defaults to embedded.                             |
| `experienceLoggedOut`   | `EmbeddedExperience`    | no       | Experience type when logged out. Defaults to experienceLoggedIn value.            |

### WidgetParameters

| Property             | Type                  | Required | Description                                                           |
|----------------------|-----------------------|----------|-----------------------------------------------------------------------|
| `destinationWallets` | `DestinationWallet[]` | yes      | The destination wallets supported by your application (BTC, ETH, etc) |

The type of `DestinationWallet` is shown below.

```ts
type SupportedBlockchains = 'ethereum' | 'avalanche-c-chain' | 'solana';

type DestinationWallet = {
  address: string;
  blockchains?: SupportedBlockchains[];
  assets?: string[];
};
```

When specifying a destination wallet, indicate an `address` (the wallet address where funds will be sent), and  either the supported blockchain(s) via the `blockchains` field and/or supported crypto assets (by ticker) via the `assets` field.

For example, if you want to allow all assets from the Solana blockchain and _just_ ETH from the ethereum blockchain, your `destinationWallets` parameter might look like the following:

```ts
const destinationWallets: DestinationWallet[] = [
  {
    address: '0xabc123',
    blockchains: ['solana']
  },
  {
    address: '0xdef456',
    assets: ['ETH']
  }
];
```

## Managing the session lifecycle

### Initialization

Initialize the OnRamp instance when your Coinbase button mounts on the screen. This will set up the widget parameters and listeners for opening and managing the experience.

### Opening the widget

There's two ways to open the widget when the user clicks a button:

1. Use the `target` parameter to attach a listener to the Coinbase button.
2. Use the OnRamp session instance to open and destroy the session.

Both implementations can be seen in the examples below.

### Destroying the session

Make sure to destroy the session when the button/screen unmounts.

> Unintended side effects may occur on subsequent opens if the session is not destroyed properly.

## Basic example usage

```tsx
import { initOnRamp } from '@coinbase/cbpay-js';

const destinationWallets = [
  {
    address: '0x571a6a108adb08f9ca54fe8605280F9EE0eD4AF6',
    blockchains: ['ethereum', 'avalanche-c-chain'],
  },
];

const instance = initOnRamp({
  target: '#button-container',
  appId: 'wallet',
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

```tsx
import { initOnRamp } from '@coinbase/cbpay-js';

export const PayWithCoinbaseButton: React.FC = () => {
  const onRampInstance = useRef();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onRampInstance.current = initOnRamp({
      appId: 'wallet',
      widgetParameters: {
        destinationWallets: [
          {
            address: '0x1A2C69d3F9c41eC5C2875e8b12291F1BB603Fc4a',
            blockchains: ['ethereum', 'avalanche-c-chain'],
          },
        ],
      },
      onReady: () => {
        setIsReady(true);
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
      onRampInstance.current?.destroy();
    };
  }, []);

  const handleClick = () => {
    onRampInstance.current?.open();
  };

  return (
    <Button loading={!isReady} onClick={handleClick}>
      Buy with Coinbase
    </Button>
  );
};
```
