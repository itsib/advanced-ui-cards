import {
  EntityConfigLike,
  HassEntity,
  HomeAssistant,
  IEntityConfigSchema,
  IGaugeConfigSchema,
  ServiceCallResponse,
} from 'types';

/** States that we consider "off". */
export const STATES_OFF = ['closed', 'locked', 'off'];

export function isValidEntityId(id: string): boolean {
  return /^(\w+)\.(\w+)$/.test(id);
}

export function computeDomain(entityId: string): string {
  return entityId.substring(0, entityId.indexOf('.'));
}

export function processEntities(entities?: (any | string)[]) {
  if (!entities) return[];

  const results: IEntityConfigSchema[] = [];
  for (let i = 0; i < entities.length; i++) {
     const entity = entities[i];
     if (!entity) continue;

     if (typeof entity === 'string') {
       results.push({ entity: entity });
     } else if (typeof entity === 'object' && !Array.isArray(entity)) {
       if ('type' in entity || 'entity' in entity) {
         results.push({ ...entity });
       } else {
         throw new Error(`Object at position ${i} is missing entity or type field`);
       }
     } else {
       throw new Error(`Invalid entity at position ${i}`);
     }
  }

  return results;
}

export function processGauges(gauges?: (any | string)[], maxCount = 2) {
  if (!gauges) return [];

  if (gauges.length > maxCount) {
    throw new Error(`MAx gauge count is ${maxCount}`);
  }

  const results: IGaugeConfigSchema[] = [];
  for (let i = 0; i < gauges.length; i++) {
     const gauge = gauges[i];
     if (!gauge) continue;

     if (typeof gauge === 'string') {
       results.push({ entity: gauge });
     } else if (typeof gauge === 'object' && !Array.isArray(gauge)) {
       if ('type' in gauge || 'entity' in gauge) {
         results.push({ ...gauge });
       } else {
         throw new Error(`Gauge at position ${i} is missing entity or type field`);
       }
     } else {
       throw new Error(`Invalid gauge at position ${i}`);
     }
  }

  return results;
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

export interface ProcessEntitiesOpts<T extends EntityConfigLike> {
  domains?: string[] | string;
  maxCount?: number;
  validateMode?: 'throw' | 'skip';
  callback?: (entity: any) => T | null;
}

export function processEntities2<T extends EntityConfigLike>(entities?: (any | string)[], opts: ProcessEntitiesOpts<T> = {}): T[] {
  const domains = opts.domains ? typeof opts.domains === 'string' ? [opts.domains] : opts.domains : null;
  const maxCount = opts.maxCount ?? Infinity;
  const validateMode = opts.validateMode == null ? 'throw' : opts.validateMode;
  const callback = opts.callback || ((entity: any) => entity);

  if (!entities) {
    if (validateMode === 'skip') return [];

    throw new Error(`No entities provided`);
  }

  if (maxCount < entities.length && validateMode !== 'skip') {
    throw new Error(`The maximum number of elements is ${maxCount}`);
  }

  const results: T[] = [];
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    if (!entity) {
      if (validateMode === 'skip') continue;

      throw new Error(`Missing entity in position ${i}, null provided`);
    }

    let result: T;
    if (typeof entity === 'string') {
      result = { entity: entity } as T;
    } else if (typeof entity === 'object' && !Array.isArray(entity)) {
      if ('type' in entity || 'entity' in entity) {
        result = { ...entity } as T;
      } else {
        if (validateMode === 'skip') continue;

        throw new Error(`Object at position ${i} is missing entity or type field`);
      }
    } else {
      if (validateMode === 'skip') continue;

      throw new Error(`Invalid entity at position ${i}`);
    }

    let domain: string | null = null;
    if (result.entity) {
      const regExResult = /^(\w+)\.(\w+)$/.exec(result.entity);
      if (regExResult) {
        domain = regExResult[1];
      } else {
        if (validateMode === 'skip') continue;

        throw new Error(`Invalid entity ID at position ${i}: ${result.entity}`);
      }
    }

    if (domains?.length) {
      if (!domain) continue;

      if (!domains.includes(domain)) {
        if (validateMode === 'skip') continue;

        throw new Error(`Invalid entity domain ${domain} at position ${i}. Allowed ${domains.join('. ')}`);
      }
    }

    result = callback(result);
    if (!result) continue;

    results.push(result);
    if (results.length >= maxCount) break;
  }

  return results;
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
  const serviceDomain = stateDomain === 'group' ? 'homeassistant' : stateDomain;

  let service;
  switch (stateDomain) {
    case 'lock':
      service = turnOn ? 'unlock' : 'lock';
      break;
    case 'cover':
      service = turnOn ? 'open_cover' : 'close_cover';
      break;
    case 'button':
    case 'input_button':
      service = 'press';
      break;
    case 'scene':
      service = 'turn_on';
      break;
    case 'valve':
      service = turnOn ? 'open_valve' : 'close_valve';
      break;
    default:
      service = turnOn ? 'turn_on' : 'turn_off';
  }

  return hass.callService(serviceDomain, service, { entity_id: entityId });
}

export function toggleEntity(hass: HomeAssistant, entityId: string): Promise<ServiceCallResponse> {
  const turnOn = STATES_OFF.includes(hass.states[entityId].state);
  return turnOnOffEntity(hass, entityId, turnOn);
}