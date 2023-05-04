import { EventMetadata } from './events';

export type WidgetType = 'buy' | 'checkout';

export type IntegrationType = 'direct' | 'secure_standalone';

export type Experience = 'embedded' | 'popup' | 'new_tab';

export type EmbeddedContentStyles = {
  target?: string;
  width?: string;
  height?: string;
  position?: string;
  top?: string;
};

export type CBPayExperienceOptions<T> = {
  widgetParameters: T;
  target?: string;
  appId: string;
  host?: string;
  debug?: boolean;
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
