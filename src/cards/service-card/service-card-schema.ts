import { array, assign, boolean, number, object, optional, string, union } from 'superstruct';
import { BaseCardConfigSchema } from '../../schemas/base-card-config-schema';
import { LovelaceCardConfig, LovelaceRowConfig } from 'types';
import { ButtonConfigSchema, IButtonConfigSchema } from '../../schemas/button-config-schema';
import { EntitiesConfigSchema } from '../../schemas/entities-config-schema';

export interface IGaugeLevel {
  level: number;
  color: string;
}

export interface IGaugeConfigSchema {
  entity: string;
  attribute?: string;
  name?: string;
  icon?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  digits?: boolean;
  levels?: IGaugeLevel;
}

export interface IServiceCardConfigSchema extends LovelaceCardConfig {
  type: 'custom:lc-gauge-actions-card';
  title?: string;
  icon?: string;
  theme?: string;
  gauges?: IGaugeConfigSchema[];
  entities?: LovelaceRowConfig[];
  buttons?: IButtonConfigSchema[];
}

const GaugeConfigSchema = object({
  entity: string(),
  attribute: optional(string()),
  name: optional(string()),
  icon: optional(string()),
  image: optional(string()),
  unit: optional(string()),
  min: optional(number()),
  max: optional(number()),
  step: optional(number()),
  levels: optional(array(object({
    level: number(),
    color: string(),
  }))),
});

export const ServiceCardConfigSchema = assign(
  BaseCardConfigSchema,
  object({
    title: optional(union([string(), boolean()])),
    icon: optional(string()),
    theme: optional(string()),
    gauges: optional(array(GaugeConfigSchema)),
    entities: optional(array(EntitiesConfigSchema)),
    buttons: optional(array(ButtonConfigSchema)),
  }),
);
