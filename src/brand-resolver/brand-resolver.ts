import { DomWatcher, waitSelector } from './utils';
import { BrandResolverConfig, ReplacementImages, HomeAssistant } from './types';

export class BrandResolver extends DomWatcher {

  private readonly _root: HTMLElement | ShadowRoot;

  private readonly _hass: HomeAssistant;

  private readonly _images: ReplacementImages;

  private readonly _domains: string[];

  constructor(config: BrandResolverConfig) {
    super(config.hass.config.debug);

    this._root = config.root;
    this._hass = config.hass;
    this._images = config.images;
    this._domains = Object.keys(this._images);

    this.subscribe(this._root);

    if (this._root.firstElementChild) {
      this.emitCreate(this._root, this._root.firstElementChild as HTMLElement);
    }
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

  getDomainBySrc(src: string): string | null {
    for (let i = 0; i < this._domains.length; i++) {
      const domain = this._domains[i];
      if (src.includes(`/${domain}/`)) {
        return domain;
      }
    }
    return null;
  }

  private ['ATTR:STATE-BADGE[STYLE]'](target: HTMLElement | ShadowRoot, attributeName: string, _oldValue: string | null) {
    if (attributeName === 'style' && 'stateObj' in target) {
      const entityId = (target.stateObj as any)!.entity_id;
      const domain = this.getDomainByEntityId(entityId);
      const src = this.getImgSrc(domain);
      if (src) {
        (target as HTMLElement).style.backgroundImage = `url(${src})`;
      }
    }
  }

  private ['ATTR:IMG[SRC]'](target: HTMLImageElement, attr: string) {
    if (attr !== 'src') return;

    const domain = this.getDomainBySrc(target.src);
    const src = this.getImgSrc(domain);
    if (src) {
      target.src = src;
    }
  }

  private ['NEW:SHADOW:HOME-ASSISTANT-MAIN'](element: HTMLElement) {
    waitSelector<ShadowRoot>(element, ':shadow partial-panel-resolver', shadow => this.subscribe(shadow));
  }

  private ['NEW:SHADOW:DIALOG-ADD-INTEGRATION'](element: HTMLElement) {
    waitSelector<ShadowRoot>(element, ':shadow', shadowRoot => this.subscribe(shadowRoot));
  }

  private ['NEW:SHADOW:HA-MORE-INFO-DIALOG'](element: HTMLElement) {
    const entityId = (element as any)?.['_entityId'];
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;

    waitSelector(element, ':shadow ha-more-info-info :shadow state-card-content :shadow state-card-update :shadow state-info :shadow state-badge', badge => {
      badge.style.backgroundImage = `url(${url})`;

      this.subscribe(badge, true);
    });
  }

  private ['NEW:SHADOW:HA-INTEGRATION-LIST-ITEM'](element: HTMLElement) {
    if (!(element as any)?.integration?.domain) return;

    const domain = (element as any).integration.domain as string;
    const src = this.getImgSrc(domain);
    if (!src) return;

    waitSelector<HTMLImageElement>(element, ':shadow .material-icons img', img => {
      (img as HTMLImageElement).src = src;
      this.subscribe(img, true);
    });
  }

  private ['NEW:*:HA-CONFIG-INTEGRATIONS-DASHBOARD'](element: HTMLElement) {
    const getCallbackFn = (src: string) => {
      return (img: HTMLImageElement) => {
        (img as HTMLImageElement).src = src;
      };
    };

    waitSelector(element, ':shadow hass-tabs-subpage .container', container => {
      for (const child of container.children) {
        const domain = child.getAttribute('data-domain');
        const src = this.getImgSrc(domain);
        if (!src) continue;

        waitSelector(child as HTMLElement, ':shadow ha-integration-header :shadow img', getCallbackFn(src));
      }
    });
  }

  private ['NEW:*:HA-CONFIG-INTEGRATION-PAGE'](element: HTMLElement) {
    const domain = (element as any)?.domain as string;
    const src = this.getImgSrc(domain);
    if (!src || !domain) return;

    waitSelector<HTMLImageElement>(element, ':shadow hass-subpage .container .logo-container img', img => {
      img.src = src;
    });
  }

  private ['NEW:*:HA-CONFIG-DASHBOARD'](element: HTMLElement) {
    waitSelector<HTMLElement>(element, ':shadow ha-top-app-bar-fixed', appBar => {
      this.emitCreate(appBar.parentNode as ShadowRoot, appBar);

      this.subscribe(appBar.parentNode as ShadowRoot);
    });
  }

  private ['NEW:*:HA-TOP-APP-BAR-FIXED'](element: HTMLElement) {
    waitSelector(element, 'ha-config-repairs', repairs => {
      this.emitCreate(element, repairs);
      this.subscribe(repairs);
    });

    waitSelector(element, 'ha-config-updates', updates => {
      this.emitCreate(element, updates);
      this.subscribe(updates);
    });
  }

  private ['NEW:*:HA-CONFIG-UPDATES'](element: HTMLElement) {
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
          this.emitCreate(list, item as HTMLElement);
        }
      }

      if (!isUpdatesList) return;

      this.subscribe(list);
    });
  }

  private ['NEW:*:HA-LIST-ITEM'](element: HTMLElement) {
    const entityId = (element as any)?.entity_id as string;
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;

    const badge = element.querySelector('state-badge') as HTMLElement | null;
    if (!badge) return;

    badge.style.backgroundImage = `url(${url})`;
    this.subscribe(badge, true);
  }

  private ['NEW:*:HA-CONFIG-REPAIRS'](element: HTMLElement) {
    waitSelector(element, ':shadow ha-md-list', list => {
      for (const item of list.children) {
        const domain = (item as any)?.issue?.issue_domain;
        const url = this.getImgSrc(domain);
        if (!url) continue;

        this.emitCreate(list, item as HTMLElement);
      }

      this.subscribe(list);
    });
  }

  private ['NEW:*:HA-MD-LIST-ITEM'](element: HTMLElement) {
    const domain = (element as any).issue?.issue_domain as string;
    const url = this.getImgSrc(domain);
    if (!url) return;

    for (const child of element.children) {
      if (child.nodeName === 'IMG') {
        (child as HTMLImageElement).src = url;
        this.subscribe(child as HTMLElement, true);
        return;
      }
    }
  }

  private ['NEW:*:HA-CONFIG-DEVICE-PAGE'](element: HTMLElement) {
    waitSelector<HTMLImageElement>(element, ':shadow .container ha-device-info-card ha-list-item img', img => {
      const domain = this.getDomainBySrc(img.src);
      const src = this.getImgSrc(domain);
      if (!src) return;

      img.src = src;
      this.subscribe(img, true);
    });

    waitSelector<HTMLImageElement>(element, ':shadow .container .header-right img', img => {
      const domain = this.getDomainBySrc(img.src);
      const src = this.getImgSrc(domain);
      if (!src) return;

      img.src = src;
      this.subscribe(img, true);
    });
  }

  private ['NEW:*:HA-CONFIG-DEVICES-DASHBOARD'](element: HTMLElement) {
    waitSelector(element, ':shadow hass-tabs-subpage-data-table :shadow ha-data-table :shadow lit-virtualizer', virtualizer => {

      this.subscribe(virtualizer);
    });
  }

  private ['NEW:*:IMG'](element: HTMLImageElement) {
    const domain = this.getDomainBySrc(element.src);
    const src = this.getImgSrc(domain);
    if (src) {
      element.src = src;
    }
  }
}