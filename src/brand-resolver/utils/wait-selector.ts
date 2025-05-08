function spreadSelector(selector: string): string[] {
  const selectors = selector.trim().split(/(:shadow)/);
  const spread: string[] = [];

  for (let i = 0; i < selectors.length; i++) {
    const item = selectors[i].trim();
    if (item) {
      spread.push(item);
    }
  }

  return spread;
}

function waitShadowRoot(element: HTMLElement, callback: (element: ShadowRoot) => void): void {
  if (element.shadowRoot) {
    return callback(element.shadowRoot);
  }

  const attachShadowFn = element.attachShadow;

  element.attachShadow = (init: ShadowRootInit): ShadowRoot => {
    const shadow = attachShadowFn.call(element, init);

    element.attachShadow = attachShadowFn;

    requestAnimationFrame(() => callback(shadow));

    return shadow;
  };
}

function waitQuerySelector(element: HTMLElement | ShadowRoot, selector: string, callback: (element: HTMLElement) => void): void {
  const foundElement = element.querySelector(selector) as HTMLElement;
  if (foundElement) {
    return callback(foundElement);
  }

  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    const idAddNode = mutations.some(mutation => mutation.addedNodes.length > 0);
    if (idAddNode) {
      const foundElement = element.querySelector(selector) as HTMLElement;
      if (foundElement) {
        observer.disconnect();
        return callback(foundElement);
      }
    }
  });

  observer.observe(element, { childList: true, subtree: true });
}

function waitSubtree(root: HTMLElement | ShadowRoot, subtree: string[], resolve: (element: HTMLElement | ShadowRoot | null) => void): void {
  const [selector, ...innerSubtree] = subtree;

  if (!selector) {
    return resolve(root);
  }

  if (selector === ':shadow') {
    return waitShadowRoot(root as HTMLElement, shadow => {
      waitSubtree(shadow, innerSubtree, resolve);
    });
  } else {
    return waitQuerySelector(root, selector, element => {
      waitSubtree(element, innerSubtree, resolve);
    });
  }
}

/**
 * Waits for an element to appear in the DOM tree of the element or in its Shadow Dom
 *
 * @example `:shadow .class-name div:shadow`
 * @param element
 * @param selector
 */
export function waitSelector(element: HTMLElement | ShadowRoot, selector: string): Promise<HTMLElement | ShadowRoot | null> {
  const subtree = spreadSelector(selector);

  return new Promise(resolve => {
    waitSubtree(element, subtree, resolve);
  });
}



