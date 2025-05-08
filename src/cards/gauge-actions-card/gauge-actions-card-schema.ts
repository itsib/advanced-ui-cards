import { array, assign, boolean, number, object, optional, string, union } from 'superstruct';
import { BaseCardConfigSchema } from '../../schemas/base-card-config-schema';
import { LovelaceCardConfig } from 'types';
import { ButtonConfigSchema, IButtonConfigSchema } from '../../schemas/button-config-schema';

export interface IGaugeLevelConfigSchema {
  level: number;
  color: string;
}

export interface IGaugeEntityConfigSchema {
  entity: string;
  attribute?: string;
  name?: string;
  icon?: string;
  image?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  levels?: IGaugeLevelConfigSchema;
}

export interface IGaugeActionsCardConfigSchema extends LovelaceCardConfig {
  type: 'custom:lc-gauge-actions-card';
  title?: string;
  icon?: string;
  theme?: string;
  entities: (IGaugeEntityConfigSchema | string)[];
  buttons?: IButtonConfigSchema[];
}

const GaugeLevel = object({
  level: number(),
  color: string(),
});

const GaugeEntitySchema = object({
  entity: string(),
  attribute: optional(string()),
  name: optional(string()),
  icon: optional(string()),
  image: optional(string()),
  unit: optional(string()),
  min: optional(number()),
  max: optional(number()),
  step: optional(number()),
  levels: array(GaugeLevel),
});

export const GaugeActionsCardConfigSchema = assign(
  BaseCardConfigSchema,
  object({
    title: optional(union([string(), boolean()])),
    icon: optional(string()),
    theme: optional(string()),
    entities: array(union([string(), GaugeEntitySchema])),
    buttons: optional(array(ButtonConfigSchema)),
  }),
);
