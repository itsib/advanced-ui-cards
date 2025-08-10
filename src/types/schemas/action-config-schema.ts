import type { IConfirmationConfigSchema } from './confirmation-config-schema';
import type { ITargetConfigSchema } from './target-config-schema';

interface IBaseActionConfigSchema {
  action:  'more-info' | 'url' | 'navigate' | 'none' | 'toggle' | 'perform-action';
  confirmation?: IConfirmationConfigSchema;
}

interface IActionConfigServiceSchema extends IBaseActionConfigSchema {
  action: 'perform-action';
  service?: string;
  perform_action?: string;
  service_data?: string;
  data?: any;
  target?: ITargetConfigSchema;
  confirmation?: IConfirmationConfigSchema;
}

interface IActionConfigNavigateSchema extends IBaseActionConfigSchema {
  action: 'navigate';
  navigation_path: string;
  navigation_replace?: boolean;
  confirmation?: IConfirmationConfigSchema;
}

interface IActionConfigUrlSchema extends IBaseActionConfigSchema {
  action: 'url';
  url_path: string;
  confirmation?: IConfirmationConfigSchema;
}

interface IActionConfigMoreInfoSchema extends IBaseActionConfigSchema {
  action: 'more-info';
  entity?: string;
  confirmation: never;
}

export type IActionConfigSchema = IActionConfigServiceSchema | IActionConfigNavigateSchema | IActionConfigUrlSchema | IActionConfigMoreInfoSchema;