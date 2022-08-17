import { DEFAULT_HOST } from '../config';
import { OnRampAppParams } from '../types/onramp';

export type GenerateOnRampURLOptions = {
  appId: string;
  host?: string;
} & OnRampAppParams;

export const generateOnRampURL = ({
  host = DEFAULT_HOST,
  destinationWallets,
  ...otherParams
}: GenerateOnRampURLOptions): string => {
  const url = new URL(host);
  url.pathname = '/buy/select-asset';

  url.searchParams.append('destinationWallets', JSON.stringify(destinationWallets));

  (Object.keys(otherParams) as (keyof typeof otherParams)[]).forEach((key) => {
    const value = otherParams[key];
    if (value !== undefined) {
      url.searchParams.append(key, value.toString());
    }
  });

  url.searchParams.sort();

  return url.toString();
};
