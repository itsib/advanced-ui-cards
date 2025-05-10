export interface ChangeDisconnect {
   (): void;
}

export interface ChangeCallbacks {
  onAdd?: (observable: HTMLElement | ShadowRoot, element: HTMLElement) => void;
  onRemove?: (observable: HTMLElement | ShadowRoot, element: HTMLElement) => void;
}

export function onElementChange(observable: HTMLElement | ShadowRoot, callbacks: ChangeCallbacks): ChangeDisconnect {
  const { onAdd, onRemove } = callbacks;

  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    for (let i = 0; i < mutations.length; i++) {
      const { addedNodes, removedNodes, target } = mutations[i];

      // Emit remove first
      for (let j = 0; j < removedNodes.length; j++) {
        const node = removedNodes.item(j);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          onRemove?.(target as HTMLElement, node as HTMLElement);
        }
      }

      // Add elements
      for (let j = 0; j < addedNodes.length; j++) {
        const node = addedNodes.item(j);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          onAdd?.(target as HTMLElement, node as HTMLElement);
        }
      }
    }
  });

  observer.observe(observable, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
  };
}