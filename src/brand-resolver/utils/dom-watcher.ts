import { waitSelector } from './wait-selector';
import { ChangeDisconnect, onElementChange } from './on-element-change';
import { HomeAssistant } from 'types';

export type ReplacementImages = { [domain: string]: string };

export type DomWatcherRootElement = HTMLElement | ShadowRoot;

export interface DomWatcherConfig {
  root: DomWatcherRootElement;
  images: ReplacementImages;
  debug?: boolean;
}

export interface Connection {

}

const FORMATS = {
  subscribe: 'color: #999999;',
  new_node_call: 'color: #66FF66;',
  new_node_skip: 'color: #448844; text-decoration: line-through;',
  rm_node_call: 'color: #FF6666;',
  rm_node_skip: 'color: #884444; text-decoration: line-through;',
  default: 'color: #EAEAEA;',
};

export class DomWatcher {

  private _hass?: HomeAssistant;

  private readonly _root: DomWatcherRootElement;

  private readonly _images: ReplacementImages;

  private readonly _domains: string[];

  private readonly _debug: boolean;

  private readonly _watchers = new WeakMap<HTMLElement | ShadowRoot, ChangeDisconnect>();

  constructor(config: DomWatcherConfig) {
    this._root = config.root;
    this._images = config.images;
    this._domains = Object.keys(this._images);
    this._debug = config.debug || false;

    this.subscribe(this._root);
  }

  log(type: string, ...objects: any[]): void {
    if (!this._debug) return;

    const color = FORMATS[type] || FORMATS.default;
    const label = type
      .replace(/_/g, ' ')
      .replace('skip', '🗴')
      .replace('call', '✔')
      .replace(/(^\w)/, c => c.toUpperCase());

    const template = '%c%s%c%s' + '%O'.repeat(objects.length);

    const space = ':' + ' '.repeat(14 - label.length);

    console.log(template, color, label, '', space, ...objects);
  }

  getImgSrc(domain?: string | null): string | null {
    return domain && domain in this._images ? this._images[domain] : null;
  }

  getDomainByEntityId(entityId: string): string | null {
    for (let i = 0; i < this._domains.length; i++) {
      const domain = this._domains[i];
      const state = this._hass?.states?.[entityId];
      if (state && state.attributes?.entity_picture?.includes(domain)) {
        return domain;
      }
      const name = entityId.split('.', 2)[1];
      if (name && name.includes(domain)) {
        return domain;
      }
    }
    return null;
  }

  onRemoveCallback(target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const methodRm = `RM-${element.nodeName}`;

    if (this._watchers.has(element)) {
      this._watchers.get(element)?.();
      this._watchers.delete(element);
    }

    if (methodRm in this) {
      this.log('rm_node_call', element, target);
      this[methodRm](target, element);
    } else {
      this.log('rm_node_skip', element, target);
    }
  }

  onAddCallback(target: HTMLElement | ShadowRoot, element: HTMLElement): void {
    const methodNew = `NEW-${element.nodeName}`;

    if (methodNew in this) {
      this.log('new_node_call', element, target);

      this[methodNew](target, element);
    } else {
      this.log('new_node_skip', element, target);
    }
  }

  subscribe(observable: HTMLElement | ShadowRoot) {
    this.log('subscribe', observable);

    const disconnect = onElementChange(observable, {
      onAdd: this.onAddCallback.bind(this),
      onRemove: this.onRemoveCallback.bind(this),
    });


    this._watchers.set(observable, disconnect);
  }

  private async ['NEW-HOME-ASSISTANT-MAIN'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    this._hass = (element as any).hass;

    const observable = await waitSelector(element, ':shadow');
    if (!observable) return;

    this.subscribe(observable);
  }

  private async ['NEW-DIALOG-ADD-INTEGRATION'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const observable = await waitSelector(element, ':shadow');
    if (!observable) return;

    this.subscribe(observable);
  }

  private async ['NEW-HA-MORE-INFO-DIALOG'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const entityId = (element as any)?.['_entityId'];
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;

    const badge = await waitSelector(element, ':shadow ha-more-info-info :shadow state-card-content :shadow state-card-update :shadow state-info :shadow state-badge');
    if (!badge) return;
    (badge as HTMLElement).style.backgroundImage = `url("${url}")`;
  }

  private async ['NEW-HA-INTEGRATION-LIST-ITEM'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    if (!(element as any)?.integration?.domain) return;

    const domain = (element as any).integration.domain as string;
    const src = this.getImgSrc(domain);
    if (!src) return;

    const img = await waitSelector(element, ':shadow .material-icons img');
    if (!img) return;

    (img as HTMLImageElement).src = src;
  }

  private async ['NEW-HA-CONFIG-INTEGRATIONS-DASHBOARD'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
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

  private async ['NEW-HA-CONFIG-INTEGRATION-PAGE'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const domain = (element as any)?.domain as string;
    const src = this.getImgSrc(domain);
    if (!src || !domain) return;

    const img = await waitSelector(element, ':shadow hass-subpage .container .logo-container img');
    if (!img) return;

    (img as HTMLImageElement).src = src;
  }

  private async ['NEW-HA-CONFIG-DASHBOARD'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const observable = await waitSelector<HTMLElement>(element, ':shadow ha-top-app-bar-fixed');
    if (!observable) return;

    const repairs = await waitSelector(observable, 'ha-config-repairs');
    const updates = await waitSelector(observable, 'ha-config-updates');

    if (repairs && repairs.nodeName === 'HA-CONFIG-REPAIRS') {
      this.onAddCallback(observable, repairs);
    }

    if (updates && updates.nodeName === 'HA-CONFIG-UPDATES') {
      this.onAddCallback(observable, updates);
    }

    this.subscribe(repairs);
    this.subscribe(updates);
  }

  private async ['NEW-HA-CONFIG-UPDATES'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const section = await waitSelector(element, ':shadow');
    if (!section) return;
    let list: HTMLElement | null = null;
    for (const item of section.children) {
      if (/list/i.test(item.nodeName)) {
        list = item as HTMLElement;
        break;
      }
    }

    if (!list || list.children.length === 0) return;

    for (const child of list.children) {
      const entityId = (child as any)?.entity_id as string;
      const domain = this.getDomainByEntityId(entityId);
      const url = this.getImgSrc(domain);
      if (!url) continue;

      const badge = child.querySelector('state-badge');
      if (!badge) continue;
      (badge as HTMLElement).style.backgroundImage = `url("${url}")`;
    }

    this.subscribe(list);
  }

  private async ['NEW-HA-CONFIG-REPAIRS'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const section = await waitSelector(element, ':shadow ha-md-list');
    if (!section) return;

    if (!section || section.children.length === 0) return;

    for (const child of section.children) {
      const domain = (child as any)?.issue?.issue_domain;
      const url = this.getImgSrc(domain);
      if (!url) continue;

      const img = child.querySelector('img');
      if (!img) continue;
      (img as HTMLImageElement).src = url;
    }

    this.subscribe(section);
  }
}