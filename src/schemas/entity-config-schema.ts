import { any, boolean, dynamic, enums, literal, object, optional, string, union } from 'superstruct';
import type { LovelaceRowConfig } from 'types';
import { ActionConfigSchema } from './action-config-schema';
import { ConfirmationConfigSchema } from './confirmation-config-schema';

const FormatEnum = enums(['relative', 'total', 'date', 'time', 'datetime']);

const SecondaryInfoEnum = enums(['last-changed', 'entity-id', 'last-updated', 'last-triggered', 'brightness', 'tilt-position', 'position']);

const EntityBaseConfigSchema = union([
  object({
    entity: string(),
    name: optional(string()),
    icon: optional(string()),
    image: optional(string()),
    secondary_info: optional(SecondaryInfoEnum),
    format: optional(FormatEnum),
    state_color: optional(boolean()),
    tap_action: optional(ActionConfigSchema),
    hold_action: optional(ActionConfigSchema),
    double_tap_action: optional(ActionConfigSchema),
    confirmation: optional(ConfirmationConfigSchema),
  }),
  string(),
]);

const EntityDividerConfigSchema = object({
  type: literal('divider'),
  style: optional(any()),
});

const EntitySectionConfigSchema = object({
  type: literal('section'),
  label: optional(string()),
});

const EntityWebLinkConfigSchema = object({
  type: literal('weblink'),
  url: string(),
  name: optional(string()),
  icon: optional(string()),
});

const EntityAttributeConfigSchema = object({
  type: literal('attribute'),
  entity: string(),
  attribute: string(),
  prefix: optional(string()),
  suffix: optional(string()),
  name: optional(string()),
  icon: optional(string()),
  format: optional(FormatEnum),
});

const EntityTextConfigSchema = object({
  type: literal('text'),
  name: string(),
  text: string(),
  icon: optional(string()),
});

export const EntityConfigSchema = dynamic<any>((value) => {
  if (value && typeof value === 'object' && 'type' in value) {
    switch ((value as LovelaceRowConfig).type!) {
      case 'attribute': {
        return EntityAttributeConfigSchema;
      }
      case 'divider': {
        return EntityDividerConfigSchema;
      }
      case 'section': {
        return EntitySectionConfigSchema;
      }
      case 'text': {
        return EntityTextConfigSchema;
      }
      case 'weblink': {
        return EntityWebLinkConfigSchema;
      }
    }
  }
  // No "type" property => has to be the default entity row config Schema
  return EntityBaseConfigSchema;
});