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
    this.options = options;
    this.pixel = new CoinbasePixel({
      ...options,
      appParams: {
        widget: options.widget,
        ...options.appParams,
      },
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
      onRequestedUrl,
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
      onRequestedUrl,
      onEvent,
    });
  };

  public destroy = (): void => {
    this.pixel.destroy();
  };
}
