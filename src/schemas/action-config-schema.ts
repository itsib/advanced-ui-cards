import { array, boolean, dynamic, enums, literal, object, optional, string, type, union } from 'superstruct';
import { BaseActionConfig } from 'types';

export const ActionConfigUserSchema = object({
  user: string(),
});

export const ActionConfigConfirmationSchema = union([
  boolean(),
  object({
    text: optional(string()),
    exemptions: optional(array(ActionConfigUserSchema)),
  }),
]);

export const ActionConfigServiceSchema = object({
  action: enums(['call-service', 'perform-action']),
  service: optional(string()),
  perform_action: optional(string()),
  service_data: optional(object()),
  data: optional(object()),
  target: optional(
    object({
      entity_id: optional(union([string(), array(string())])),
      device_id: optional(union([string(), array(string())])),
      area_id: optional(union([string(), array(string())])),
      floor_id: optional(union([string(), array(string())])),
      label_id: optional(union([string(), array(string())])),
    })
  ),
  confirmation: optional(ActionConfigConfirmationSchema),
});

export const ActionConfigNavigateSchema = object({
  action: literal("navigate"),
  navigation_path: string(),
  navigation_replace: optional(boolean()),
  confirmation: optional(ActionConfigConfirmationSchema),
});

export const ActionConfigUrlSchema = object({
  action: literal("url"),
  url_path: string(),
  confirmation: optional(ActionConfigConfirmationSchema),
});

export const ActionConfigAssistSchema = type({
  action: literal("assist"),
  pipeline_id: optional(string()),
  start_listening: optional(boolean()),
});

export const ActionConfigMoreInfoSchema = type({
  action: literal("more-info"),
  entity: optional(string()),
});

export const ActionConfigTypeSchema = object({
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
  confirmation: optional(ActionConfigConfirmationSchema),
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