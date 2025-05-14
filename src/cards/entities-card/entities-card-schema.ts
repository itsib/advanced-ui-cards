import { array, assign, boolean, object, optional, string, union } from 'superstruct';
import { BaseCardConfigSchema } from '../../schemas/base-card-config-schema';
import { EntitiesConfigSchema } from '../../schemas/entities-config-schema';
import { LovelaceCardConfig, LovelaceRowConfig } from 'types';
import { ButtonConfigSchema, IButtonConfigSchema } from '../../schemas/button-config-schema';

export interface IEntitiesCardConfigSchema extends LovelaceCardConfig {
  type: 'custom:lc-entities-card';
  title?: string;
  icon?: string;
  entities: (LovelaceRowConfig | string)[];
  theme?: string;
  buttons?: IButtonConfigSchema[];
}

export const EntitiesCardConfigSchema = assign(
  BaseCardConfigSchema,
  object({
    title: optional(union([string(), boolean()])),
    entity: optional(string()),
    entities: array(EntitiesConfigSchema),
    theme: optional(string()),
    icon: optional(string()),
    buttons: optional(array(ButtonConfigSchema))
  }),
);
