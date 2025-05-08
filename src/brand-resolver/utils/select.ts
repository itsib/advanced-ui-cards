function isShadowRoot(element: any): element is ShadowRoot {
  return element instanceof ShadowRoot;
}

/**
 * Search an element by selector in children of element or in shadow root.
 * @param element
 * @param selector
 */
export function select<T extends HTMLElement = HTMLElement>(element: HTMLElement | ShadowRoot, selector: string): T | null {
  if ((element as any)['renderRoot'] as ShadowRoot) {
    const result = ((element as any)['renderRoot'] as ShadowRoot).querySelector(selector);
    if (result) {
      return result as T;
    }
  }
  const result = element.querySelector?.(selector);
  if (result) {
    return result as T;
  }
  if (!isShadowRoot(element) && element.shadowRoot) {
    return element.shadowRoot.querySelector(selector);
  }
  return null;
}

/**
 * Search an elements by selector in children of element or in shadow root.
 * @param element
 * @param selector
 */
export function selectAll(element: HTMLElement, selector: string): NodeListOf<Element> | null {
  if ((element as any)['renderRoot'] as ShadowRoot) {
    const result = ((element as any)['renderRoot'] as ShadowRoot).querySelectorAll(selector);
    if (result) {
      return result;
    }
  }

  const result = element.querySelectorAll?.(selector);
  if (result) {
    return result;
  }
  if (element.shadowRoot) {
    return element.shadowRoot.querySelectorAll(selector);
  }
  return null;
}