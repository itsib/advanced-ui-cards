import { array, assign, boolean, object, optional, string, union } from 'superstruct';
import { BaseCardConfigSchema } from '../../schemas/base-card-config-schema';
import type { IButtonConfigSchema, IEntityConfigSchema, IGaugeConfigSchema, LovelaceCardConfig } from 'types';
import { ButtonConfigSchema } from '../../schemas/button-config-schema';
import { EntityConfigSchema } from '../../schemas/entity-config-schema';
import { GaugeConfigSchema } from '../../schemas/gauge-config-schema';

export interface IUniversalCardConfigSchema extends LovelaceCardConfig {
  type: 'custom:lc-gauge-actions-card';
  title?: string;
  icon?: string;
  animation?: boolean;
  gauges?: IGaugeConfigSchema[];
  entities?: IEntityConfigSchema[];
  buttons?: IButtonConfigSchema[];
}

export const UniversalCardConfigSchema = assign(
  BaseCardConfigSchema,
  object({
    title: optional(union([string(), boolean()])),
    icon: optional(string()),
    animation: optional(boolean()),
    gauges: optional(array(GaugeConfigSchema)),
    entities: optional(array(EntityConfigSchema)),
    buttons: optional(array(ButtonConfigSchema)),
  }),
);
