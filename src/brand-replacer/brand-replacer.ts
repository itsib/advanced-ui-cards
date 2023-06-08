export class BrandReplacer {
  /**
   * Replacer has been initialized
   * @private
   */
  private _initialized = false;
  /**
   * Images that need to be replaced
   * @private
   */
  private readonly _watchedImages: { [domain: string]: string };
  /**
   * HTML Element contains integrations cards
   * @private
   */
  private _configIntegrations?: HTMLElement;
  /**
   * HTML Element contains the add integration dialog
   * @private
   */
  private _dialogAddIntegration?: HTMLElement;
  /**
   * Observer should unsubscribe, when the dialog been closed.
   * @private
   */
  private _dialogIntegrationListObserver?: MutationObserver;

  private static INSTANCE?: BrandReplacer;

  static insert(domain: string, image: string): void {
    if (!window || !document || !('MutationObserver' in window)) {
      console.warn('The runtime environment is not supported.');
      return;
    }
    let instance = BrandReplacer.INSTANCE;
    if (!instance) {
      instance = new BrandReplacer();
      BrandReplacer.INSTANCE = instance;
    }

    instance._watch(domain, image);
  }

  private static async waitShadowRoot(element: HTMLElement, timeout = 2000): Promise<ShadowRoot> {
    if (element.shadowRoot) {
      return element.shadowRoot;
    }

    return new Promise<ShadowRoot>((resolve, reject) => {
      const attachShadow = element.attachShadow;
      let isRejected = false;

      const rejectTimer = setTimeout(() => {
        isRejected = true;
        reject(new DOMException('Timeout', 'TimeoutError'));
      }, timeout);

      element.attachShadow = (init: ShadowRootInit): ShadowRoot => {
        clearTimeout(rejectTimer);

        if (!isRejected) {
          setTimeout(() => resolve(element.shadowRoot as ShadowRoot));
        }

        return attachShadow.call(element, init);
      };
    });
  }

  private static async waitElement<T extends HTMLElement = HTMLElement>(element: HTMLElement, selector: string, inShadowRoot = false, timeout = 2000): Promise<T> {
    if (!element) {
      throw new Error('Target element not provided');
    }

    if (!selector) {
      throw new Error('No selector provided');
    }

    let target: HTMLElement | ShadowRoot;
    if (inShadowRoot) {
      target = await BrandReplacer.waitShadowRoot(element);
    } else {
      target = element;
    }

    const found = target.querySelector(selector) as T | null | undefined;
    if (found) {
      return found;
    }

    return new Promise<T>((resolve, reject) => {
      let timer: NodeJS.Timeout | undefined = undefined;

      const observer = new MutationObserver(() => {
        const found = target.querySelector(selector) as T | null | undefined;
        if (found) {
          if (timer) {
            clearTimeout(timer);
          }
          observer.disconnect();
          return resolve(found);
        }

        reject;
        // observer.disconnect()
      });

      observer.observe(target, { subtree: true, childList: true });

      timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error('No element found'));
      }, timeout);
    });
  }

  private static findNode(nodes: NodeList, nodeName: string): HTMLElement | undefined {
    for (const node of nodes.values()) {
      if (node.nodeName === nodeName) {
        return node as HTMLElement;
      }
    }
    return undefined;
  }

  private constructor() {
    this._watchedImages = {};
  }

  private _watch(domain: string, image: string): void {
    this._watchedImages[domain] = image;

    if (this._initialized) {
      this._handleIntegrationsSettingsPage();
      this._handleIntegrationsSettingsPage();
    } else {
      this._init();
    }
  }

  private _init(): void {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    BrandReplacer.waitElement(document.body, 'home-assistant')
      .then(element => {
        // Watch the add integration dialog open.
        BrandReplacer.waitShadowRoot(element).then(shadowRoot => {
          const observer = new MutationObserver(this._watchAddIntegrationDialogOpen.bind(this));
          observer.observe(shadowRoot, { subtree: true, childList: true });
        });

        return BrandReplacer.waitElement(element, 'home-assistant-main', true);
      })
      .then(element => BrandReplacer.waitElement(element, 'ha-drawer', true))
      .then(element => {
        const configElement = element.querySelector('ha-config-integrations');
        if (configElement) {
          this._configIntegrations = configElement as HTMLElement;
          this._handleIntegrationsSettingsPage();
        }

        const observer = new MutationObserver(this._watchConfigIntegrationsPage.bind(this));
        observer.observe(element, { subtree: true, childList: true });
      })
      .catch(console.error);
  }

  private _watchConfigIntegrationsPage(mutations: MutationRecord[]): void {
    for (let i = mutations.length - 1; i >= 0; i--) {
      const mutation = mutations[i];
      const configIntegrations = BrandReplacer.findNode(mutation.addedNodes, 'HA-CONFIG-INTEGRATIONS');
      if (configIntegrations) {
        this._configIntegrations = configIntegrations;

        this._handleIntegrationsSettingsPage();
        continue;
      }

      if (BrandReplacer.findNode(mutation.removedNodes, 'HA-CONFIG-INTEGRATIONS')) {
        this._configIntegrations = undefined;
      }
    }
  }

  private _watchAddIntegrationDialogOpen(mutations: MutationRecord[]): void {
    for (let i = mutations.length - 1; i >= 0; i--) {
      const mutation = mutations[i];
      const dialog = BrandReplacer.findNode(mutation.addedNodes, 'DIALOG-ADD-INTEGRATION');

      if (dialog) {
        this._dialogAddIntegration = dialog;
        this._handleDialogAddIntegration();
        continue;
      }

      if (BrandReplacer.findNode(mutation.removedNodes, 'DIALOG-ADD-INTEGRATION')) {
        this._dialogAddIntegration = undefined;
        if (this._dialogIntegrationListObserver) {
          this._dialogIntegrationListObserver.disconnect();
          this._dialogIntegrationListObserver = undefined;
        }
      }
    }
  }

  private _dialogIntegrationListMutationCallback(mutations: MutationRecord[]): void {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      const item = BrandReplacer.findNode(mutation.addedNodes, 'HA-INTEGRATION-LIST-ITEM');
      if (item && item['__integration']?.domain in this._watchedImages) {
        this._replaceImageDialogAddIntegration(item, item['__integration'].domain);
      }
    }
  }

  private _handleIntegrationsSettingsPage(): void {
    if (!this._configIntegrations) {
      return;
    }

    BrandReplacer.waitElement(this._configIntegrations, 'ha-config-integrations-dashboard')
      .then(element => BrandReplacer.waitElement(element, 'hass-tabs-subpage', true))
      .then(element => BrandReplacer.waitElement(element, '.container'))
      .then(element => {
        for (let i = 0; i < element.children.length; i++) {
          const card = element.children.item(i) as HTMLElement;
          const domain = card.dataset.domain;
          if (!domain) {
            continue;
          }
          if (domain in this._watchedImages) {
            this._replaceImageIntegrationCard(card, domain);
          }
        }
      })
      .catch(console.error);
  }

  private _handleDialogAddIntegration(): void {
    if (!this._dialogAddIntegration) {
      return;
    }

    BrandReplacer.waitElement(this._dialogAddIntegration, 'ha-dialog', true)
      .then(element => BrandReplacer.waitElement(element, 'mwc-list'))
      .then(list => {
        this._dialogIntegrationListObserver = new MutationObserver(this._dialogIntegrationListMutationCallback.bind(this));
        this._dialogIntegrationListObserver.observe(list, { subtree: true, childList: true });
      })
      .catch(console.error);
  }

  private _replaceImageIntegrationCard(card: HTMLElement, domain: string): void {
    BrandReplacer.waitElement(card, 'ha-integration-header', true)
      .then(element => BrandReplacer.waitElement(element, '.header', true))
      .then(element => BrandReplacer.waitElement<HTMLImageElement>(element, 'img'))
      .then(image => {
        image.src = this._watchedImages[domain];
        image.style.visibility = 'visible';
      })
      .catch(console.error);
  }

  private _replaceImageDialogAddIntegration(item: HTMLElement, domain: string): void {
    const imageSrc = this._watchedImages[domain];

    BrandReplacer.waitElement<HTMLImageElement>(item, 'span > img', true)
      .then(image => {
        image.src = imageSrc;
        image.style.visibility = 'visible';
      })
      .catch(console.error);
  }
}
