export type SubtreeCallback<TReturn extends HTMLElement | ShadowRoot> = (element: TReturn) => void;

export type AbortablePromise<TReturn extends HTMLElement | ShadowRoot = HTMLElement> = Promise<TReturn> & {
  abort: () => void
};

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

function waitShadowRoot(element: HTMLElement, callback: (element: ShadowRoot) => void, signal: AbortSignal): void {
  if (element.shadowRoot) {
    return callback(element.shadowRoot);
  }

  let rafId: ReturnType<typeof requestAnimationFrame> | null = null;
  const attachShadowFn = element.attachShadow;

  const disconnect = () => {
    element.attachShadow = attachShadowFn;
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };

  signal.addEventListener('abort', disconnect, { once: true });

  element.attachShadow = (init: ShadowRootInit): ShadowRoot => {
    const shadow = attachShadowFn.call(element, init);
    element.attachShadow = attachShadowFn;

    rafId = requestAnimationFrame(() => {
      signal.removeEventListener('abort', disconnect);
      callback(shadow);
    });

    return shadow;
  };
}

function waitQuerySelector(root: HTMLElement | ShadowRoot, selector: string, callback: (element: HTMLElement) => void, signal: AbortSignal): void {
  const element = root.querySelector(selector) as HTMLElement;
  if (element) {
    return callback(element);
  }

  let observer: MutationObserver;

  const disconnect = () => observer.disconnect();

  signal.addEventListener('abort', disconnect, { once: true });

  const onMutate = (mutations: MutationRecord[]) => {
    const isAddNode = mutations.some(mutation => mutation.addedNodes.length > 0);
    if (!isAddNode) return;

    const element = root.querySelector(selector) as HTMLElement;
    if (!element) return;

    signal.removeEventListener('abort', disconnect);
    disconnect();

    callback(element);
  };

  observer = new MutationObserver(onMutate);

  observer.observe(root, { childList: true, subtree: true });
}

function waitSubtree<TReturn extends HTMLElement | ShadowRoot>(root: HTMLElement | ShadowRoot, subtree: string[], resolve: SubtreeCallback<TReturn>, signal: AbortSignal): void {
  const [selector, ...innerSubtree] = subtree;

  if (!selector) {
    return resolve(root as TReturn);
  }

  if (selector === ':shadow') {
    return waitShadowRoot(root as HTMLElement, shadow => {
      waitSubtree(shadow, innerSubtree, resolve, signal);
    }, signal);
  } else {
    return waitQuerySelector(root, selector, element => {
      waitSubtree(element, innerSubtree, resolve, signal);
    }, signal);
  }
}

/**
 * Waits for an element to appear in the DOM tree of the element or in its Shadow Dom
 *
 * @example `:shadow .class-name div:shadow`
 * @param element
 * @param selector
 */
export function waitSelector<TReturn extends HTMLElement | ShadowRoot = HTMLElement>(element: HTMLElement | ShadowRoot, selector: string): AbortablePromise<TReturn> {
  const subtree = spreadSelector(selector);
  const abort = new AbortController();
  const promise = new Promise<TReturn>((resolve: (value: TReturn) => void, reject) => {

    abort.signal.addEventListener('abort', reject, { once: true });

    waitSubtree(element, subtree, resolve, abort.signal);
  });

  (promise as any).abort = () => {
    abort.abort();
  };

  return promise as AbortablePromise<TReturn>;
}



