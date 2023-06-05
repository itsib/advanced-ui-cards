function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retries the function that returns the promise until the promise successfully resolves up to n retries
 * @param fn function to retry
 * @param attempt how many times to retry
 * @param wait Wait between retries in ms
 */
function retry(fn, attempt = 3, wait = 50) {
    let completed = false;
    return new Promise(async (resolve, reject) => {
        while (true) {
            let result;
            try {
                result = await fn();
                if (!completed) {
                    resolve(result);
                    completed = true;
                }
                break;
            }
            catch (error) {
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
class BrandReplacer {
    static insert(domain, image) {
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
    static getShadowRoot(element) {
        if (element.shadowRoot) {
            return Promise.resolve(element.shadowRoot);
        }
        return retry(() => {
            if (element.shadowRoot) {
                return element.shadowRoot;
            }
            throw new Error(`No shadow root found`);
        }, 10, 50);
    }
    static getElement(rootElement, selector) {
        return retry(() => {
            const element = rootElement.querySelector(selector);
            if (element) {
                return element;
            }
            throw new Error(`No "${selector}" element found`);
        }, 5, 50);
    }
    static findNode(nodes, nodeName) {
        for (const node of nodes.values()) {
            if (node.nodeName === nodeName) {
                return node;
            }
        }
        return undefined;
    }
    constructor() {
        /**
         * Replacer has been initialized
         * @private
         */
        this._initialized = false;
        this._watchedImages = {};
    }
    _watch(domain, image) {
        this._watchedImages[domain] = image;
        if (this._initialized) {
            this._handleIntegrationsSettingsPage();
            this._handleIntegrationsSettingsPage();
        }
        else {
            this._init();
        }
    }
    _init() {
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
                this._configIntegrations = configElement;
                this._handleIntegrationsSettingsPage();
            }
            const observer = new MutationObserver(this._drawerMutationCallback.bind(this));
            observer.observe(drawer, { subtree: true, childList: true });
        })
            .catch(error => {
            console.error(error);
        });
    }
    _drawerMutationCallback(mutations) {
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
    _homeAssistantMutationCallback(mutations) {
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
    _dialogIntegrationListMutationCallback(mutations) {
        var _a;
        for (let i = 0; i < mutations.length; i++) {
            const mutation = mutations[i];
            const item = BrandReplacer.findNode(mutation.addedNodes, 'HA-INTEGRATION-LIST-ITEM');
            if (item && ((_a = item['__integration']) === null || _a === void 0 ? void 0 : _a.domain) in this._watchedImages) {
                this._replaceImageDialogAddIntegration(item, item['__integration'].domain);
            }
        }
    }
    _handleIntegrationsSettingsPage() {
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
                const card = container.children.item(i);
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
    _handleDialogAddIntegration() {
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
    _replaceImageIntegrationCard(card, domain) {
        var _a, _b, _c;
        const imageSrc = this._watchedImages[domain];
        const haCard = (_a = card.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('ha-card');
        const haCardHeader = haCard === null || haCard === void 0 ? void 0 : haCard.querySelector('ha-integration-header');
        const image = (_c = (_b = haCardHeader === null || haCardHeader === void 0 ? void 0 : haCardHeader.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('.header')) === null || _c === void 0 ? void 0 : _c.querySelector('img');
        if (image && imageSrc) {
            image.src = imageSrc;
        }
    }
    _replaceImageDialogAddIntegration(item, domain) {
        const imageSrc = this._watchedImages[domain];
        BrandReplacer.getShadowRoot(item)
            .then(root => BrandReplacer.getElement(root, 'span > img'))
            .then(image => {
            image.src = imageSrc;
        })
            .catch(console.error);
    }
}

export { BrandReplacer };
