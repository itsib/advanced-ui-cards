import { array, assign, boolean, enums, number, object, optional, string, union } from 'superstruct';
import { BaseCardConfigSchema } from '../../schemas/base-card-config-schema';
import { EntitiesConfigSchema } from '../../schemas/entities-config-schema';
import { LovelaceCardConfig, LovelaceRowConfig } from 'types';
import { ButtonConfigSchema, IButtonConfigSchema } from '../../schemas/button-config-schema';
import { ActionConfigSchema } from '../../schemas/action-config-schema';
import { ConfirmationConfigSchema } from '../../schemas/confirmation-config-schema';

export interface IGaugeActionsCardConfigSchema extends LovelaceCardConfig {
  type: 'custom:lc-gauge-actions-card';
  title?: string;
  entities: (LovelaceRowConfig | string)[];
  theme?: string;
  icon?: string;
  buttons?: IButtonConfigSchema[];
}

const TestEntity = object({
  val: optional(number()),
  entity: string(),
  name: optional(string()),
  icon: optional(string()),
  image: optional(string()),
  secondary_info: optional(string()),
  state_color: optional(boolean()),
  tap_action: optional(ActionConfigSchema),
  hold_action: optional(ActionConfigSchema),
  double_tap_action: optional(ActionConfigSchema),
  confirmation: optional(ConfirmationConfigSchema),
})

export const GaugeActionsCardConfigSchema = assign(
  BaseCardConfigSchema,
  object({
    title: optional(union([string(), boolean()])),
    entities: array(TestEntity),
    theme: optional(string()),
    icon: optional(string()),
    buttons: optional(array(ButtonConfigSchema))
  }),
);
