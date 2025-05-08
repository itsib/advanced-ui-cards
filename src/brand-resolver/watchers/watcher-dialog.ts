import { WatcherBase } from './watcher-base';

export class WatcherDialog extends WatcherBase {

  constructor(element: HTMLElement, images: { [domain: string]: string }) {
    super(element, images);
  }

  destroy() {
    super.destroy()
    Reflect.deleteProperty(this, '_images');
  }

  onAddElement(element: HTMLElement) {
    if (!(element as any)?.integration?.domain) return;
    const domain = (element as any).integration.domain as string;

    const src = this.getImgSrc(domain);
    if (src) {
      const img = element.shadowRoot?.querySelector('span img')! as HTMLImageElement;
      if (img) {
        img.src = src
      }
    }
  }

  onRemoveElement(_element: HTMLElement) {}
}