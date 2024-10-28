import { Watcher } from './watcher';
import { select, waitSelect, waitSelectAll } from '../utils';

export class WatcherMain extends Watcher {

  onRemoveElement(element: HTMLElement) {
    switch (element.nodeName) {
      case 'HA-CONFIG-INTEGRATIONS':
      case 'HA-CONFIG-INTEGRATIONS-DASHBOARD':
        // console.log('REMOVE HA-CONFIG-INTEGRATIONS-DASHBOARD');
        break;
    }
  }

  onAddElement(element: HTMLElement) {
    switch (element.nodeName) {
      case 'HA-CONFIG-INTEGRATIONS-DASHBOARD':
        waitSelectAll(element, '[data-domain]').then(list => this.handleIntegrationList(list));
        break;
      case 'HA-CONFIG-INTEGRATION-PAGE':
        const domain = (element as any)?.domain as string;
        waitSelect<HTMLElement>(element, '.logo-container').then(_element => _element && this.handleIntegrationPage(domain, _element));
        break;
    }
  }

  handleIntegrationList(list: NodeListOf<Element>) {
    for (const element of list.values()) {
      const domain= element.getAttribute('data-domain');
      const src = this.getImgSrc(domain);

      if (src) {
        const header = select(element as HTMLElement, 'ha-integration-header');
        if (header) {
          const img = select<HTMLImageElement>(header, 'img');
          if (img) {
            img.src = src;
          }
        }
      }
    }
  }

  handleIntegrationPage(domain: string, element: HTMLElement) {
    const src = this.getImgSrc(domain);
    const img = select<HTMLImageElement>(element, 'img');
    if (img && src) {
      img.src = src;
    }
  }
}
