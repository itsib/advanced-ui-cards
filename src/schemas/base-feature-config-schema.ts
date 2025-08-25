import { any, object, string } from 'superstruct';

export interface IBaseFeatureConfigSchema {
  type: string;
}

export const BaseFeatureConfigSchema = object({
  type: string(),
});
