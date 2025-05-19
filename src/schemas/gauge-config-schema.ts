import { array, boolean, number, object, optional, string, integer, min } from 'superstruct';

const GaugeLevelConfigSchema = object({
  level: number(),
  color: string(),
});

export const GaugeConfigSchema = object({
  entity: string(),
  attribute: optional(string()),
  name: optional(string()),
  unit: optional(string()),
  min: optional(number()),
  max: optional(number()),
  decimals: optional(min(integer(), 0)),
  digits: optional(boolean()),
  levels: optional(array(GaugeLevelConfigSchema)),
});