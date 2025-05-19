import { ITargetConfigSchema } from 'types';

function extensiveField(value?: string | string[]): string[] {
  if (!value) return [];

  if (typeof value === 'string') {
    return [value];
  }
  return Array.from(new Set(value));
}

function compactField(dist: ITargetConfigSchema, src: ITargetConfigSchema, field: keyof ITargetConfigSchema) {
  if (src[field]) {
    if (typeof src[field] === 'string') {
      dist[field] = src[field];
    } else if (Array.isArray(src[field]) && src[field].length > 0) {
      dist[field] = src[field].length === 1 ? src[field][0] : src[field];
    }
  }
}

export function compactTarget(src?: ITargetConfigSchema): ITargetConfigSchema {
  if (!src) return {};

  const dist: ITargetConfigSchema = {};
  compactField(dist, src, 'entity_id');
  compactField(dist, src, 'device_id');
  compactField(dist, src, 'label_id');
  compactField(dist, src, 'floor_id');
  compactField(dist, src, 'area_id');

  return dist;
}

export function extensiveTarget(src: ITargetConfigSchema = {}): ITargetConfigSchema {
  return {
    entity_id: extensiveField(src.entity_id),
    device_id: extensiveField(src.device_id),
    area_id: extensiveField(src.area_id),
    floor_id: extensiveField(src.floor_id),
    label_id: extensiveField(src.label_id),
  };
}