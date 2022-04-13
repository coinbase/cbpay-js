import { IntegrationType, Experience } from '../types/widget';
import { DEFAULT_HOST } from '../config';

const BUTTON_PATH = '/embed/button';

type ButtonExperience = Exclude<Experience, 'new_tab'>;

export const createCoinbaseButton = ({
  host = DEFAULT_HOST,
  appId,
  experienceLoggedin = 'embedded',
  experienceLoggedout = 'embedded',
  type = 'direct',
  standaloneTarget,
  width = '262px',
  height = '48px',
}: {
  appId: string;
  host?: string;
  experienceLoggedin?: ButtonExperience;
  experienceLoggedout?: ButtonExperience;
  type?: IntegrationType;
  standaloneTarget?: ButtonExperience;
  width?: string;
  height?: string;
}): HTMLIFrameElement => {
  const iframe = document.createElement('iframe');

  // Styles
  iframe.style.border = 'unset';
  iframe.style.borderWidth = '0';
  iframe.style.width = width.toString();
  iframe.style.height = height.toString();

  // Embed url
  const buttonUrl = new URL(`${host}${BUTTON_PATH}`);
  buttonUrl.searchParams.append('appId', appId);
  buttonUrl.searchParams.append('type', type); //TODO: deprecate
  buttonUrl.searchParams.append('experience_loggedin', experienceLoggedin);
  buttonUrl.searchParams.append('experience_loggedout', experienceLoggedout);
  standaloneTarget && buttonUrl.searchParams.append('target', standaloneTarget); //TODO: deprecate?
  iframe.src = buttonUrl.toString();

  return iframe;
};
