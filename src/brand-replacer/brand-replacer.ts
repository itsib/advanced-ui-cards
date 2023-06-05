function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries the function that returns the promise until the promise successfully resolves up to n retries
 * @param fn function to retry
 * @param attempt how many times to retry
 * @param wait Wait between retries in ms
 */
function retry<T>(fn: () => T, attempt = 3, wait = 50): Promise<T> {
  let completed = false;

  return new Promise<T>(async (resolve, reject) => {
    while (true) {
      let result: T;
      try {
        result = await fn();
        if (!completed) {
          resolve(result);
          completed = true;
        }
        break;
      } catch (error) {
        if (completed) {
          break;
        }
        if (attempt <= 0) {
          reject(error);
          completed = true;
          break;
        }
        attempt--;
      }
      await sleep(wait);
    }
  });
}

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

  private static getShadowRoot(element: HTMLElement): Promise<ShadowRoot> {
    if (element.shadowRoot) {
      return Promise.resolve(element.shadowRoot);
    }
    return retry<ShadowRoot>(
      () => {
        if (element.shadowRoot) {
          return element.shadowRoot;
        }
        throw new Error(`No shadow root found`);
      },
      10,
      50,
    );
  }

  private static getElement(rootElement: HTMLElement | ShadowRoot, selector: string): Promise<HTMLElement> {
    return retry<HTMLElement>(
      () => {
        const element = rootElement.querySelector(selector) as null | HTMLElement;
        if (element) {
          return element;
        }
        throw new Error(`No "${selector}" element found`);
      },
      5,
      50,
    );
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

    const haElement = document.body.querySelector('home-assistant');
    if (!haElement || !haElement.shadowRoot) {
      throw new Error('No <home-assistant /> element found');
    }

    const observer = new MutationObserver(this._homeAssistantMutationCallback.bind(this));
    observer.observe(haElement.shadowRoot, { subtree: true, childList: true });

    BrandReplacer.getElement(haElement.shadowRoot, 'home-assistant-main')
      .then(main => {
        if (!main.shadowRoot) {
          throw new Error('No shadow root in <home-assistant-main />');
        }
        return BrandReplacer.getElement(main.shadowRoot, 'ha-drawer');
      })
      .then(drawer => {
        const configElement = drawer.querySelector('ha-config-integrations');
        if (configElement) {
          this._configIntegrations = configElement as HTMLElement;
          this._handleIntegrationsSettingsPage();
        }

        const observer = new MutationObserver(this._drawerMutationCallback.bind(this));
        observer.observe(drawer, { subtree: true, childList: true });
      })
      .catch(error => {
        console.error(error);
      });
  }

  private _drawerMutationCallback(mutations: MutationRecord[]): void {
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

  private _homeAssistantMutationCallback(mutations: MutationRecord[]): void {
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

    BrandReplacer.getShadowRoot(this._configIntegrations)
      .then(shadowRoot => BrandReplacer.getElement(shadowRoot, 'hass-tabs-subpage'))
      .then(tabsSubpage => BrandReplacer.getElement(tabsSubpage, '.container'))
      .then(container => {
        if (!container || !container.children.length) {
          console.warn('Container is empty');
          return;
        }
        for (let i = 0; i < container.children.length; i++) {
          const card = container.children.item(i) as HTMLElement;
          const cardDomain = card['domain'];
          if (cardDomain in this._watchedImages) {
            this._replaceImageIntegrationCard(card, cardDomain);
          }
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  private _handleDialogAddIntegration(): void {
    if (!this._dialogAddIntegration) {
      return;
    }

    BrandReplacer.getShadowRoot(this._dialogAddIntegration)
      .then(shadowRoot => BrandReplacer.getElement(shadowRoot, 'ha-dialog'))
      .then(haDialog => BrandReplacer.getElement(haDialog, 'mwc-list'))
      .then(list => {
        this._dialogIntegrationListObserver = new MutationObserver(this._dialogIntegrationListMutationCallback.bind(this));
        this._dialogIntegrationListObserver.observe(list, { subtree: true, childList: true });
      })
      .catch(console.error);
  }

  private _replaceImageIntegrationCard(card: HTMLElement, domain: string): void {
    const imageSrc = this._watchedImages[domain];
    const haCard = card.shadowRoot?.querySelector('ha-card');
    const haCardHeader = haCard?.querySelector('ha-integration-header');
    const image = haCardHeader?.shadowRoot?.querySelector('.header')?.querySelector('img') as HTMLImageElement | null;
    if (image && imageSrc) {
      image.src = imageSrc;
    }
  }

  private _replaceImageDialogAddIntegration(item: HTMLElement, domain: string): void {
    const imageSrc = this._watchedImages[domain];

    BrandReplacer.getShadowRoot(item)
      .then(root => BrandReplacer.getElement(root, 'span > img'))
      .then(image => {
        (image as HTMLImageElement).src = imageSrc;
      })
      .catch(console.error);
  }
}
