export function formatColors(value?: string | null, defaultColor = 'var(--primary-color)'): string {
  if (!value) return defaultColor;

  switch (value) {
    case 'primary':
      return 'var(--primary-color)';
    case 'accent':
      return 'var(--accent-color)';
    case 'error':
    case 'err':
    case 'danger':
      return 'var(--error-color)';
    case 'warning':
    case 'warn':
      return 'var(--warning-color)';
    case 'success':
      return 'var(--success-color)';
    case 'disabled':
      return 'var(--disabled-color)';
    case 'info':
      return 'var(--info-color)';
    case 'red':
      return 'var(--red-color)';
    case 'pink':
      return 'var(--pink-color)';
    case 'purple':
      return 'var(--purple-color)';
    case 'deep-purple':
      return 'var(--deep-purple-color)';
    case 'indigo':
      return 'var(--indigo-color)';
    case 'blue':
      return 'var(--blue-color)';
    case 'light-blue':
      return 'var(--light-blue-color)';
    case 'cyan':
      return 'var(--cyan-color)';
    case 'teal':
      return 'var(--teal-color)';
    case 'green':
      return 'var(--green-color)';
    case 'light-green':
      return 'var(--light-green-color)';
    case 'lime':
      return 'var(--lime-color)';
    case 'yellow':
      return 'var(--yellow-color)';
    case 'amber':
      return 'var(--amber-color)';
    case 'orange':
      return 'var(--orange-color)';
    case 'deep-orange':
      return 'var(--deep-orange-color)';
    case 'brown':
      return 'var(--brown-color)';
    case 'light-grey':
      return 'var(--light-grey-color)';
    case 'grey':
      return 'var(--grey-color)';
    case 'dark-grey':
      return 'var(--dark-grey-color)';
    case 'blue-grey':
      return 'var(--blue-grey-color)';
    case 'black':
      return 'var(--black-color)';
    case 'white':
      return 'var(--white-color)';
  }

  return value;
}
