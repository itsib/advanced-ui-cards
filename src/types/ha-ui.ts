import { HomeAssistant } from './ha-common';
import { FrontendLocaleData, TimeFormat } from './ha-locale';
import { ActionConfig, ConfirmationRestrictionConfig, HassServiceTarget } from './ha-actions';

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  type: string;

  [key: string]: any;
}

export interface LovelaceDashboardBaseConfig {
}

export interface ShowViewConfig {
  user?: string;
}

export interface LovelaceViewBackgroundConfig {
  image?: string;
  opacity?: number;
  size?: 'auto' | 'cover' | 'contain';
  alignment?:
    | 'top left'
    | 'top center'
    | 'top right'
    | 'center left'
    | 'center'
    | 'center right'
    | 'bottom left'
    | 'bottom center'
    | 'bottom right';
  repeat?: 'repeat' | 'no-repeat';
  attachment?: 'scroll' | 'fixed';
}

export interface LovelaceViewHeaderConfig {
  card?: LovelaceCardConfig;
  layout?: 'start' | 'center' | 'responsive';
  badges_position?: 'bottom' | 'top';
  badges_wrap?: 'wrap' | 'scroll';
}


export interface LovelaceBaseViewConfig {
  index?: number;
  title?: string;
  path?: string;
  icon?: string;
  theme?: string;
  panel?: boolean;
  background?: string | LovelaceViewBackgroundConfig;
  visible?: boolean | ShowViewConfig[];
  subview?: boolean;
  back_path?: string;
  // Only used for section view, it should move to a section view config type when the views will have dedicated editor.
  max_columns?: number;
  dense_section_placement?: boolean;
  top_margin?: boolean;
}

export interface LovelaceBaseSectionConfig {
  visibility?: Condition[];
  column_span?: number;
  row_span?: number;
}

export interface LovelaceSectionConfig extends LovelaceBaseSectionConfig {
  type?: string;
  cards?: LovelaceCardConfig[];
}

export interface LovelaceStrategySectionConfig
  extends LovelaceBaseSectionConfig {
  strategy: LovelaceStrategyConfig;
}

export type LovelaceSectionRawConfig =
  | LovelaceSectionConfig
  | LovelaceStrategySectionConfig;

export interface LovelaceViewConfig extends LovelaceBaseViewConfig {
  type?: string;
  badges?: (string | Partial<LovelaceBadgeConfig>)[]; // Badge can be just an entity_id or without type
  cards?: LovelaceCardConfig[];
  sections?: LovelaceSectionRawConfig[];
  header?: LovelaceViewHeaderConfig;
}

export interface LovelaceStrategyConfig {
  type: string;

  [key: string]: any;
}

export interface LovelaceStrategyViewConfig extends LovelaceBaseViewConfig {
  strategy: LovelaceStrategyConfig;
}

export type LovelaceViewRawConfig =
  | LovelaceViewConfig
  | LovelaceStrategyViewConfig;

export interface LovelaceConfig extends LovelaceDashboardBaseConfig {
  background?: string;
  views: LovelaceViewRawConfig[];
}


export interface LovelaceBadgeConfig {
  type?: string;

  [key: string]: any;
}

export interface ShowViewConfig {
  user?: string;
}

export interface LovelaceViewConfig {
  index?: number;
  title?: string;
  type?: string;
  strategy?: {
    type: string;
    options?: Record<string, unknown>;
  };
  badges?: Array<string | LovelaceBadgeConfig>;
  cards?: LovelaceCardConfig[];
  path?: string;
  icon?: string;
  theme?: string;
  panel?: boolean;
  background?: string;
  visible?: boolean | ShowViewConfig[];
  subview?: boolean;
  back_path?: string;
}

// Automations

