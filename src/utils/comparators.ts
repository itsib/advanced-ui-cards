export function compareRects(newVal: Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>, oldVal?: Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>) {
  if (!oldVal) return true;

  return newVal.x !== oldVal.x || newVal.y !== oldVal.y || newVal.width !== oldVal.width || newVal.height !== oldVal.height;
}