import { Auth, Connection, MessageBase } from './ha-connection';
import { HassEntities, HassEntity, HassEntityAttributeBase, HassEntityBase, HassServices } from './ha-entity';
import { type LovelaceCard, LovelaceCardConfig } from './ha-ui';
import { FrontendLocaleData, LocalizeFunc, TranslationCategory, TranslationMetadata } from './ha-locale';
import type { LitElement } from 'lit';
import type { ActionConfig, HassServiceTarget } from './ha-actions';
import { CustomCardHelpers } from './ha-helper';
import { ShowToastParams } from '../utils/show-toast';
import { IButtonConfigSchema } from './schemas';

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

  // Allowed types are from iOS HIG.
// https://developer.apple.com/design/human-interface-guidelines/ios/user-interaction/feedback/#haptics
// Implementors on platforms other than iOS should attempt to match the patterns (shown in HIG) as closely as possible.
  export type HapticType =
    | 'success'
    | 'warning'
    | 'failure'
    | 'light'
    | 'medium'
    | 'heavy'
    | 'selection';

  export interface ConfigChangedEvent {
    config: any;
    error?: string;
    guiModeAvailable?: boolean;
  }

  interface HASSDomEvents {
    'value-changed': {
      value: unknown;
    };
    dismiss: any,
    change: any;
    'hass-logout': undefined;
    'config-refresh': undefined;
    'config-changed': ConfigChangedEvent;
    'hass-api-called': {
      success: boolean;
      response: unknown;
    };
    'hass-more-info': {
      entityId: string;
    };
    'll-custom': ActionConfig;
    haptic: HapticType;
    'hass-notification': ShowToastParams;
    'buttons-changed': {
      buttons: IButtonConfigSchema[];
    }
  }

  interface FrontendUserData {
    core: CoreFrontendUserData;
    language: FrontendLocaleData;
  }

  interface GlobalEventHandlersEventMap {
    haptic: HASSDomEvent<HapticType>;
  }
}

export interface ExternalConfig {
  hasSettingsScreen: boolean;
  hasSidebar: boolean;
  canWriteTag: boolean;
  hasExoPlayer: boolean;
  canCommissionMatter: boolean;
  canImportThreadCredentials: boolean;
  canTransferThreadCredentialsToKeychain: boolean;
  hasAssist: boolean;
  hasBarCodeScanner: number;
  canSetupImprov: boolean;
  downloadFileSupported: boolean;
}

export interface EMMessage {
  id?: number;
  type: string;
}

interface EMError {
  code: string;
  message: string;
}

interface CommandInFlight {
  resolve: (data: any) => void;
  reject: (err: EMError) => void;
}

interface EMMessageResultSuccess {
  id: number;
  type: 'result';
  success: true;
  result: unknown;
}

interface EMMessageResultError {
  id: number;
  type: 'result';
  success: false;
  error: EMError;
}

interface EMOutgoingMessageConfigGet extends EMMessage {
  type: 'config/get';
}

interface EMOutgoingMessageBarCodeScan extends EMMessage {
  type: 'bar_code/scan';
  payload: {
    title: string;
    description: string;
    alternative_option_label?: string;
  };
}

interface EMOutgoingMessageBarCodeClose extends EMMessage {
  type: 'bar_code/close';
}

interface EMOutgoingMessageBarCodeNotify extends EMMessage {
  type: 'bar_code/notify';
  payload: {
    message: string;
  };
}

interface EMOutgoingMessageMatterCommission extends EMMessage {
  type: 'matter/commission';
  payload?: {
    mac_extended_address: string | null;
    extended_pan_id: string | null;
    border_agent_id: string | null;
    active_operational_dataset: string | null;
  };
}

interface EMOutgoingMessageImportThreadCredentials extends EMMessage {
  type: 'thread/import_credentials';
}

interface EMOutgoingMessageWithAnswer {
  'config/get': {
    request: EMOutgoingMessageConfigGet;
    response: ExternalConfig;
  };
}

