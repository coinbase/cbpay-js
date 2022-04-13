import { JsonObject } from 'types/JsonTypes';
import { CBPayExperienceOptions, Experience, WidgetType } from 'types/widget';
import { CoinbasePixel } from './CoinbasePixel';

export type InternalExperienceOptions = Omit<
  CBPayExperienceOptions<JsonObject>,
  'widgetParameters'
> & {
  widget: WidgetType;
  experienceLoggedIn: Experience; // Required
};

export type CBPayInstanceConstructorArguments = {
  appParams: JsonObject;
} & InternalExperienceOptions;

const widgetRoutes: Record<WidgetType, string> = {
  buy: '/buy',
  checkout: '/checkout',
};

export interface CBPayInstanceType {
  open: () => void;
  destroy: () => void;
}

export class CBPayInstance implements CBPayInstanceType {
  private pixel: CoinbasePixel;
  private options: InternalExperienceOptions;

  constructor(options: CBPayInstanceConstructorArguments) {
    const appParams = {
      widget: options.widget,
      ...options.appParams,
    };

    this.options = options;
    this.pixel = new CoinbasePixel({
      host: options.host,
      appId: options.appId,
      appParams,
      onReady: options.onReady,
    });

    if (options.target) {
      const targetElement = document.querySelector(options.target);
      if (targetElement) {
        targetElement.addEventListener('click', this.open);
      }
    }
  }

  public open = (): void => {
    const {
      widget,
      experienceLoggedIn,
      experienceLoggedOut,
      embeddedContentStyles,
      onExit,
      onSuccess,
      onEvent,
      closeOnSuccess,
      closeOnExit,
    } = this.options;

    this.pixel.openExperience({
      path: widgetRoutes[widget],
      experienceLoggedIn,
      experienceLoggedOut,
      embeddedContentStyles,
      onExit: () => {
        onExit?.();
        if (closeOnExit) {
          this.pixel.endExperience();
        }
      },
      onSuccess: () => {
        onSuccess?.();
        if (closeOnSuccess) {
          this.pixel.endExperience();
        }
      },
      onEvent,
    });
  };

  public destroy = (): void => {
    this.pixel.destroy();
  };
}