export interface ForDict {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

interface BaseCondition {
  condition: string;
  alias?: string;
  enabled?: boolean;
}

export interface LogicalCondition extends BaseCondition {
  condition: 'and' | 'not' | 'or';
  conditions: Condition | Condition[];
}

export interface StateCondition extends BaseCondition {
  condition: 'state';
  entity_id: string;
  attribute?: string;
  state: string | number | string[];
  for?: string | number | ForDict;
  match?: 'all' | 'any';
}

export interface NumericStateCondition extends BaseCondition {
  condition: 'numeric_state';
  entity_id: string;
  attribute?: string;
  above?: string | number;
  below?: string | number;
  value_template?: string;
}

export interface SunCondition extends BaseCondition {
  condition: 'sun';
  after_offset?: number;
  before_offset?: number;
  after?: 'sunrise' | 'sunset';
  before?: 'sunrise' | 'sunset';
}

export interface ZoneCondition extends BaseCondition {
  condition: 'zone';
  entity_id: string;
  zone: string;
}

type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface TimeCondition extends BaseCondition {
  condition: 'time';
  after?: string;
  before?: string;
  weekday?: Weekday | Weekday[];
}

export interface TemplateCondition extends BaseCondition {
  condition: 'template';
  value_template: string;
}

export interface TriggerCondition extends BaseCondition {
  condition: 'trigger';
  id: string;
}

export interface DeviceCondition {
  condition: 'device';
  alias?: string;
  device_id: string;
  domain: string;
  entity_id?: string;
  type?: string;
  subtype?: string;
  event?: string;
  enabled?: boolean;
  metadata?: { secondary: boolean };
}

export type Condition =
  | StateCondition
  | NumericStateCondition
  | SunCondition
  | ZoneCondition
  | TimeCondition
  | TemplateCondition
  | DeviceCondition
  | LogicalCondition
  | TriggerCondition;

// Entities
export interface EntityConfigLike {
  type?: string;
  entity?: string;
}

export interface EntityConfig {
  entity: string;
  type?: string;
  name?: string;
  icon?: string;
  image?: string;
}

export interface ConfirmableRowConfig extends EntityConfig {
  confirmation?: ConfirmationRestrictionConfig;
}

export interface ActionRowConfig extends ConfirmableRowConfig {
  action_name?: string;
}

type FilterOperator =
  | '=='
  | '<='
  | '<'
  | '>='
  | '>'
  | '!='
  | 'in'
  | 'not in'
  | 'regex';

// Legacy entity-filter badge & card condition
export type LegacyStateFilter =
  | {
  operator: FilterOperator;
  attribute?: string;
  value: string | number | (string | number)[];
}
  | number
  | string;

export interface EntityFilterEntityConfig extends EntityConfig {
  state_filter?: LegacyStateFilter[];
  conditions?: Condition[];
}

export interface DividerConfig {
  type: 'divider';
  style?: Record<string, string>;
}

export interface SectionConfig {
  type: 'section';
  label: string;
}

export interface WeblinkConfig {
  type: 'weblink';
  name?: string;
  icon?: string;
  url: string;
  new_tab?: boolean;
  download?: boolean;
}

export interface TextConfig {
  type: 'text';
  name: string;
  icon?: string;
  text: string;
}

export interface CallServiceConfig extends EntityConfig {
  type: 'call-service' | 'perform-action';
  action: string;
  data?: Record<string, any>;
  action_name?: string;
}

export interface ButtonRowConfig extends EntityConfig {
  type: 'button';
  action_name?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface CastConfig {
  type: 'cast';
  icon?: string;
  name?: string;
  view?: string | number;
  dashboard?: string;
  // Hide the row if either unsupported browser or no API available.
  hide_if_unavailable?: boolean;
}

export interface ButtonsRowConfig {
  type: 'buttons';
  entities: (string | EntityConfig)[];
}

export type LovelaceRowConfig =
  | EntityConfig
  | DividerConfig
  | SectionConfig
  | WeblinkConfig
  | CallServiceConfig
  | CastConfig
  | ButtonRowConfig
  | ButtonsRowConfig
  | ConditionalRowConfig
  | AttributeRowConfig
  | TextConfig;

export interface LovelaceRow extends HTMLElement {
  hass?: HomeAssistant;
  preview?: boolean;

