import { array, boolean, dynamic, enums, literal, object, optional, string, type, union } from 'superstruct';
import { BaseActionConfig } from 'types';
import { ConfirmationConfigSchema } from './confirmation-config-schema';
import { TargetConfigSchema } from './target-config-schema';

const ActionConfigServiceSchema = object({
  action: enums(['call-service', 'perform-action']),
  service: optional(string()),
  perform_action: optional(string()),
  service_data: optional(object()),
  data: optional(object()),
  target: optional(TargetConfigSchema),
  confirmation: optional(ConfirmationConfigSchema),
});

const ActionConfigNavigateSchema = object({
  action: literal("navigate"),
  navigation_path: string(),
  navigation_replace: optional(boolean()),
  confirmation: optional(ConfirmationConfigSchema),
});

const ActionConfigUrlSchema = object({
  action: literal("url"),
  url_path: string(),
  confirmation: optional(ConfirmationConfigSchema),
});

const ActionConfigAssistSchema = type({
  action: literal("assist"),
  pipeline_id: optional(string()),
  start_listening: optional(boolean()),
});

const ActionConfigMoreInfoSchema = type({
  action: literal("more-info"),
  entity: optional(string()),
});

const ActionConfigTypeSchema = object({
  action: enums([
    "none",
    "toggle",
    "more-info",
    "call-service",
    "perform-action",
    "url",
    "navigate",
    "assist",
  ]),
  confirmation: optional(ConfirmationConfigSchema),
});

export const ActionConfigSchema = dynamic<any>((value) => {
  if (value && typeof value === "object" && "action" in value) {
    switch ((value as BaseActionConfig).action!) {
      case "call-service": {
        return ActionConfigServiceSchema;
      }
      case "perform-action": {
        return ActionConfigServiceSchema;
      }
      case "navigate": {
        return ActionConfigNavigateSchema;
      }
      case "url": {
        return ActionConfigUrlSchema;
      }
      case "assist": {
        return ActionConfigAssistSchema;
      }
      case "more-info": {
        return ActionConfigMoreInfoSchema;
      }
    }
  }

  return ActionConfigTypeSchema;
});