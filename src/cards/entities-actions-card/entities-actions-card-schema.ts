import { array, assign, boolean, object, optional, string, union } from 'superstruct';
import { BaseCardConfigSchema } from '../../schemas/base-card-config-schema';
import { ActionConfigConfirmationSchema } from '../../schemas/action-config-schema';
import { EntitiesRowConfigSchema } from '../../schemas/entities-row-config-struct';
import { HassServiceTarget, LovelaceCardConfig, LovelaceRowConfig } from 'types';

export interface IConfirmationConfig {
  text?: string;
  exemptions?: { user: string }[];
}

export interface IButtonConfig {
  color?: string;
  icon?: string;
  tooltip?: string;
  action: string;
  target?: HassServiceTarget;
  data?: Record<string, any>;
  confirmation: boolean | IConfirmationConfig;
}

export interface IEntitiesActionsCardConfig extends LovelaceCardConfig {
  type: 'entities';
  title?: string;
  entities: (LovelaceRowConfig | string)[];
  theme?: string;
  icon?: string;
  buttons?: IButtonConfig[];
}

export const ButtonEntityConfigSchema = object({
  color: optional(string()),
  icon: optional(string()),
  tooltip: optional(string()),
  action: string(),
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

export const CardConfigSchema = assign(
  BaseCardConfigSchema,
  object({
    title: optional(union([string(), boolean()])),
    entity: optional(string()),
    entities: array(EntitiesRowConfigSchema),
    theme: optional(string()),
    icon: optional(string()),
    buttons: optional(array(ButtonEntityConfigSchema))
  }),
);