  setConfig(config: LovelaceRowConfig);
}

export interface ConditionalRowConfig extends EntityConfig {
  row: EntityConfig;
  conditions: Condition[];
}

export type TimestampRenderingFormat = 'relative' | 'total' | 'date' | 'time' | 'datetime';

export interface AttributeRowConfig extends EntityConfig {
  attribute: string;
  prefix?: string;
  suffix?: string;
  format?: TimestampRenderingFormat;
}

// Feature card config

export interface CoverOpenCloseCardFeatureConfig {
  type: 'cover-open-close';
}

export interface CoverPositionCardFeatureConfig {
  type: 'cover-position';
}

export interface CoverTiltCardFeatureConfig {
  type: 'cover-tilt';
}

export interface CoverTiltPositionCardFeatureConfig {
  type: 'cover-tilt-position';
}

export interface LightBrightnessCardFeatureConfig {
  type: 'light-brightness';
}

export interface LightColorTempCardFeatureConfig {
  type: 'light-color-temp';
}

export interface LockCommandsCardFeatureConfig {
  type: 'lock-commands';
}

export interface LockOpenDoorCardFeatureConfig {
  type: 'lock-open-door';
}

export interface MediaPlayerVolumeSliderCardFeatureConfig {
  type: 'media-player-volume-slider';
}

export interface FanPresetModesCardFeatureConfig {
  type: 'fan-preset-modes';
  style?: 'dropdown' | 'icons';
  preset_modes?: string[];
}

export interface FanSpeedCardFeatureConfig {
  type: 'fan-speed';
}

export type AlarmMode =
  | 'armed_home'
  | 'armed_away'
  | 'armed_night'
  | 'armed_vacation'
  | 'armed_custom_bypass'
  | 'disarmed';

export interface AlarmModesCardFeatureConfig {
  type: 'alarm-modes';
  modes?: AlarmMode[];
}

export interface ClimateFanModesCardFeatureConfig {
  type: 'climate-fan-modes';
  style?: 'dropdown' | 'icons';
  fan_modes?: string[];
}

export interface ClimateSwingModesCardFeatureConfig {
  type: 'climate-swing-modes';
  style?: 'dropdown' | 'icons';
  swing_modes?: string[];
}

export interface ClimateSwingHorizontalModesCardFeatureConfig {
  type: 'climate-swing-horizontal-modes';
  style?: 'dropdown' | 'icons';
  swing_horizontal_modes?: string[];
}

export type HvacMode = 'auto' | 'heat_cool' | 'heat' | 'cool' | 'dry' | 'fan_only' | 'off';

export interface ClimateHvacModesCardFeatureConfig {
  type: 'climate-hvac-modes';
  style?: 'dropdown' | 'icons';
  hvac_modes?: HvacMode[];
}

export interface ClimatePresetModesCardFeatureConfig {
  type: 'climate-preset-modes';
  style?: 'dropdown' | 'icons';
  preset_modes?: string[];
}

export type CounterActions = 'decrement' | 'reset' | 'increment';

export interface CounterActionsCardFeatureConfig {
  type: 'counter-actions';
  actions?: CounterActions[];
}

export interface SelectOptionsCardFeatureConfig {
  type: 'select-options';
  options?: string[];
}

export interface NumericInputCardFeatureConfig {
  type: 'numeric-input';
  style?: 'buttons' | 'slider';
}

export interface TargetHumidityCardFeatureConfig {
  type: 'target-humidity';
}

export interface TargetTemperatureCardFeatureConfig {
  type: 'target-temperature';
}

export interface ToggleCardFeatureConfig {
  type: 'toggle';
}

export interface HumidifierModesCardFeatureConfig {
  type: 'humidifier-modes';
  style?: 'dropdown' | 'icons';
  modes?: string[];
}

export interface HumidifierToggleCardFeatureConfig {
  type: 'humidifier-toggle';
}

export interface UpdateActionsCardFeatureConfig {
  type: 'update-actions';
  backup?: 'yes' | 'no' | 'ask';
}

export type LawnMowerCommand = 'start_pause' | 'dock';

export interface LawnMowerCommandsCardFeatureConfig {
  type: 'lawn-mower-commands';
  commands?: LawnMowerCommand[];
}

export type LovelaceCardFeatureConfig =
  | AlarmModesCardFeatureConfig
  | ClimateFanModesCardFeatureConfig
  | ClimateSwingModesCardFeatureConfig
  | ClimateSwingHorizontalModesCardFeatureConfig
  | ClimateHvacModesCardFeatureConfig
  | ClimatePresetModesCardFeatureConfig
  | CounterActionsCardFeatureConfig
  | CoverOpenCloseCardFeatureConfig
  | CoverPositionCardFeatureConfig
  | CoverTiltPositionCardFeatureConfig
  | CoverTiltCardFeatureConfig
  | FanPresetModesCardFeatureConfig
  | FanSpeedCardFeatureConfig
  | HumidifierToggleCardFeatureConfig
  | HumidifierModesCardFeatureConfig
  | LawnMowerCommandsCardFeatureConfig
  | LightBrightnessCardFeatureConfig
  | LightColorTempCardFeatureConfig
  | LockCommandsCardFeatureConfig
  | LockOpenDoorCardFeatureConfig
  | MediaPlayerVolumeSliderCardFeatureConfig
  | NumericInputCardFeatureConfig
  | SelectOptionsCardFeatureConfig
  | TargetHumidityCardFeatureConfig
  | TargetTemperatureCardFeatureConfig
  | ToggleCardFeatureConfig
  | UpdateActionsCardFeatureConfig;

export interface LovelaceCardFeatureContext {
  entity_id?: string;
}

// Card Entities Config

export interface LovelaceHeaderFooterConfig {
  type: 'buttons' | 'graph' | 'picture';
}

export interface EntitiesCardEntityConfig extends EntityConfig {
  type?: string;
  secondary_info?:
    | 'entity-id'
    | 'last-changed'
    | 'last-triggered'
    | 'last-updated'
    | 'position'
    | 'tilt-position'
    | 'brightness';
  action_name?: string;
  action?: string;
  /** @deprecated use "action" instead */
  service?: string;
  // "service_data" is kept for backwards compatibility. Replaced by "data".
  service_data?: Record<string, unknown>;
  data?: Record<string, unknown>;
  url?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  state_color?: boolean;
  show_name?: boolean;
  show_icon?: boolean;
}

export interface ButtonsHeaderFooterConfig extends LovelaceHeaderFooterConfig {
  type: 'buttons';
  entities: (string | EntitiesCardEntityConfig)[];
}

export interface GraphHeaderFooterConfig extends LovelaceHeaderFooterConfig {
  type: 'graph';
  entity: string;
  detail?: number;
  hours_to_show?: number;
  limits?: {
    min?: number;
    max?: number;
  };
}

export interface PictureHeaderFooterConfig extends LovelaceHeaderFooterConfig {
  type: 'picture';
  image: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  alt_text?: string;
}

export interface EntitiesCardConfig extends LovelaceCardConfig {
  type: 'entities';
  show_header_toggle?: boolean;
  title?: string;
  entities: (LovelaceRowConfig | string)[];
  theme?: string;
  icon?: string;
  header?: LovelaceHeaderFooterConfig;
  footer?: LovelaceHeaderFooterConfig;
  state_color?: boolean;
}

type CameraView = 'live' | 'auto';

export interface AreaCardConfig extends LovelaceCardConfig {
  area: string;
  navigation_path?: string;
  show_camera?: boolean;
  camera_view?: CameraView;
  aspect_ratio?: string;
}

export interface ButtonCardConfig extends LovelaceCardConfig {
  entity?: string;
  name?: string;
  show_name?: boolean;
  icon?: string;
  icon_height?: string;
  show_icon?: boolean;
  theme?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  state_color?: boolean;
  show_state?: boolean;
}

export interface EntityFilterCardConfig extends LovelaceCardConfig {
  type: 'entity-filter';
  entities: (EntityFilterEntityConfig | string)[];
  state_filter?: LegacyStateFilter[];
  conditions: Condition[];
  card?: Partial<LovelaceCardConfig>;
  show_empty?: boolean;
}

export interface ErrorCardConfig extends LovelaceCardConfig {
  error: string;
  origConfig: LovelaceCardConfig;
}

export interface SeverityConfig {
  green?: number;
  yellow?: number;
  red?: number;
}

export interface GaugeSegment {
  from: number;
  color: string;
  label?: string;
}

export interface GaugeCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  unit?: string;
  min?: number;
  max?: number;
  severity?: SeverityConfig;
  theme?: string;
  needle?: boolean;
  segments?: GaugeSegment[];
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface ConfigEntity extends EntityConfig {
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface PictureGlanceEntityConfig extends ConfigEntity {
  show_state?: boolean;
  attribute?: string;
  prefix?: string;
  suffix?: string;
}

export interface GlanceConfigEntity extends ConfigEntity {
  show_last_changed?: boolean;
  image?: string;
  show_state?: boolean;
  state_color?: boolean;
  format: TimestampRenderingFormat;
}

export interface GlanceCardConfig extends LovelaceCardConfig {
  show_name?: boolean;
  show_state?: boolean;
  show_icon?: boolean;
  title?: string;
  theme?: string;
  entities: (string | GlanceConfigEntity)[];
  columns?: number;
  state_color?: boolean;
}

export interface HumidifierCardConfig extends LovelaceCardConfig {
  entity: string;
  theme?: string;
  name?: string;
  show_current_as_primary?: boolean;
  features?: LovelaceCardFeatureConfig[];
}

export interface IframeCardConfig extends LovelaceCardConfig {
  allow_open_top_navigation?: boolean;
  aspect_ratio?: string;
  disable_sandbox?: boolean;
  title?: string;
  allow?: string;
  url: string;
}

export interface LightCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  theme?: string;
  icon?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface LogbookCardConfig extends LovelaceCardConfig {
  type: 'logbook';
  /**
   * @deprecated Use target instead
   */
  entities?: string[];
  target: HassServiceTarget;
  title?: string;
  hours_to_show?: number;
  theme?: string;
}

interface GeoLocationSourceConfig {
  source: string;
  label_mode?: 'name' | 'state' | 'attribute' | 'icon';
  attribute?: string;
  focus?: boolean;
}

export interface MapCardConfig extends LovelaceCardConfig {
  type: 'map';
  title?: string;
  aspect_ratio?: string;
  auto_fit?: boolean;
  fit_zones?: boolean;
  default_zoom?: number;
  entities?: (EntityConfig | string)[];
  hours_to_show?: number;
  geo_location_sources?: (GeoLocationSourceConfig | string)[];
  dark_mode?: boolean;
  theme_mode?: ThemeMode;
}

export interface MarkdownCardConfig extends LovelaceCardConfig {
  type: 'markdown';
  content: string;
  text_only?: boolean;
  title?: string;
  card_size?: number;
  entity_ids?: string | string[];
  theme?: string;
  show_empty?: boolean;
}

export interface ClockCardConfig extends LovelaceCardConfig {
  type: 'clock';
  title?: string;
  clock_size?: 'small' | 'medium' | 'large';
  show_seconds?: boolean | undefined;
  time_format?: TimeFormat;
  time_zone?: string;
}

export interface MediaControlCardConfig extends LovelaceCardConfig {
  entity: string;
  theme?: string;
}

export interface HistoryGraphCardConfig extends LovelaceCardConfig {
  entities: (EntityConfig | string)[];
  hours_to_show?: number;
  title?: string;
  show_names?: boolean;
  logarithmic_scale?: boolean;
  min_y_axis?: number;
  max_y_axis?: number;
  fit_y_data?: boolean;
  split_device_classes?: boolean;
  expand_legend?: boolean;
}

export interface PictureCardConfig extends LovelaceCardConfig {
  image?: string;
  image_entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  theme?: string;
  alt_text?: string;
}

export interface PictureElementsCardConfig extends LovelaceCardConfig {
  title?: string;
  image?: string;
  image_entity?: string;
  camera_image?: string;
  camera_view?: CameraView;
  state_image?: Record<string, unknown>;
  state_filter?: string[];
  aspect_ratio?: string;
  entity?: string;
  elements: LovelaceElementConfig[];
  theme?: string;
  dark_mode_image?: string;
  dark_mode_filter?: string;
}

export interface PictureEntityCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  image?: string;
  camera_image?: string;
  camera_view?: CameraView;
  state_image?: Record<string, unknown>;
  state_filter?: string[];
  aspect_ratio?: string;
  fit_mode?: 'cover' | 'contain' | 'fill';
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  show_name?: boolean;
  show_state?: boolean;
  theme?: string;
}

export interface PictureGlanceCardConfig extends LovelaceCardConfig {
  entities: (string | PictureGlanceEntityConfig)[];
  title?: string;
  image?: string;
  image_entity?: string;
  camera_image?: string;
  camera_view?: CameraView;
  state_image?: Record<string, unknown>;
  state_filter?: string[];
  aspect_ratio?: string;
  fit_mode?: 'cover' | 'contain' | 'fill';
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  show_state?: boolean;
  theme?: string;
}

export interface SensorCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  graph?: string;
  unit?: string;
  detail?: number;
  theme?: string;
  hours_to_show?: number;
  limits?: {
    min?: number;
    max?: number;
  };
}

export interface TodoListCardConfig extends LovelaceCardConfig {
  title?: string;
  theme?: string;
  entity?: string;
  hide_completed?: boolean;
  hide_create?: boolean;
  sort?: string;
}

export interface StackCardConfig extends LovelaceCardConfig {
  cards: LovelaceCardConfig[];
  title?: string;
}

export interface GridCardConfig extends StackCardConfig {
  columns?: number;
  square?: boolean;
}

export interface ThermostatCardConfig extends LovelaceCardConfig {
  entity: string;
  theme?: string;
  name?: string;
  show_current_as_primary?: boolean;
  features?: LovelaceCardFeatureConfig[];
}

export interface TileCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  hide_state?: boolean;
  state_content?: string | string[];
  icon?: string;
  color?: string;
  show_entity_picture?: boolean;
  vertical?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  icon_tap_action?: ActionConfig;
  icon_hold_action?: ActionConfig;
  icon_double_tap_action?: ActionConfig;
  features?: LovelaceCardFeatureConfig[];
  features_position?: 'bottom' | 'inline';
}

