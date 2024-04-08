import { DEFAULT_HOST } from '../config';
import { OnRampAppParams } from '../types/onramp';
import type { Theme } from '../types/widget';

export type GenerateOnRampURLOptions = {
  /** This & destinationWallets or sessionToken are required. */
  appId?: string;
  destinationWallets?: OnRampAppParams['destinationWallets'];
  host?: string;
  /** This or appId & destinationWallets are required. */
  sessionToken?: string;
  theme?: Theme;
} & Omit<OnRampAppParams, 'destinationWallets'>;

export const generateOnRampURL = ({
  host = DEFAULT_HOST,
  destinationWallets,
  ...otherParams
}: GenerateOnRampURLOptions): string => {
  const url = new URL(host);
  url.pathname = '/buy/select-asset';

  if (destinationWallets !== undefined) {
    url.searchParams.append('destinationWallets', JSON.stringify(destinationWallets));
  }
  (Object.keys(otherParams) as (keyof typeof otherParams)[]).forEach((key) => {
    const value = otherParams[key];
    if (value !== undefined) {
      url.searchParams.append(key, value.toString());
    }
  });

  url.searchParams.sort();

  return url.toString();
};
