export type TargetElement = HTMLElement | null | undefined;

export async function waitElement<T extends HTMLElement = HTMLElement>(element: TargetElement, selector: string, inShadowRoot = false): Promise<T | null | undefined> {
  return new Promise(async (resolve, reject) => {
    if (!element) {
      return reject(new Error('Target element not provided'));
    }
    let target: HTMLElement | ShadowRoot;
    if (inShadowRoot) {
      target = await waitShadowRoot(element);
    } else {
      target = element;
    }

    return resolve(target.querySelector(selector) as T);
  });
}

async function waitShadowRoot(element: HTMLElement): Promise<ShadowRoot> {
  if (element.shadowRoot) {
    return element.shadowRoot;
  }
  return new Promise<ShadowRoot>(resolve => {
    const attachShadow = element.attachShadow;

    element.attachShadow = (init: ShadowRootInit): ShadowRoot => {
      setTimeout(() => resolve(element.shadowRoot as ShadowRoot));

      return attachShadow.call(element, init);
    };
  });
}
