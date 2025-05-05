import { any, object, string } from 'superstruct';

export const BaseCardConfigSchema = object({
  type: string(),
  view_layout: any(),
  layout_options: any(),
  grid_options: any(),
  visibility: any(),
});