interface EMOutgoingMessageExoplayerPlayHLS extends EMMessage {
  type: 'exoplayer/play_hls';
  payload: {
    url: string;
    muted: boolean;
  };
}

interface EMOutgoingMessageExoplayerResize extends EMMessage {
  type: 'exoplayer/resize';
  payload: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

interface EMOutgoingMessageExoplayerStop extends EMMessage {
  type: 'exoplayer/stop';
}

interface EMOutgoingMessageThemeUpdate extends EMMessage {
  type: 'theme-update';
}

interface EMOutgoingMessageHaptic extends EMMessage {
  type: 'haptic';
  payload: { hapticType: string };
}

interface EMOutgoingMessageConnectionStatus extends EMMessage {
  type: 'connection-status';
  payload: { event: string };
}

interface EMOutgoingMessageAppConfiguration extends EMMessage {
  type: 'config_screen/show';
}

interface EMOutgoingMessageTagWrite extends EMMessage {
  type: 'tag/write';
  payload: {
    name: string | null;
    tag: string;
  };
}

interface EMOutgoingMessageSidebarShow extends EMMessage {
  type: 'sidebar/show';
}

interface EMOutgoingMessageAssistShow extends EMMessage {
  type: 'assist/show';
  payload?: {
    pipeline_id: 'preferred' | 'last_used' | string;
    start_listening: boolean;
  };
}

interface EMOutgoingMessageImprovScan extends EMMessage {
  type: 'improv/scan';
}

interface EMOutgoingMessageImprovConfigureDevice extends EMMessage {
  type: 'improv/configure_device';
  payload: {
    name: string;
  };
}

interface EMOutgoingMessageThreadStoreInPlatformKeychain extends EMMessage {
  type: 'thread/store_in_platform_keychain';
  payload: {
    mac_extended_address: string | null;
    border_agent_id: string | null;
    active_operational_dataset: string;
    extended_pan_id: string;
  };
}

type EMOutgoingMessageWithoutAnswer =
  | EMMessageResultError
  | EMMessageResultSuccess
  | EMOutgoingMessageAppConfiguration
  | EMOutgoingMessageAssistShow
  | EMOutgoingMessageBarCodeClose
  | EMOutgoingMessageBarCodeNotify
  | EMOutgoingMessageBarCodeScan
  | EMOutgoingMessageConnectionStatus
  | EMOutgoingMessageExoplayerPlayHLS
  | EMOutgoingMessageExoplayerResize
  | EMOutgoingMessageExoplayerStop
  | EMOutgoingMessageHaptic
  | EMOutgoingMessageImportThreadCredentials
  | EMOutgoingMessageMatterCommission
  | EMOutgoingMessageSidebarShow
  | EMOutgoingMessageTagWrite
  | EMOutgoingMessageThemeUpdate
  | EMOutgoingMessageThreadStoreInPlatformKeychain
  | EMOutgoingMessageImprovScan
  | EMOutgoingMessageImprovConfigureDevice;

interface EMIncomingMessageRestart {
  id: number;
  type: 'command';
  command: 'restart';
}

interface EMIncomingMessageShowNotifications {
  id: number;
  type: 'command';
  command: 'notifications/show';
}

interface EMIncomingMessageToggleSidebar {
  id: number;
  type: 'command';
  command: 'sidebar/toggle';
}

interface EMIncomingMessageShowSidebar {
  id: number;
  type: 'command';
  command: 'sidebar/show';
}

export interface AutomationEntity extends HassEntityBase {
  attributes: HassEntityAttributeBase & {
    id?: string;
    last_triggered: string;
  };
}

export interface EMIncomingMessageBarCodeScanResult {
  id: number;
  type: 'command';
  command: 'bar_code/scan_result';
  payload: {
    // A string decoded from the barcode data.
    rawValue: string;
    // https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API#supported_barcode_formats
    format:
      | 'aztec'
      | 'code_128'
      | 'code_39'
      | 'code_93'
      | 'codabar'
      | 'data_matrix'
      | 'ean_13'
      | 'ean_8'
      | 'itf'
      | 'pdf417'
      | 'qr_code'
      | 'upc_a'
      | 'upc_e'
      | 'unknown';
  };
}

export interface EMIncomingMessageBarCodeScanAborted {
  id: number;
  type: 'command';
  command: 'bar_code/aborted';
  payload: {
    reason: 'canceled' | 'alternative_options';
  };
}

export interface ImprovDiscoveredDevice {
  name: string;
}

interface EMIncomingMessageImprovDeviceDiscovered extends EMMessage {
  id: number;
  type: 'command';
  command: 'improv/discovered_device';
  payload: ImprovDiscoveredDevice;
}

interface EMIncomingMessageImprovDeviceSetupDone extends EMMessage {
  id: number;
  type: 'command';
  command: 'improv/device_setup_done';
}

export type EMIncomingMessageCommands =
  | EMIncomingMessageRestart
  | EMIncomingMessageShowNotifications
  | EMIncomingMessageToggleSidebar
  | EMIncomingMessageShowSidebar
  | EMIncomingMessageBarCodeScanResult
  | EMIncomingMessageBarCodeScanAborted
  | EMIncomingMessageImprovDeviceDiscovered
  | EMIncomingMessageImprovDeviceSetupDone;

type EMIncomingMessage =
  | EMMessageResultSuccess
  | EMMessageResultError
  | EMIncomingMessageCommands;

type EMIncomingMessageHandler = (msg: EMIncomingMessageCommands) => boolean;

export interface ExternalMessaging {
  config: ExternalConfig;

