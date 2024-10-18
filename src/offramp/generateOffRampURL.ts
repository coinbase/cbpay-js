import { OffRampAppParams } from 'types/offramp';
import { DEFAULT_HOST } from '../config';
import type { Theme } from '../types/widget';

export type GenerateOffRampURLOptions = {
  /** This & addresses or sessionToken are required. */
  appId?: string;
  host?: string;
  theme?: Theme;
  /** This or appId & addresses are required. */
  sessionToken?: string;
} & OffRampAppParams;

export const generateOffRampURL = ({
  host = DEFAULT_HOST,
  ...props
}: GenerateOffRampURLOptions): string => {
  const url = new URL(host);
  url.pathname = '/v3/sell/input';

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
