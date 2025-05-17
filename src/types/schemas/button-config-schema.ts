import { ITargetConfigSchema } from './target-config-schema';
import { IConfirmationConfigSchema } from './confirmation-config-schema';

export interface IButtonConfigSchema {
  color?: string;
  icon?: string;
  tooltip?: string;
  action: string;
  target?: ITargetConfigSchema;
  data?: Record<string, any>;
  confirmation: boolean | IConfirmationConfigSchema;
}