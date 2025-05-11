import { waitSelector } from './wait-selector';
import { ChangeCallbacks, ChangeDisconnect, onElementChange } from './on-element-change';
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
  attr_call: '',
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

    let template = '%c%s%c%s';

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      if (typeof object === 'string') {
        template += ' %s';
      } else if (object && typeof object === 'object') {
        template += ' %O';
      }
    }

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
    const methodId = `RM-${element.nodeName}`;

    if (this._watchers.has(element)) {
      this._watchers.get(element)?.();
      this._watchers.delete(element);
    }

    if (methodId in this) {
      this.log('rm_node_call', element, target);
      this[methodId](target, element);
    } else {
      this.log('rm_node_skip', element, target);
    }
  }

  onAddCallback(target: HTMLElement | ShadowRoot, element: HTMLElement): void {
    const methodId = `NEW:${element.nodeName}`;

    if (methodId in this) {
      this.log('new_node_call', element, target);

      this[methodId](target, element);
    } else {
      this.log('new_node_skip', element, target);
    }
  }

  onAttributeCallback(target: HTMLElement | ShadowRoot, attributeName: string, oldValue: string | null): void {
    const methodId = `ATTR:${target.nodeName}[${attributeName.toUpperCase()}]`;

    if (methodId in this) {
      this.log('attr_call', attributeName, target);

      this[methodId](target, attributeName, oldValue);
    } else {
      this.log('attr_skip', attributeName, target);
    }
  }

  subscribe(observable: HTMLElement | ShadowRoot, watchAttrs = false) {
    this.log('subscribe', observable);

    const callbacks: ChangeCallbacks = {
      onAdd: this.onAddCallback.bind(this),
      onRemove: this.onRemoveCallback.bind(this),
      ...(watchAttrs ? { onAttribute: this.onAttributeCallback.bind(this) } : {}),
    };

    const disconnect = onElementChange(observable, callbacks);

    this._watchers.set(observable, disconnect);
  }

  private async ['ATTR:STATE-BADGE[STYLE]'](target: HTMLElement | ShadowRoot, attributeName: string, _oldValue: string | null) {
    if (attributeName === 'style' && 'stateObj' in target) {
      const entityId = (target.stateObj as any)!.entity_id;
      const domain = this.getDomainByEntityId(entityId);
      const src = this.getImgSrc(domain);
      if (src) {
        (target as HTMLElement).style.backgroundImage = `url(${src})`;
      }
    }
  }

  private async ['ATTR:IMG[src]'](target: HTMLElement | ShadowRoot, _attributeName: string, _oldValue: string | null) {
    console.log(target);
  }

  private async ['NEW:HOME-ASSISTANT-MAIN'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    this._hass = (element as any).hass;

    const observable = await waitSelector(element, ':shadow');
    if (!observable) return;

    this.subscribe(observable);
  }

  private async ['NEW:DIALOG-ADD-INTEGRATION'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const observable = await waitSelector(element, ':shadow');
    if (!observable) return;

    this.subscribe(observable);
  }

  private async ['NEW:HA-MORE-INFO-DIALOG'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const entityId = (element as any)?.['_entityId'];
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;

    const badge = await waitSelector(element, ':shadow ha-more-info-info :shadow state-card-content :shadow state-card-update :shadow state-info :shadow state-badge');
    if (!badge) return;

    badge.style.backgroundImage = `url(${url})`;

    this.subscribe(badge, true);
  }

  private async ['NEW:HA-INTEGRATION-LIST-ITEM'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    if (!(element as any)?.integration?.domain) return;

    const domain = (element as any).integration.domain as string;
    const src = this.getImgSrc(domain);
    if (!src) return;

    const img = await waitSelector(element, ':shadow .material-icons img');
    if (!img) return;

    (img as HTMLImageElement).src = src;
  }

  private async ['NEW:HA-CONFIG-INTEGRATIONS-DASHBOARD'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
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

  private async ['NEW:HA-CONFIG-INTEGRATION-PAGE'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const domain = (element as any)?.domain as string;
    const src = this.getImgSrc(domain);
    if (!src || !domain) return;

    const img = await waitSelector(element, ':shadow hass-subpage .container .logo-container img');
    if (!img) return;

    (img as HTMLImageElement).src = src;
  }

  private async ['NEW:HA-CONFIG-DASHBOARD'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const observable = await waitSelector<HTMLElement>(element, ':shadow ha-top-app-bar-fixed');

    this.onAddCallback(observable.parentNode as ShadowRoot, observable);

    this.subscribe(observable.parentNode as ShadowRoot);
  }

  private async ['NEW:HA-TOP-APP-BAR-FIXED'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    waitSelector(element, 'ha-config-repairs', repairs => {
      if (repairs && repairs.nodeName === 'HA-CONFIG-REPAIRS') {
        this.onAddCallback(element, repairs);
      }

      this.subscribe(repairs);
    });

    waitSelector(element, 'ha-config-updates', updates => {
      if (updates && updates.nodeName === 'HA-CONFIG-UPDATES') {
        this.onAddCallback(element, updates);
      }
      this.subscribe(updates);
    });
  }

  private async ['NEW:HA-CONFIG-UPDATES'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    waitSelector<ShadowRoot>(element, ':shadow', shadowRoot => {
      let list: HTMLElement | null = null;
      for (const child of shadowRoot.children) {
        if (/list/i.test(child.nodeName)) {
          list = child as HTMLElement;
          break;
        }
      }
      if (!list) return;

      let isUpdatesList = false;
      for (const item of list.children) {
        const entityId = (item as any)?.entity_id as string;
        const domain = this.getDomainByEntityId(entityId);
        const url = this.getImgSrc(domain);
        if (url) {
          isUpdatesList = true;
          this.onAddCallback(list, item as HTMLElement);
        }
      }

      if (!isUpdatesList) return;

      this.subscribe(list);
    });
  }

  private async ['NEW:HA-LIST-ITEM'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const entityId = (element as any)?.entity_id as string;
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;

    const badge = element.querySelector('state-badge') as HTMLElement | null;
    if (!badge) return;

    badge.style.backgroundImage = `url(${url})`;
    this.subscribe(badge, true);
  }

  private async ['NEW:HA-CONFIG-REPAIRS'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const list = await waitSelector(element, ':shadow ha-md-list');
    if (!list) return;

    if (!list || list.children.length === 0) return;

    for (const item of list.children) {
      const domain = (item as any)?.issue?.issue_domain;
      const url = this.getImgSrc(domain);
      if (!url) continue;

      this.onAddCallback(list, item as HTMLElement);
    }

    this.subscribe(list);
  }

  private async ['NEW:HA-MD-LIST-ITEM'](_target: HTMLElement | ShadowRoot, element: HTMLElement) {
    const domain = (element as any).issue?.issue_domain as string;
    const url = this.getImgSrc(domain);
    if (!url) return;

    const img = element.querySelector('img');
    if (!img) return;
    (img as HTMLImageElement).src = url;

    this.subscribe(img, true);
  }
}