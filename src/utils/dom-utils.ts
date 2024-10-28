function waitShadowRoot(root: HTMLElement, callback: (shadowRoot: ShadowRoot) => void): () => void {
  let attachShadowSrc: ((init: ShadowRootInit) => ShadowRoot) | undefined = root.attachShadow;

  root.attachShadow = (init: ShadowRootInit): ShadowRoot => {
    if (!attachShadowSrc) {
      throw new Error('No attachShadow function');
    }
    const shadowRoot = attachShadowSrc.call(root, init);

    callback(shadowRoot);

    root.attachShadow = attachShadowSrc;
    attachShadowSrc = undefined;

    return shadowRoot;
  }

  return () => {
    if (!attachShadowSrc) {
      return;
    }
    root.attachShadow = attachShadowSrc;
    attachShadowSrc = undefined;
  };
}

function waitHtmlElement<T extends HTMLElement = HTMLElement>(root: HTMLElement | ShadowRoot, selector: string, callback: (element: T) => void): () => void {
  const alreadyFound = root.querySelector(selector);
  if (alreadyFound) {
    setTimeout(() => callback(alreadyFound as T), 1);
    return () => {};
  }

  let observer: MutationObserver | undefined = new MutationObserver(() => {
    const found = root.querySelector(selector) as T | null | undefined;
    if (found && observer) {
      observer.disconnect();
      callback(found);

      observer = undefined;
    }
  });

  observer.observe(root, { childList: true, subtree: true });

  return () => {
    observer?.disconnect();
    observer = undefined;
  };
}

function waitChildNode<T extends HTMLElement = HTMLElement>(root: HTMLElement, selector: string, callback: (element: T) => void): () => void {
  if (!root) {
    throw new Error('Target element not provided');
  }

  if (!selector) {
    throw new Error('No selector provided');
  }

  const alreadyFound = querySelector(root, selector);
  if (alreadyFound) {
    setTimeout(() => callback(alreadyFound as T), 1);
    return () => {};
  }

  let destroy0: (() => void) | undefined = undefined;
  let destroy1: (() => void) | undefined = undefined;
  let destroy2: (() => void) | undefined = undefined;

  const destroy = () => {
    destroy0?.();
    destroy1?.();
    destroy2?.();
  }

  // Element found callback
  const onFound = (element: T) => {
    destroy();
    callback(element);
  }

  // Direct find query
  destroy0 = waitHtmlElement<T>(root, selector, onFound)

  // Try to find through shadow root
  destroy1 = waitShadowRoot(root, (shadowRoot: ShadowRoot) => {
    destroy2 = waitHtmlElement<T>(shadowRoot, selector, onFound);
  });

  return () => {
    destroy();
  }
}

export async function waitElement<T extends HTMLElement = HTMLElement>(root: HTMLElement, selector: string, timeout = Infinity): Promise<T> {
  root = await resolveElement(root);

  return new Promise<T>((resolve, reject) => {
    let cancel: (() => void) | undefined = undefined;

    let rejectTimer: ReturnType<typeof setTimeout> | undefined = undefined;
    if (isFinite(timeout)) {
      rejectTimer = setTimeout(() => {
        cancel?.();
        reject(new DOMException(`Timeout - "${selector}"`, 'TimeoutError'));
      }, timeout)
    }

    cancel = waitChildNode<T>(root, selector, element => {
      if (rejectTimer != null) {
        clearTimeout(rejectTimer);
      }

      resolve(element);
    });
  });
}

export async function resolveElement(element: HTMLElement): Promise<HTMLElement> {
  return new Promise(async resolve => {
    if ((element as any).updateComplete) {
      await (element as any).updateComplete;
    }
    setTimeout(() => resolve(element), 10);
  })
}

export function querySelector<T extends HTMLElement = HTMLElement>(element: HTMLElement, selector: string): T | null {
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
  if (element.shadowRoot) {
    return element.shadowRoot.querySelector(selector);
  }
  return null;
}

