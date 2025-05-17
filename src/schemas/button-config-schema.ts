import { object, optional, string } from 'superstruct';
import { ConfirmationConfigSchema } from './confirmation-config-schema';
import { TargetConfigSchema } from './target-config-schema';

export const ButtonConfigSchema = object({
  action: string(),
  color: optional(string()),
  icon: optional(string()),
  tooltip: optional(string()),
  data: optional(object()),
  target: optional(TargetConfigSchema),
  confirmation: optional(ConfirmationConfigSchema),
});