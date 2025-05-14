export type LogType = 'create' | 'remove' | 'attribute' | 'subscribe';

export interface HomeAssistant {
  connected: boolean;
  states: Record<string, any>;
  entities: Record<string, any>;
  devices: Record<string, any>;
  areas: Record<string, any>;
  floors: Record<string, any>;
  services: any;
  config: any;
  themes: any;
  selectedTheme: any | null;
  resources: any;
  localize: any;
  translationMetadata: any;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  debugConnection: boolean;
  dockedSidebar: 'docked' | 'always_hidden' | 'auto';
  defaultPanel: string;
  moreInfoEntityId: string | null;
  user?: any;
  userData?: any | null;

  hassUrl(path?: string): string;

  callService(
    domain: string,
    service: string,
    serviceData?: any,
    target?: any,
    notifyOnError?: boolean,
    returnResponse?: boolean,
  ): Promise<any>;

  callApi<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    parameters?: Record<string, any>,
    headers?: Record<string, string>,
  ): Promise<T>;

  callApiRaw( // introduced in 2024.11
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    parameters?: Record<string, any>,
    headers?: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<Response>;

  fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>;



  formatEntityState(stateObj: any, state?: string): string;

  formatEntityAttributeValue(
    stateObj: any,
    attribute: string,
    value?: any,
  ): string;

  formatEntityAttributeName(stateObj: any, attribute: string): string;
}

export interface BrandResolverConfig {
  hass: HomeAssistant;
  root: HTMLElement | ShadowRoot;
  images: ReplacementImages;
  debug?: boolean;
}

export type ReplacementImages = { [domain: string]: string };