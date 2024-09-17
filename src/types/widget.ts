import { EventMetadata } from './events';

export type WidgetType = 'buy' | 'checkout';

export type IntegrationType = 'direct' | 'secure_standalone';

/**
 * Note: Two factor authentication does not work in an iframe, so the embedded experience should not be used. It will
 * be removed in a future release.
 */
export type Experience = 'embedded' | 'popup' | 'new_tab';

export type Theme = 'light' | 'dark';

export type EmbeddedContentStyles = {
  target?: string;
  width?: string;
  height?: string;
  position?: string;
  top?: string;
};

export type CBPayExperienceWithAppId<T> = {
  appId: string;
  sessionToken?: never;
} & CBPayExperienceBaseOptions<T>;

export type CBPayExperienceWithSessionToken<T> = {
  sessionToken: string;
  appId?: never;
} & CBPayExperienceBaseOptions<T>;

type CBPayExperienceBaseOptions<T> = {
  widgetParameters: T;
  target?: string;
  host?: string;
  debug?: boolean;
  theme?: Theme;
  onExit?: (error?: Error) => void;
  onSuccess?: () => void;
  onEvent?: (event: EventMetadata) => void;
  onRequestedUrl?: (url: string) => void;
  closeOnExit?: boolean;
  closeOnSuccess?: boolean;
  embeddedContentStyles?: EmbeddedContentStyles;
  experienceLoggedIn?: Experience;
  experienceLoggedOut?: Experience;
};

export type CBPayExperienceOptions<T> =
  | CBPayExperienceWithAppId<T>
  | CBPayExperienceWithSessionToken<T>;
