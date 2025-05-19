export const THEME_COLORS_SET = new Set([
  'primary',
  'accent',
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'light-grey',
  'grey',
  'dark-grey',
  'blue-grey',
  'black',
  'white',
]);

export const THEME_COLORS = Array.from(THEME_COLORS_SET);

export function formatColors(value?: string | null, defaultColor = 'var(--disabled-color)'): string {
  if (!value) return defaultColor;

   if (THEME_COLORS_SET.has(value)) {
     return `var(--${value}-color)`
   }

  return value;
}