  commands: Record<number, CommandInFlight>;

  msgId: number;

  attach(): Promise<void>;

  addCommandHandler(handler: EMIncomingMessageHandler): void;

  /**
   * Send message to external app that expects a response.
   * @param msg message to send
   */
  sendMessage(msg: EMOutgoingMessageWithAnswer): any;

  /**
   * Send message to external app without expecting a response.
   * @param msg message to send
   */
  fireMessage(msg: EMOutgoingMessageWithoutAnswer): any;

  receiveMessage(msg: EMIncomingMessage): any;
}

export interface RegistryEntry {
  created_at: number;
  modified_at: number;
}

export type EntityCategory = 'config' | 'diagnostic';

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels: string[];
  hidden?: boolean;
  entity_category?: EntityCategory;
  translation_key?: string;
  platform?: string;
  display_precision?: number;
  has_entity_name?: boolean;
}

export interface DeviceRegistryEntry extends RegistryEntry {
  id: string;
  config_entries: string[];
  config_entries_subentries: Record<string, (string | null)[]>;
  connections: [string, string][];
  identifiers: [string, string][];
  manufacturer: string | null;
  model: string | null;
  model_id: string | null;
  name: string | null;
  labels: string[];
  sw_version: string | null;
  hw_version: string | null;
  serial_number: string | null;
  via_device_id: string | null;
  area_id: string | null;
  name_by_user: string | null;
  entry_type: 'service' | null;
  disabled_by: 'user' | 'integration' | 'config_entry' | null;
  configuration_url: string | null;
  primary_config_entry: string | null;
}

export interface AreaRegistryEntry extends RegistryEntry {
  aliases: string[];
  area_id: string;
  floor_id: string | null;
  humidity_entity_id: string | null;
  icon: string | null;
  labels: string[];
  name: string;
  picture: string | null;
  temperature_entity_id: string | null;
}

export interface FloorRegistryEntry extends RegistryEntry {
  floor_id: string;
  name: string;
  level: number | null;
  icon: string | null;
  aliases: string[];
}

export interface PanelInfo<T = Record<string, any> | null> {
  component_name: string;
  config: T;
  icon: string | null;
  title: string | null;
  url_path: string;
  config_panel_domain?: string;
}

export type Panels = Record<string, PanelInfo>;

export type Resources = Record<string, Record<string, string>>;

