import { array, object, optional, string, union } from 'superstruct';

export const TargetConfigSchema = object({
  entity_id: optional(union([string(), array(string())])),
  device_id: optional(union([string(), array(string())])),
  area_id: optional(union([string(), array(string())])),
  floor_id: optional(union([string(), array(string())])),
  label_id: optional(union([string(), array(string())])),
});