import { EntityConfigLike, HomeAssistant } from 'types';

export interface ValueWithUnit {
  value?: number;
  unit?: string
}

export function getNumberValueWithUnit(entity: EntityConfigLike, hass: HomeAssistant): ValueWithUnit {
  if (!entity.entity) return {};

  const stateObj = hass.states[entity.entity];
  const stateRaw = entity.attribute ? (stateObj.attributes || {})[entity.attribute] : stateObj?.state;

  const state = hass.formatEntityState(stateObj, stateRaw);

  const [valueRaw, unit] = state.split(/^(\d+(?:\.\d+)?)/).map(item => item.trim()).filter(Boolean);
  const value = parseFloat(valueRaw) || undefined;

  return { value, unit };
}

export function formatNumberValue(hass: HomeAssistant, value: any): string | undefined {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return undefined;
  }
  return numValue.toLocaleString(numberFormatToLocale(hass));
}

function numberFormatToLocale(hass: HomeAssistant): string | string[] | undefined {
  switch (hass.locale.number_format) {
    case 'comma_decimal':
      return ['en-US', 'en']; // Use United States with fallback to English formatting 1,234,567.89
    case 'decimal_comma':
      return ['de', 'es', 'it']; // Use German with fallback to Spanish then Italian formatting 1.234.567,89
    case 'space_comma':
      return ['fr', 'sv', 'cs']; // Use French with fallback to Swedish and Czech formatting 1 234 567,89
    case 'system':
      return undefined;
    default:
      return hass.locale.language;
  }
}
