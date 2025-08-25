import { object, optional, string, assign } from 'superstruct';
import { BaseFeatureConfigSchema, type IBaseFeatureConfigSchema } from '../../schemas/base-feature-config-schema';

export interface ILightButtonFeatureConfigSchema extends IBaseFeatureConfigSchema {
  type: string;
  title?: string;
  iconOn?: string;
  iconOff?: string;
}

export const LightButtonFeatureConfigSchema = assign(
  BaseFeatureConfigSchema,
  object({
    title: optional(string()),
    iconOn: optional(string()),
    iconOff: optional(string()),
  })
);