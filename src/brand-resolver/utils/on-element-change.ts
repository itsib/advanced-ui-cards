export type ChangeType = 'add' | 'remove';

export type ChangeDisconnect = () => void;

export interface ChangeFilter {
  nodeName?: string[];
  nodeType?: Node['ELEMENT_NODE'] | Node['TEXT_NODE'];
}

export function onElementChange(element: HTMLElement | ShadowRoot, filter: ChangeFilter, callback: (type: ChangeType, element: HTMLElement) => void): ChangeDisconnect;
export function onElementChange(element: HTMLElement | ShadowRoot, callback: (type: ChangeType, element: HTMLElement) => void): ChangeDisconnect;
export function onElementChange(element: HTMLElement | ShadowRoot, ...rest: any[]): ChangeDisconnect {
  const callback = (typeof rest[0] === 'function' ? rest[0] : rest[1]) as (type: ChangeType, element: HTMLElement) => void;
  const filter = ((typeof rest[0] === 'function' ? {} : rest[0]) || {}) as ChangeFilter;
  const nodeType = filter.nodeType ?? Node['ELEMENT_NODE'];
  const nodeName = filter.nodeName;

  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    for (let i = 0; i < mutations.length; i++) {
      const { addedNodes, removedNodes } = mutations[i];

      // Emit remove first
      for (let j = 0; j < removedNodes.length; j++) {
        const node = removedNodes.item(j);
        if (node && node.nodeType === nodeType && (!nodeName || (nodeName && nodeName.includes(node.nodeName)))) {
          callback('remove', node as HTMLElement);
        }
      }

      // Add elements
      for (let j = 0; j < addedNodes.length; j++) {
        const node = addedNodes.item(j);
        if (node && node.nodeType === nodeType && (!nodeName || (nodeName && nodeName.includes(node.nodeName)))) {
          callback('add', node as HTMLElement);
        }
      }
    }
  });

  observer.observe(element, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
  }
}