import { DEFAULT_HOST } from '../config';
import { OnRampAppParams } from '../types/onramp';
import type { Theme } from '../types/widget';

export type GenerateOnRampURLOptions = {
  /** This & destinationWallets or sessionToken are required. */
  appId?: string;
  host?: string;
  /** This or appId & destinationWallets are required. */
  sessionToken?: string;
  theme?: Theme;
} & OnRampAppParams;

export const generateOnRampURL = ({
  host = DEFAULT_HOST,
  ...props
}: GenerateOnRampURLOptions): string => {
  const url = new URL(host);
  url.pathname = '/buy/select-asset';

  if (props.destinationWallets && props.addresses) {
    throw new Error('Only one of destinationWallets or addresses can be provided');
  } else if (!props.destinationWallets && !props.addresses) {
    throw new Error('One of destinationWallets or addresses must be provided');
  }

  (Object.keys(props) as (keyof typeof props)[]).forEach((key) => {
    const value = props[key];
    if (value !== undefined) {
      if (['string', 'number', 'boolean'].includes(typeof value)) {
        url.searchParams.append(key, value.toString());
      } else {
        url.searchParams.append(key, JSON.stringify(value));
      }
    }
  });

  url.searchParams.sort();

  return url.toString();
};
