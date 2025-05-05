import type { HTMLTemplateResult } from 'lit';

export interface FrontendLocaleData {
  language: string;
  number_format: NumberFormat;
  time_format: TimeFormat;
  first_weekday: FirstWeekday;
}

export enum NumberFormat {
  language = 'language',
  system = 'system',
  comma_decimal = 'comma_decimal',
  decimal_comma = 'decimal_comma',
  space_comma = 'space_comma',
  none = 'none',
}

export enum TimeFormat {
  language = 'language',
  system = 'system',
  am_pm = '12',
  twenty_four = '24',
}

export enum FirstWeekday {
  language = 'language',
  monday = 'monday',
  tuesday = 'tuesday',
  wednesday = 'wednesday',
  thursday = 'thursday',
  friday = 'friday',
  saturday = 'saturday',
  sunday = 'sunday',
}

export type TranslationCategory =
  | 'title'
  | 'state'
  | 'entity'
  | 'entity_component'
  | 'config'
  | 'config_panel'
  | 'options'
  | 'device_automation'
  | 'mfa_setup'
  | 'system_health'
  | 'device_class'
  | 'application_credentials'
  | 'issues'
  | 'selector';

export type LocalizeKeys =
  | `panel.${string}`
  | `ui.card.alarm_control_panel.${string}`
  | `ui.card.weather.attributes.${string}`
  | `ui.card.weather.cardinal_direction.${string}`
  | `ui.card.lawn_mower.actions.${string}`
  | `ui.components.calendar.event.rrule.${string}`
  | `ui.components.selectors.file.${string}`
  | `ui.components.logbook.messages.detected_device_classes.${string}`
  | `ui.components.logbook.messages.cleared_device_classes.${string}`
  | `ui.dialogs.entity_registry.editor.${string}`
  | `ui.dialogs.more_info_control.lawn_mower.${string}`
  | `ui.dialogs.more_info_control.vacuum.${string}`
  | `ui.dialogs.quick-bar.commands.${string}`
  | `ui.dialogs.unhealthy.reason.${string}`
  | `ui.dialogs.unsupported.reason.${string}`
  | `ui.panel.config.${string}.${"caption" | "description"}`
  | `ui.panel.config.dashboard.${string}`
  | `ui.panel.config.zha.${string}`
  | `ui.panel.config.zwave_js.${string}`
  | `ui.panel.lovelace.card.${string}`
  | `ui.panel.lovelace.editor.${string}`
  | `ui.panel.page-authorize.form.${string}`
  | `component.${string}`
  | string;

export type LocalizeFunc<Keys extends string = LocalizeKeys> = (
  key: Keys,
  values?: Record<
    string,
    string | number | HTMLTemplateResult | null | undefined
  >
) => string;

export interface TranslationMetadata {
  fragments: string[];
  translations: {
    [language: string]: {
      hash: string;
      nativeName: string;
      isRTL?: boolean;
    };
  };
}