// ==================================================

interface LovelaceElementConfigBase {
  type: string;
  style: Record<string, string>;
}

export type LovelaceElementConfig =
  | ConditionalElementConfig
  | IconElementConfig
  | ImageElementConfig
  | ServiceButtonElementConfig
  | StateBadgeElementConfig
  | StateIconElementConfig
  | StateLabelElementConfig;

export interface LovelaceElement extends HTMLElement {
  hass?: HomeAssistant;

  setConfig(config: LovelaceElementConfig): void;
}

export interface ConditionalElementConfig extends LovelaceElementConfigBase {
  conditions: any[]; // Condition type
  elements: LovelaceElementConfigBase[];
}

export interface IconElementConfig extends LovelaceElementConfigBase {
  entity?: string;
  name?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  icon: string;
}

export interface ImageElementConfig extends LovelaceElementConfigBase {
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  image?: string;
  state_image?: string;
  camera_image?: string;
  camera_view?: any;
  dark_mode_image?: string;
  dark_mode_filter?: string;
  filter?: string;
  state_filter?: string;
  aspect_ratio?: string;
}

export interface ServiceButtonElementConfig extends LovelaceElementConfigBase {
  title?: string;
  service?: string;
  service_data?: Record<string, unknown>;
}

export interface StateBadgeElementConfig extends LovelaceElementConfigBase {
  entity: string;
  title?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface StateIconElementConfig extends LovelaceElementConfigBase {
  entity: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  icon?: string;
  state_color?: boolean;
}

export interface StateLabelElementConfig extends LovelaceElementConfigBase {
  entity: string;
  attribute?: string;
  prefix?: string;
  suffix?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// ==================================================

export interface LovelaceDashboardStrategyConfig
  extends LovelaceDashboardBaseConfig {
  strategy: LovelaceStrategyConfig;
}

export type LovelaceRawConfig = LovelaceConfig | LovelaceDashboardStrategyConfig;

export interface ToastActionParams {
  action: () => void;
  text: string;
}

export interface ShowToastParams {
  // Unique ID for the toast. If a new toast is shown with the same ID as the previous toast, it will be replaced to avoid flickering.
  id?: string;
  message: string;
  action?: ToastActionParams;
  duration?: number;
  dismissable?: boolean;
}

export interface Lovelace {
  config: LovelaceConfig;
  rawConfig: LovelaceRawConfig;
  editMode: boolean;
  urlPath: string | null;
  mode: 'generated' | 'yaml' | 'storage';
  locale: FrontendLocaleData;
  enableFullEditMode: () => void;
  setEditMode: (editMode: boolean) => void;
  saveConfig: (newConfig: LovelaceRawConfig) => Promise<void>;
  deleteConfig: () => Promise<void>;
  showToast: (params: ShowToastParams) => void;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  isPanel?: boolean;
  editMode?: boolean;

