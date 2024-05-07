import { EventMetadata } from './events';

export type WidgetType = 'buy' | 'checkout';

export type IntegrationType = 'direct' | 'secure_standalone';

export type Experience = 'popup' | 'new_tab';

export type Theme = 'light' | 'dark';

export type CBPayExperienceOptions<T> = {
  widgetParameters: T;
  target?: string;
  appId: string;
  host?: string;
  debug?: boolean;
  theme?: Theme;
  onExit?: (error?: Error) => void;
  onSuccess?: () => void;
  onEvent?: (event: EventMetadata) => void;
  onRequestedUrl?: (url: string) => void;
  closeOnExit?: boolean;
  closeOnSuccess?: boolean;
  experienceLoggedIn?: Experience;
  experienceLoggedOut?: Experience;
};
