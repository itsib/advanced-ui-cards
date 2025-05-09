import { waitSelector } from './wait-selector';
import { ChangeDisconnect, ChangeType, onElementChange } from './on-element-change';

export type ReplacementImages = { [domain: string]: string };

export type DomWatcherRootElement = HTMLElement | ShadowRoot;

export interface DomWatcherConfig {
  root: DomWatcherRootElement;
  images: ReplacementImages;
}

export class DomWatcher {

  private _root: DomWatcherRootElement;

  private _images: ReplacementImages;

  private _watchers: Record<string, ChangeDisconnect> = {};

  constructor(config: DomWatcherConfig) {
    this._root = config.root;
    this._images = config.images;

    onElementChange(this._root, this.onChangeCallback.bind(this));
  }

  getImgSrc(domain?: string | null): string | null {
    return domain && domain in this._images ? this._images[domain] : null;
  }

  onChangeCallback(type: ChangeType, element: HTMLElement): void {
    if (type === 'remove') {
      if (element.nodeName in this._watchers) {
        this._watchers[element.nodeName]?.();
        Reflect.deleteProperty(this._watchers, element.nodeName);
      }
      return;
    }

    this[element.nodeName]?.(element);
  }

  private async ['HOME-ASSISTANT-MAIN'](element: HTMLElement) {
    const root = await waitSelector(element, ':shadow');
    if (!root) return;

    this._watchers[element.nodeName] = onElementChange(root, this.onChangeCallback.bind(this));
  }

  private async ['DIALOG-ADD-INTEGRATION'](element: HTMLElement) {
    const root = await waitSelector(element, ':shadow');
    if (!root) return;

    this._watchers[element.nodeName] = onElementChange(root, this.onChangeCallback.bind(this));
  }

  private async ['HA-MORE-INFO-DIALOG'](element: HTMLElement) {
    const domain = (element as any)?.['_entityId']?.replace(/^update\./, '')?.replace(/_update$/, '');
    const url = this.getImgSrc(domain);
    if (!url) return;

    const badge = await waitSelector(element, ':shadow ha-more-info-info :shadow state-card-content :shadow state-card-update :shadow state-info :shadow state-badge');
    if (!badge) return;
    (badge as HTMLElement).style.backgroundImage = `url("${url}")`;
  }

  private async ['HA-INTEGRATION-LIST-ITEM'](element: HTMLElement) {
    if (!(element as any)?.integration?.domain) return;

    const domain = (element as any).integration.domain as string;
    const src = this.getImgSrc(domain);
    if (!src) return;

    const img = await waitSelector(element, ':shadow .material-icons img');
    if (!img) return;

    (img as HTMLImageElement).src = src;
  }

  private async ['HA-CONFIG-INTEGRATIONS-DASHBOARD'](element: HTMLElement) {
    const container = await waitSelector(element, ':shadow hass-tabs-subpage .container');
    if (!container) return;

    for (const child of container.children) {
      const domain = child.getAttribute('data-domain');
      const src = this.getImgSrc(domain);
      if (!src) continue;

      const img = await waitSelector(child as HTMLElement, ':shadow ha-integration-header :shadow img');
      if (!img) continue;

      (img as HTMLImageElement).src = src;
    }
  }

  private async ['HA-CONFIG-INTEGRATION-PAGE'](element: HTMLElement) {
    const domain = (element as any)?.domain as string;
    const src = this.getImgSrc(domain);
    if (!src || !domain) return;

    const img = await waitSelector(element, ':shadow hass-subpage .container .logo-container img');
    if (!img) return;

    (img as HTMLImageElement).src = src;
  }

  private async ['HA-CONFIG-DASHBOARD'](element: HTMLElement) {
    const configSection = await waitSelector(element, ':shadow ha-top-app-bar-fixed ha-config-section');
    if (!configSection) return;

    const updates = configSection.querySelector('ha-config-updates');
    if (updates) {
      this['HA-CONFIG-UPDATES'](updates as HTMLElement);
    }

    const repairs = configSection.querySelector('ha-config-repairs');
    if (repairs) {
      this['HA-CONFIG-REPAIRS'](repairs as HTMLElement);
    }

    this._watchers[element.nodeName] = onElementChange(configSection, this.onChangeCallback.bind(this));
  }

  private async ['HA-CONFIG-UPDATES'](element: HTMLElement) {
    const section = await waitSelector(element, ':shadow mwc-list');
    if (!section || section.children.length === 0) return;

    for (const child of section.children) {
      const domain = (child as any)?.entity_id?.replace(/^update\./, '')?.replace(/_update$/, '');
      const url = this.getImgSrc(domain);
      if (!url) continue;

      const badge = child.querySelector('state-badge');
      if (!badge) continue;
      (badge as HTMLElement).style.backgroundImage = `url("${url}")`;
    }
  }

  private async ['HA-CONFIG-REPAIRS'](element: HTMLElement) {
    const section = await waitSelector(element, ':shadow ha-md-list');
    if (!section || section.children.length === 0) return;

    for (const child of section.children) {
      const domain = (child as any)?.issue?.issue_domain;
      const url = this.getImgSrc(domain);
      if (!url) continue;

      const img = child.querySelector('img');
      if (!img) continue;
      (img as HTMLImageElement).src = url;
    }
  }
}