export type getHassTranslations = (
  hass: HomeAssistant,
  language: string,
  category: TranslationCategory,
  integration?: string | string[],
  config_flow?: boolean,
) => Promise<Record<string, unknown>>;


export interface HassConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  radius: number;
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
  recovery_mode: boolean;
  safe_mode: boolean;
  state: 'NOT_RUNNING' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'FINAL_WRITE';
  external_url: string | null;
  internal_url: string | null;
  currency: string;
  country: string | null;
  language: string;
}

export interface HomeAssistant {
  auth: Auth & { external?: ExternalMessaging };
  connection: Connection;
  connected: boolean;
  states: HassEntities;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
  floors: Record<string, FloorRegistryEntry>;
  services: HassServices;
  config: HassConfig;
  themes: Themes;
  selectedTheme: ThemeSettings | null;
  panels: Panels;
  panelUrl: string;
  // i18n
  // current effective language in that order:
  //   - backend saved user selected language
  //   - language in local app storage
  //   - browser language
  //   - english (en)
  language: string;
  // local stored language, keep that name for backward compatibility
  selectedLanguage: string | null;
  locale: FrontendLocaleData;
  resources: Resources;
  localize: LocalizeFunc;
  translationMetadata: TranslationMetadata;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  debugConnection: boolean;
  dockedSidebar: 'docked' | 'always_hidden' | 'auto';
  defaultPanel: string;
  moreInfoEntityId: string | null;
  user?: CurrentUser;
  userData?: CoreFrontendUserData | null;

  hassUrl(path?: string): string;

  callService(
    domain: ServiceCallRequest['domain'],
    service: ServiceCallRequest['service'],
    serviceData?: ServiceCallRequest['serviceData'],
    target?: ServiceCallRequest['target'],
    notifyOnError?: boolean,
    returnResponse?: boolean,
  ): Promise<ServiceCallResponse>;

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

  sendWS(msg: MessageBase): void;

  callWS<T>(msg: MessageBase): Promise<T>;

  loadBackendTranslation(
    category: Parameters<getHassTranslations>[2],
    integrations?: Parameters<getHassTranslations>[3],
    configFlow?: Parameters<getHassTranslations>[4],
  ): Promise<LocalizeFunc>;

  loadFragmentTranslation(fragment: string): Promise<LocalizeFunc | undefined>;

  formatEntityState(stateObj: HassEntity, state?: string): string;

  formatEntityAttributeValue(
    stateObj: HassEntity,
    attribute: string,
    value?: any,
  ): string;

  formatEntityAttributeName(stateObj: HassEntity, attribute: string): string;
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

export interface Context {
  id: string;
  user_id: string | null;
  parent_id: string | null;
}

export interface ServiceCallResponse {
  context: Context;
}

export interface ServiceCallRequest {
  domain: string;
  service: string;
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


export type LovelaceConstructor = new (...args: any[]) => LitElement & LovelaceCard;
export type ElementConstructor = new (...args: any[]) => LitElement;

export type IntegrationType =
  | 'device'
  | 'helper'
  | 'hub'
  | 'service'
  | 'hardware'
  | 'entity'
  | 'system';

export interface IntegrationManifest {
  is_built_in: boolean;
  overwrites_built_in?: boolean;
  domain: string;
  name: string;
  config_flow: boolean;
  documentation: string;
  issue_tracker?: string;
  dependencies?: string[];
  after_dependencies?: string[];
  codeowners?: string[];
  requirements?: string[];
  ssdp?: { manufacturer?: string; modelName?: string; st?: string }[];
  zeroconf?: string[];
  homekit?: { models: string[] };
  integration_type?: IntegrationType;
  loggers?: string[];
  quality_scale?:
    | 'bronze'
    | 'silver'
    | 'gold'
    | 'platinum'
    | 'no_score'
    | 'internal'
    | 'legacy'
    | 'custom';
  iot_class:
    | 'assumed_state'
    | 'cloud_polling'
    | 'cloud_push'
    | 'local_polling'
    | 'local_push';
  single_config_entry?: boolean;
  version?: string;
}
