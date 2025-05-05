import type { EntityConfig, HassEntity, HomeAssistant, LovelaceRowConfig, ServiceCallResponse } from 'types';

/** States that we consider "off". */
export const STATES_OFF = ["closed", "locked", "off"];

export function isValidEntityId(id: string): boolean {
  return /^(\w+)\.(\w+)$/.test(id);
}

export function isCustomType(type: string) {
  return type.startsWith('custom:');
}

export function computeDomain(entityId: string): string {
  return entityId.substring(0, entityId.indexOf('.'));
}

export function arrayFilter<T>(array: T[], conditions: ((value: T) => boolean)[], maxSize: number): T[] {
  if (!maxSize || maxSize > array.length) {
    maxSize = array.length;
  }

  const filteredArray: any[] = [];

  for (let i = 0; i < array.length && filteredArray.length < maxSize; i++) {
    let meetsConditions = true;

    for (const condition of conditions) {
      if (!condition(array[i])) {
        meetsConditions = false;
        break;
      }
    }

    if (meetsConditions) {
      filteredArray.push(array[i]);
    }
  }

  return filteredArray;
}

export function processConfigEntities<T extends EntityConfig | LovelaceRowConfig>(entities: (T | string)[], checkEntityId = true): T[] {
  return entities.map((entityConf, index): T => {
    if (typeof entityConf === 'object' && !Array.isArray(entityConf) && entityConf.type) {
      return entityConf;
    }

    let config: T;

    if (typeof entityConf === 'string') {
      config = { entity: entityConf } as T;
    } else if (typeof entityConf === 'object' && !Array.isArray(entityConf)) {
      if (!('entity' in entityConf)) {
        throw new Error(`Object at position ${index} is missing entity field`);
      }
      config = entityConf as T;
    } else {
      throw new Error(`Invalid entity ID at position ${index}`);
    }

    if (checkEntityId && !isValidEntityId((config as EntityConfig).entity!)) {
      throw new Error(`Invalid entity ID at position ${index}: ${(config as EntityConfig).entity}`);
    }

    return config;
  });
}

export function processEditorEntities(entities: (any | string)[]): EntityConfig[] {
  return entities.map((entityConf) => {
    if (typeof entityConf === 'string') {
      return { entity: entityConf };
    }
    return entityConf;
  });
}

export function findEntities(
  hass: HomeAssistant,
  maxEntities: number,
  entities: string[],
  entitiesFallback: string[],
  includeDomains?: string[],
  entityFilter?: (stateObj: HassEntity) => boolean,
) {
  const conditions: ((value: string) => boolean)[] = [];

  if (includeDomains?.length) {
    conditions.push((eid) => includeDomains!.includes(computeDomain(eid)));
  }

  if (entityFilter) {
    conditions.push(eid => hass.states[eid] && entityFilter(hass.states[eid]),
    );
  }

  const entityIds = arrayFilter(entities, conditions, maxEntities);

  if (entityIds.length < maxEntities && entitiesFallback.length) {
    const fallbackEntityIds = findEntities(
      hass,
      maxEntities - entityIds.length,
      entitiesFallback,
      [],
      includeDomains,
      entityFilter,
    );

    entityIds.push(...fallbackEntityIds);
  }

  return entityIds;
}

export function turnOnOffEntity(hass: HomeAssistant, entityId: string, turnOn = true): Promise<ServiceCallResponse> {
  const stateDomain = computeDomain(entityId);
  const serviceDomain = stateDomain === "group" ? "homeassistant" : stateDomain;

  let service;
  switch (stateDomain) {
    case "lock":
      service = turnOn ? "unlock" : "lock";
      break;
    case "cover":
      service = turnOn ? "open_cover" : "close_cover";
      break;
    case "button":
    case "input_button":
      service = "press";
      break;
    case "scene":
      service = "turn_on";
      break;
    case "valve":
      service = turnOn ? "open_valve" : "close_valve";
      break;
    default:
      service = turnOn ? "turn_on" : "turn_off";
  }

  return hass.callService(serviceDomain, service, { entity_id: entityId });
}

export function toggleEntity(hass: HomeAssistant, entityId: string): Promise<ServiceCallResponse> {
  const turnOn = STATES_OFF.includes(hass.states[entityId].state);
  return turnOnOffEntity(hass, entityId, turnOn);
}