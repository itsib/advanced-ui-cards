import {
  any,
  array,
  boolean,
  dynamic,
  enums,
  literal,
  number,
  object,
  optional,
  string,
  type,
  union,
} from 'superstruct';
import { LovelaceRowConfig } from 'types';
import { isCustomType } from '../utils/entities-utils';
import { ActionConfigConfirmationSchema, ActionConfigSchema } from './action-config-schema';
import { customType } from './validators/custom-type';

export const TIMESTAMP_RENDERING_FORMATS = ['relative', 'total', 'date', 'time', 'datetime'];

export const EntitiesConfigSchema = union([
  object({
    entity: string(),
    name: optional(string()),
    icon: optional(string()),
    image: optional(string()),
    secondary_info: optional(string()),
    format: optional(enums(TIMESTAMP_RENDERING_FORMATS)),
    state_color: optional(boolean()),
    tap_action: optional(ActionConfigSchema),
    hold_action: optional(ActionConfigSchema),
    double_tap_action: optional(ActionConfigSchema),
    confirmation: optional(ActionConfigConfirmationSchema),
  }),
  string(),
]);

export const ButtonEntityConfigSchema = object({
  entity: string(),
  name: optional(string()),
  icon: optional(string()),
  image: optional(string()),
  show_name: optional(boolean()),
  show_icon: optional(boolean()),
  tap_action: optional(ActionConfigSchema),
  hold_action: optional(ActionConfigSchema),
  double_tap_action: optional(ActionConfigSchema),
});

export const ButtonEntitiesRowConfigSchema = object({
  type: literal('button'),
  entity: optional(string()),
  name: optional(string()),
  icon: optional(string()),
  action_name: optional(string()),
  tap_action: ActionConfigSchema,
  hold_action: optional(ActionConfigSchema),
  double_tap_action: optional(ActionConfigSchema),
});

export const CastEntitiesRowConfigSchema = object({
  type: literal('cast'),
  view: optional(union([string(), number()])),
  dashboard: optional(string()),
  name: optional(string()),
  icon: optional(string()),
  hide_if_unavailable: optional(boolean()),
});

export const CallServiceEntitiesRowConfigSchema = object({
  type: enums(['call-service', 'perform-action']),
  name: string(),
  service: optional(string()),
  action: optional(string()),
  icon: optional(string()),
  action_name: optional(string()),
  data: optional(any()),
});

export const ConditionalEntitiesRowConfigSchema = object({
  type: literal('conditional'),
  row: any(),
  conditions: array(any()),
});

export const DividerEntitiesRowConfigSchema = object({
  type: literal('divider'),
  style: optional(any()),
});

export const SectionEntitiesRowConfigSchema = object({
  type: literal('section'),
  label: optional(string()),
});

export const WebLinkEntitiesRowConfigSchema = object({
  type: literal('weblink'),
  url: string(),
  name: optional(string()),
  icon: optional(string()),
});

export const ButtonsEntitiesRowConfigSchema = object({
  type: literal('buttons'),
  entities: array(ButtonEntityConfigSchema),
});

export const AttributeEntitiesRowConfigSchema = object({
  type: literal('attribute'),
  entity: string(),
  attribute: string(),
  prefix: optional(string()),
  suffix: optional(string()),
  name: optional(string()),
  icon: optional(string()),
  format: optional(enums(['relative', 'total', 'date', 'time', 'datetime'])),
});

export const TextEntitiesRowConfigSchema = object({
  type: literal('text'),
  name: string(),
  text: string(),
  icon: optional(string()),
});

export const CustomEntitiesRowConfigSchema = type({
  type: customType(),
});

export const EntitiesRowConfigSchema = dynamic<any>((value) => {
  if (value && typeof value === 'object' && 'type' in value) {
    if (isCustomType((value as LovelaceRowConfig).type!)) {
      return CustomEntitiesRowConfigSchema;
    }

    switch ((value as LovelaceRowConfig).type!) {
      case 'attribute': {
        return AttributeEntitiesRowConfigSchema;
      }
      case 'button': {
        return ButtonEntitiesRowConfigSchema;
      }
      case 'buttons': {
        return ButtonsEntitiesRowConfigSchema;
      }
      case 'perform-action':
      case 'call-service': {
        return CallServiceEntitiesRowConfigSchema;
      }
      case 'cast': {
        return CastEntitiesRowConfigSchema;
      }
      case 'conditional': {
        return ConditionalEntitiesRowConfigSchema;
      }
      case 'divider': {
        return DividerEntitiesRowConfigSchema;
      }
      case 'section': {
        return SectionEntitiesRowConfigSchema;
      }
      case 'text': {
        return TextEntitiesRowConfigSchema;
      }
      case 'weblink': {
        return WebLinkEntitiesRowConfigSchema;
      }
    }
  }

  // No "type" property => has to be the default entity row config Schema
  return EntitiesConfigSchema;
});