  getCardSize(): number | Promise<number>;

  setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  lovelace?: LovelaceConfig;

  setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceBadge extends HTMLElement {
  hass?: HomeAssistant;

  setConfig(config: LovelaceBadgeConfig): void;
}

export interface LovelaceViewElement extends HTMLElement {
  hass?: HomeAssistant;
  lovelace?: Lovelace;
  narrow?: boolean;
  index?: number;
  cards?: Array<LovelaceCard>;
  badges?: LovelaceBadge[];
  isStrategy: boolean;

  setConfig(config: LovelaceViewConfig): void;
}

export interface EntitiesEditorEvent extends CustomEvent {
  detail: {
    entities?: EntityConfig[];
    item?: any;
  };
  target: EventTarget | null;
}

export interface EditorTarget extends EventTarget {
  value?: string;
  index?: number;
  checked?: boolean;
  configValue?: string;
  type?: HTMLInputElement['type'];
  config: ActionConfig;
}

export interface Card {
  type: string;
  name?: string;
  description?: string;
  showElement?: boolean;
  isCustom?: boolean;
  isSuggested?: boolean;
}

export interface Badge {
  type: string;
  name?: string;
  description?: string;
  showElement?: boolean;
  isCustom?: boolean;
  isSuggested?: boolean;
}
