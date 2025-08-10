import { boolean, dynamic, enums, literal, object, optional, string, type } from 'superstruct';
import type { BaseActionConfig } from 'types';
import { ConfirmationConfigSchema } from './confirmation-config-schema';
import { TargetConfigSchema } from './target-config-schema';

const ActionConfigTypeSchema = object({
  action: enums(['none', 'toggle', 'url', 'navigate', 'assist']),
  confirmation: optional(ConfirmationConfigSchema),
});

const ActionConfigServiceSchema = object({
  action: literal('perform-action'),
  service: optional(string()),
  perform_action: optional(string()),
  service_data: optional(object()),
  data: optional(object()),
  target: optional(TargetConfigSchema),
  confirmation: optional(ConfirmationConfigSchema),
});

const ActionConfigNavigateSchema = object({
  action: literal('navigate'),
  navigation_path: string(),
  navigation_replace: optional(boolean()),
  confirmation: optional(ConfirmationConfigSchema),
});

const ActionConfigUrlSchema = object({
  action: literal('url'),
  url_path: string(),
  confirmation: optional(ConfirmationConfigSchema),
});

const ActionConfigMoreInfoSchema = type({
  action: literal('more-info'),
  entity: optional(string()),
});

export const ActionConfigSchema = dynamic<any>((value) => {
  if (value && typeof value === 'object' && 'action' in value) {
    switch ((value as BaseActionConfig).action!) {
      case 'perform-action': {
        return ActionConfigServiceSchema;
      }
      case 'navigate': {
        return ActionConfigNavigateSchema;
      }
      case 'url': {
        return ActionConfigUrlSchema;
      }
      case 'more-info': {
        return ActionConfigMoreInfoSchema;
      }
    }
  }

  return ActionConfigTypeSchema;
});