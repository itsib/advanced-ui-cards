import { Auth, Connection, HassServiceTarget, MessageBase } from './ha-connection';
import { HassArea, HassDevice, HassEntity, HassEntityState, HassService } from './ha-entity';
import { LovelaceBadgeConfig, LovelaceCardConfig, LovelaceElementConfig, LovelaceHeaderFooterConfig } from './ha-ui';
import { FrontendLocaleData, LocalizeFunc, TranslationCategory, TranslationMetadata } from './ha-locale';

declare global {
  /* eslint-disable no-var, no-redeclare */
  var __DEV__: boolean;
  var __DEMO__: boolean;
  var __BUILD__: 'latest' | 'es5';
  var __VERSION__: string;
  var __STATIC_PATH__: string;
  var __BACKWARDS_COMPAT__: boolean;
  var __SUPERVISOR__: boolean;
  var hassConnection: Promise<{ auth: Auth; conn: Connection }>;
  /* eslint-enable no-var, no-redeclare */

  interface Window {
    // Custom panel entry point url
    customPanelJS: string;
    ShadyCSS: {
      nativeCss: boolean;
      nativeShadow: boolean;
      prepareTemplate(templateElement, elementName, elementExtension);
      styleElement(element);
      styleSubtree(element, overrideProperties);
      styleDocument(overrideProperties);
      getComputedStyleValue(element, propertyName);
    };

    hassConnection: Promise<{ auth: Auth; conn: Connection }>;

    customIcons?: { [key: string]: CustomIconHelpers };

    customIconsets?: { [key: string]: (name: string) => Promise<CustomIcon> };

    loadCardHelpers: () => Promise<CustomCardHelpers>;

    frontendVersion?: string;
  }

  interface HASSDomEvents {
    'config-changed': {
      config: any;
    };
    'hass-more-info': {
      entityId: string | undefined;
    };
    'hass-logout': undefined;
    'hass-api-called': {
      success: boolean;
      response: unknown;
    };
    'll-custom': {
      action: 'fire-dom-event';
    };
  }

  interface FrontendUserData {
    core: CoreFrontendUserData;
    language: FrontendLocaleData;
  }
}

export interface HomeAssistant {
  auth: Auth;
  connection: Connection;
  connected: boolean;
  entities: { [entityId: string]: HassEntity };
  states: { [entityId: string]: HassEntityState };
  devices: { [deviceId: string]: HassDevice };
  areas: { [areaId: string]: HassArea };
  services: {
    [domain: string]: {
      [service_name: string]: HassService;
    };
  };
  config: HassConfig;
  themes: Themes;
  selectedTheme: ThemeSettings | null;
  panels: { [name: string]: PanelInfo };
  panelUrl: string;
  language: string;
  selectedLanguage: string | null;
  locale: FrontendLocaleData;
  resources: { [language: string]: Record<string, string> };
  localize: LocalizeFunc;
  translationMetadata: TranslationMetadata;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  dockedSidebar: 'docked' | 'always_hidden' | 'auto';
  defaultPanel: string;
  moreInfoEntityId: string | null;
  user?: CurrentUser;
  userData?: CoreFrontendUserData | null;
  hassUrl(path?: string): string;
  callService: CallServiceFn;
  callApi: CallApiFn;
  fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>;
  sendWS(msg: MessageBase): void;
  callWS<T>(msg: MessageBase): Promise<T>;
  loadBackendTranslation(category: TranslationCategory, integration?: string | string[], configFlow?: boolean): Promise<LocalizeFunc>;
  loadFragmentTranslation(fragment: string): Promise<LocalizeFunc | undefined>;
}

export type CallServiceFn = (domain: string, service: string, serviceData?: Record<string, any>, target?: HassServiceTarget) => Promise<ServiceCallResponse>;

export type CallApiFn = <T>(method: CallApiMethod, path: string, parameters?: Record<string, any>, headers?: Record<string, string>) => Promise<T>;

export enum CallApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export interface Context {
  id: string;
  user_id: string | null;
  parent_id: string | null;
}

export interface MFAModule {
  id: string;
  name: string;
  enabled: boolean;
}

export interface CurrentUser {
  id: string;
  is_owner: boolean;
  is_admin: boolean;
  name: string;
  credentials: Credential[];
  mfa_modules: MFAModule[];
}

export interface CoreFrontendUserData {
  showAdvanced: boolean;
}

export interface HassConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: {
    length: string;
    mass: string;
    volume: string;
    temperature: string;
    pressure: string;
    wind_speed: string;
    accumulated_precipitation: string;
  };
  location_name: string;
  time_zone: string;
  components: string[];
  config_dir: string;
  allowlist_external_dirs: string[];
  allowlist_external_urls: string[];
  version: string;
  config_source: string;
  safe_mode: boolean;
  state: 'NOT_RUNNING' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'FINAL_WRITE';
  external_url: string | null;
  internal_url: string | null;
  currency: string;
  country: string | null;
  language: string;
}

export interface Themes {
  default_theme: string;
  default_dark_theme: string | null;
  themes: Record<string, Theme>;
  // Currently effective dark mode. Will never be undefined. If user selected "auto"
  // in theme picker, this property will still contain either true or false based on
  // what has been determined via system preferences and support from the selected theme.
  darkMode: boolean;
  // Currently globally active theme name
  theme: string;
}

export interface ThemeVars {
  // Incomplete
  'primary-color': string;
  'text-primary-color': string;
  'accent-color': string;
  [key: string]: string;
}

export type Theme = ThemeVars & {
  modes?: {
    light?: ThemeVars;
    dark?: ThemeVars;
  };
};

export interface ThemeSettings {
  theme: string;
  dark?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export interface PanelInfo<T = Record<string, any> | null> {
  component_name: string;
  config: T;
  icon: string | null;
  title: string | null;
  url_path: string;
}

export interface ServiceCallResponse {
  context: Context;
}

export interface ServiceCallRequest {
  domain: string;
  service: string;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  serviceData?: Record<string, any>;
  target?: HassServiceTarget;
}

export interface ValueChangeEvent<T extends LovelaceCardConfig> extends Event {
  detail: {
    value: T;
  };
}

export interface HASSDomEvent<T> extends Event {
  detail: T;
}

export type ValidHassDomEvent = keyof HASSDomEvents;

export interface IconMeta {
  start: string;
  file: string;
}

export interface CustomIcon {
  path: string;
  viewBox?: string;
}

export interface CustomIconListItem {
  name: string;
  keywords?: string[];
}

export interface CustomIconHelpers {
  getIcon: (name: string) => Promise<CustomIcon>;
  getIconList?: () => Promise<CustomIconListItem[]>;
}

export interface CustomCardHelpers {
  importMoreInfoControl: (type: string) => void;
  createBadgeElement: (config: LovelaceBadgeConfig) => any;
  createCardElement: (config: LovelaceCardConfig) => any;
  createHeaderFooterElement: (config: LovelaceHeaderFooterConfig) => any;
  createHuiElement: (config: LovelaceElementConfig) => any;
  createRowElement: (config: LovelaceHeaderFooterConfig) => any;
}
