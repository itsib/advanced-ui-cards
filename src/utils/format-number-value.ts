import type { EntityConfigLike, HomeAssistant } from 'types';

export function getStateToNumber(entity: EntityConfigLike, hass: HomeAssistant): number {
  if (!entity.entity) return 0;

  const stateObj = hass.states[entity.entity]!;
  const stateString = entity.attribute ? (stateObj.attributes || {})[entity.attribute] : stateObj?.state;

  return parseFloat(stateString) || 0;
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
