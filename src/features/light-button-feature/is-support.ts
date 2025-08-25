import type { LovelaceCardFeatureContext } from 'types';
import { computeDomain } from '../../utils/entities-utils';

export function isSupported(stateObj: LovelaceCardFeatureContext): boolean {
  if (stateObj.entity_id) {
    return computeDomain(stateObj.entity_id) === 'light';
  }
  return false;
}