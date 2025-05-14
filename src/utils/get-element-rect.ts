export function getElementRect(element: HTMLElement): Pick<DOMRect, 'x' | 'y' | 'width' | 'height'> {
  const rect = element.getBoundingClientRect();
  if (!rect) {
    throw new Error('No possible compute rect');
  }

  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
}