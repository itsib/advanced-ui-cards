import type { HomeAssistant } from 'types';
import { computeDomain } from './entities-utils';

export function formatEntityName(entityId: string, hass: HomeAssistant) {
  const entity = hass.entities[entityId];
  const domain = computeDomain(entityId);

  let name: string | null = null;
  if (entity.platform && domain && entity.translation_key) {
    name = hass.localize(`component.${entity.platform}.entity.${domain}.${entity.translation_key}.name`);
  }

  return name || entity.name;
}