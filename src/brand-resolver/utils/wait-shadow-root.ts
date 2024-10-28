export async function waitShadowRoot(element: HTMLElement): Promise<ShadowRoot> {
  if (element.shadowRoot) {
    return element.shadowRoot;
  }

  return new Promise(resolve => {
    const attachShadowFn = element.attachShadow;

    element.attachShadow = (init: ShadowRootInit): ShadowRoot => {
        const shadow = attachShadowFn.call(element, init);

        requestAnimationFrame(() => resolve(shadow));

        return shadow;
      }
  });
}