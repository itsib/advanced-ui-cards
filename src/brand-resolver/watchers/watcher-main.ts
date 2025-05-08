import { WatcherBase } from './watcher-base';
import { waitSelector } from '../utils';
import { ChangeType, onElementChange } from '../utils/on-element-change';

export class WatcherMain extends WatcherBase {

  private _unsubscribe: Record<string, () => void> = {};

  async onAddElement(element: HTMLElement) {
    switch (element.nodeName) {
      case 'HA-CONFIG-DASHBOARD':
        await this.handleSettingsUpdate(element);
        break;
      case 'HA-CONFIG-INTEGRATIONS-DASHBOARD':
        await this.handleIntegrationList(element);
        break;
      case 'HA-CONFIG-INTEGRATION-PAGE':
        await this.handleIntegrationPage(element);
        break;
      case 'HA-CONFIG-ENTITIES':
        console.log('Add: <partial-panel-resolver /> %o', element);
        break;
      case 'PARTIAL-PANEL-RESOLVER':
        console.log('Add: <partial-panel-resolver /> %o', element);
        break;
    }
  }

  async onRemoveElement(element: HTMLElement) {
    switch (element.nodeName) {
      case 'HA-CONFIG-DASHBOARD':
        this._unsubscribe['HA-CONFIG-DASHBOARD']?.();
        Reflect.deleteProperty(this._unsubscribe, 'HA-CONFIG-DASHBOARD');
        break;
      case 'HA-CONFIG-INTEGRATIONS':
        break;
      case 'HA-CONFIG-INTEGRATIONS-DASHBOARD':
        break;
    }
  }

  async handleIntegrationList(root: HTMLElement) {
    const container = await waitSelector(root, ':shadow hass-tabs-subpage .container');
    if (!container) return;

    for (const element of container.children) {
      const domain = element.getAttribute('data-domain');
      const src = this.getImgSrc(domain);

      if (src) {
        const img = await waitSelector(element as HTMLElement, ':shadow ha-integration-header :shadow img');
        if (img) {
          (img as HTMLImageElement).src = src;
        }
      }
    }
  }

  async handleIntegrationPage(root: HTMLElement) {
    const domain = (root as any)?.domain as string;
    const src = this.getImgSrc(domain);
    if (!src || !domain) return;

    console.log('root %o', root);
    const img = await waitSelector(root, ':shadow hass-subpage .container .logo-container img');
    if (img) {
      (img as HTMLImageElement).src = src;
    }
  }

  async handleSettingsUpdate(root: HTMLElement) {
    const observable = await waitSelector(root, ':shadow ha-top-app-bar-fixed ha-config-section');
    if (!observable) return;

    console.log(observable);
    this._unsubscribe['HA-CONFIG-DASHBOARD'] = onElementChange(observable, (type: ChangeType, element: HTMLElement) => {
      if (type === 'add' && element.nodeName === 'HA-CONFIG-UPDATES') {
        console.log(type, element);
      }

    });
  }
}
