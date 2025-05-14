import { object, optional, string } from 'superstruct';
import { ConfirmationConfigSchema, IConfirmationConfigSchema } from './confirmation-config-schema';
import { HassServiceTarget } from 'types';
import { TargetConfigSchema } from './target-config-schema';

export interface IButtonConfigSchema {
  color?: string;
  icon?: string;
  tooltip?: string;
  action: string;
  target?: HassServiceTarget;
  data?: Record<string, any>;
  confirmation: boolean | IConfirmationConfigSchema;
}

export const ButtonConfigSchema = object({
  action: string(),
  color: optional(string()),
  icon: optional(string()),
  tooltip: optional(string()),
  data: optional(object()),
  target: optional(TargetConfigSchema),
  confirmation: optional(ConfirmationConfigSchema),
});