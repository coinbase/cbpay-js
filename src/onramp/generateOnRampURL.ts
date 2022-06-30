import { DEFAULT_HOST } from '../config';
import { OnRampAppParams } from '../types/onramp';
import { parseDestinationWallets } from '../utils/parseDestinationWallets';

export type GenerateOnRampURLOptions = {
  appId: string;
  host?: string;
} & OnRampAppParams;

export const generateOnRampURL = ({
  appId,
  host = DEFAULT_HOST,
  destinationWallets,
  presetFiatAmount,
  presetCryptoAmount,
}: GenerateOnRampURLOptions): string => {
  const url = new URL(host);
  url.pathname = '/buy/select-asset';

  url.searchParams.append('appId', appId);
  url.searchParams.append(
    'destinationWallets',
    JSON.stringify(parseDestinationWallets(destinationWallets)),
  );

  if (presetFiatAmount) {
    url.searchParams.append('presetFiatAmount', presetFiatAmount?.toString());
  }
  if (presetCryptoAmount) {
    url.searchParams.append('presetCryptoAmount', presetCryptoAmount?.toString());
  }

  return url.toString();
};
