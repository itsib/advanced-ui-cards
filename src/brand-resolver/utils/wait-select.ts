import { selectAll, select } from './select';

/**
 * Returns an element. If element contains shadow root then returns them.
 *
 * @param element
 */
function getElement(element: HTMLElement): ShadowRoot | HTMLElement {
  const shadowRoot = element.shadowRoot || ((element as any)['renderRoot'] as ShadowRoot);
  return shadowRoot || element;
}

/**
 * Waits for an element to appear in the DOM tree of the element or in its Shadow Dom
 * @param element
 * @param selector
 */
export async function waitSelect<T extends HTMLElement = HTMLElement>(element: HTMLElement, selector: string): Promise<T | null> {
  const selected = select<T>(element, selector);
  if (selected) return selected;

  return new Promise<T | null>(resolve => {
    const observable = getElement(element);

    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const newNodes = mutations.flatMap(({ addedNodes }) => addedNodes);
      if (!newNodes.length) return;

      observer.disconnect();

      setTimeout(() => resolve(select<T>(element, selector)), 50);
    });

    observer.observe(observable, { childList: true, subtree: true });
  })
}

export async function waitSelectAll(element: HTMLElement, selector: string): Promise<NodeListOf<Element>> {
  const nodeList = selectAll(element, selector);
  if (nodeList?.length) return nodeList;

  return new Promise<NodeListOf<Element>>(resolve => {
    const observable = getElement(element);

    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const newNodes = mutations.flatMap(({ addedNodes }) => addedNodes);
      if (!newNodes.length) return;

      observer.disconnect();

      setTimeout(() => resolve(selectAll(element, selector)!), 50);
    });

    observer.observe(observable, { childList: true, subtree: true });
  })
}