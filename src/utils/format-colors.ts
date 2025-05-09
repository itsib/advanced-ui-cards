export function formatColors(value?: string | null, defaultColor = 'var(--primary-color)'): string {
  if (!value) return defaultColor;

  switch (value) {
    case 'primary':
      return 'var(--primary-color)';
    case 'accent':
      return 'var(--accent-color)';
    case 'error':
    case 'err':
      return 'var(--error-color)';
    case 'warning':
    case 'warn':
      return 'var(--warning-color)';
    case 'success':
      return 'var(--success-color)';
    case 'info':
      return 'var(--info-color)';
  }

  return value;
}