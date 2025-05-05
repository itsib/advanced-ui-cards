import { refine, string } from 'superstruct';
import { isCustomType } from '../../utils/entities-utils';

export function customType() {
  return refine(string(), "custom element type", isCustomType);
}