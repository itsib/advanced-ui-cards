import { selectAll } from './select';

export async function waitSelectAll(element: HTMLElement, selector: string): Promise<NodeListOf<Element>> {
  const nodeList = selectAll(element, selector);
  if (nodeList?.length) return nodeList;

  return new Promise<NodeListOf<Element>>(resolve => {
    const shadowRoot = element.shadowRoot || ((element as any)['renderRoot'] as ShadowRoot);
    const observable = shadowRoot || element;

    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const newNodes = mutations.flatMap(({ addedNodes }) => addedNodes);
      if (!newNodes.length) return;

      observer.disconnect();

      setTimeout(() => resolve(selectAll(element, selector)!), 50);
    });

    observer.observe(observable, { childList: true, subtree: true });
  });
}