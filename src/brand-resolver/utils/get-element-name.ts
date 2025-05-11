export function getElementName(element: HTMLElement | ShadowRoot): string {
  return element instanceof ShadowRoot ? 'SHADOW' : element.nodeName;
}