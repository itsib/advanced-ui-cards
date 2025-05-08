import { resolveElement } from '../utils';

const DEFAULT_CONFIG: MutationObserverInit = Object.freeze({
  childList: true,
  subtree: true,
});

export abstract class WatcherBase {

  protected _images: { [domain: string]: string };

  protected _element: HTMLElement;

  protected _shadow: ShadowRoot | null = null;

  protected _observer: MutationObserver;

  protected constructor(element: HTMLElement, images: { [domain: string]: string }, config: MutationObserverInit = DEFAULT_CONFIG) {
    this._element = element;
    this._images = images;
    this._observer = new MutationObserver(m => this._onMutate(m));

    if (this._element.shadowRoot) {
      this._shadow = this._element.shadowRoot;
      this._observer.observe(this._shadow, config);
    } else {
      this._observer.observe(this._element, config);

      const attachShadowFn = this._element.attachShadow;
      this._element.attachShadow = (init: ShadowRootInit): ShadowRoot => {
        const shadow = attachShadowFn.call(this._element, init);

        this._shadow = shadow;
        this._observer.observe(this._shadow, config);

        return shadow;
      }
    }
  }

  abstract onAddElement(element: HTMLElement): Promise<void>;

  abstract onRemoveElement(element: HTMLElement): Promise<void>;

  destroy() {
    this._observer.disconnect();
    Reflect.deleteProperty(this, '_observer');
    Reflect.deleteProperty(this, '_element');
  }

  getImgSrc(domain?: string | null): string | null {
    return domain && domain in this._images ? this._images[domain] : null;
  }

  private _onMutate(mutations: MutationRecord[]): void {
    for (let i = 0; i < mutations.length; i++) {
      const { addedNodes, removedNodes } = mutations[i];

      // Emit remove first
      for (let j = 0; j < removedNodes.length; j++) {
        const node = removedNodes.item(j);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          this.onRemoveElement(node as HTMLElement).catch(console.error);
        }
      }

      for (let j = 0; j < addedNodes.length; j++) {
        const node = addedNodes.item(j);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          this._resolveNewElement(node as HTMLElement);
        }
      }
    }
  }

  private _resolveNewElement(element: HTMLElement) {
    resolveElement(element).then(this.onAddElement.bind(this)).catch(console.error);
  }
}