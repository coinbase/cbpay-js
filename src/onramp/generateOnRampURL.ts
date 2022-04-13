import { DEFAULT_HOST } from '../config';
import { DestinationWallet } from '../types/onramp';
import { parseDestinationWallets } from '../utils/parseDestinationWallets';

export const generateOnRampURL = ({
  appId,
  destinationWallets,
  paymentMethodsSupported = [],
  host = DEFAULT_HOST,
}: {
  appId: string;
  destinationWallets: DestinationWallet[];
  paymentMethodsSupported?: { type: string }[];
  host?: string;
}): string => {
  const url = new URL(host);
  url.pathname = '/buy/select-asset';

  url.searchParams.append('appId', appId);
  url.searchParams.append(
    'destinationWallets',
    JSON.stringify(parseDestinationWallets(destinationWallets)),
  );
  url.searchParams.append('paymentMethodsSupported', JSON.stringify(paymentMethodsSupported));

  return url.toString();
};
