import type { EntityConfigLike, HomeAssistant } from 'types';
import { computeDomain } from './entities-utils';

export function formatAttributeName(entityId: string, attribute: string, hass: HomeAssistant): string {
  const domain = computeDomain(entityId);
  let name = hass.localize(`component.${domain}.entity_component._.state_attributes.${attribute}.name`);
  if (!name) {
    name = attribute.split('_').map(item => item.charAt(0).toUpperCase() + item.substring(1)).join('');
  }

  return name;
}

export function formatEntityName(entityLike: EntityConfigLike, hass: HomeAssistant) {
  const entityId = entityLike.entity;
  if (!entityId) return '';
  const entity = hass.entities[entityId]!;
  const domain = computeDomain(entityId);

  let name: string | null = null;
  if (entity.platform && domain && entity.translation_key) {
    name = hass.localize(`component.${entity.platform}.entity.${domain}.${entity.translation_key}.name`);
  }
  name = name || entity.name || '';

  if (entityLike.attribute) {
    name += `: ${formatAttributeName(entityId, entityLike.attribute, hass)}`;
  }
  return name;
}