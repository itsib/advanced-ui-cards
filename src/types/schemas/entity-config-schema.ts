import type { IActionConfigSchema } from './action-config-schema';
import type { IConfirmationConfigSchema } from './confirmation-config-schema';

type IFormatEnum = 'relative' | 'total' | 'date' | 'time' | 'datetime';

type ISecondaryInfoEnum =
  'last-changed'
  | 'entity-id'
  | 'last-updated'
  | 'last-triggered'
  | 'brightness'
  | 'tilt-position'
  | 'position';

export interface IEntityBaseConfigSchema {
  entity: string;
  name?: string;
  icon?: string;
  image?: string;
  secondary_info?: ISecondaryInfoEnum;
  format?: IFormatEnum;
  state_color?: boolean;
  tap_action?: IActionConfigSchema;
  hold_action?: IActionConfigSchema;
  double_tap_action?: IActionConfigSchema;
  confirmation?: IConfirmationConfigSchema;
}

export interface IEntityAttributeConfigSchema {
  type: 'attribute';
  entity: string;
  attribute: string;
  prefix?: string;
  suffix?: string;
  name?: string;
  icon?: string;
  format?: IFormatEnum;
}

export interface IEntityDividerConfigSchema {
  type: 'divider';
  style?: any;
}

export interface IEntitySectionConfigSchema {
  type: 'section';
  label?: string;
}

export interface IEntityWebLinkConfigSchema {
  type: 'weblink';
  url: string;
  name?: string;
  icon?: string;
}

export interface IEntityTextConfigSchema {
  type: 'text';
  name: string;
  text: string;
  icon?: string;
}

export type IEntityConfigSchema =
  IEntityBaseConfigSchema
  | IEntityAttributeConfigSchema
  | IEntityDividerConfigSchema
  | IEntitySectionConfigSchema
  | IEntityWebLinkConfigSchema
  | IEntityTextConfigSchema;