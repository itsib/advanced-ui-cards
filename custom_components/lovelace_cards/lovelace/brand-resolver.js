async function resolveElement(element) {
  return new Promise(async (resolve) => {
    if (element.updateComplete) {
      await element.updateComplete;
    }
    setTimeout(() => resolve(element), 10);
  });
}
function select(element, selector) {
  var _a;
  if (element["renderRoot"]) {
    const result2 = element["renderRoot"].querySelector(selector);
    if (result2) {
      return result2;
    }
  }
  const result = (_a = element.querySelector) == null ? void 0 : _a.call(element, selector);
  if (result) {
    return result;
  }
  if (element.shadowRoot) {
    return element.shadowRoot.querySelector(selector);
  }
  return null;
}
function selectAll(element, selector) {
  var _a;
  if (element["renderRoot"]) {
    const result2 = element["renderRoot"].querySelectorAll(selector);
    if (result2) {
      return result2;
    }
  }
  const result = (_a = element.querySelectorAll) == null ? void 0 : _a.call(element, selector);
  if (result) {
    return result;
  }
  if (element.shadowRoot) {
    return element.shadowRoot.querySelectorAll(selector);
  }
  return null;
}
function getElement(element) {
  const shadowRoot = element.shadowRoot || element["renderRoot"];
  return shadowRoot || element;
}
async function waitSelect(element, selector) {
  const selected = select(element, selector);
  if (selected) return selected;
  return new Promise((resolve) => {
    const observable = getElement(element);
    const observer = new MutationObserver((mutations) => {
      const newNodes = mutations.flatMap(({ addedNodes }) => addedNodes);
      if (!newNodes.length) return;
      observer.disconnect();
      setTimeout(() => resolve(select(element, selector)), 50);
    });
    observer.observe(observable, { childList: true, subtree: true });
  });
}
async function waitSelectAll(element, selector) {
  const nodeList = selectAll(element, selector);
  if (nodeList == null ? void 0 : nodeList.length) return nodeList;
  return new Promise((resolve) => {
    const observable = getElement(element);
    const observer = new MutationObserver((mutations) => {
      const newNodes = mutations.flatMap(({ addedNodes }) => addedNodes);
      if (!newNodes.length) return;
      observer.disconnect();
      setTimeout(() => resolve(selectAll(element, selector)), 50);
    });
    observer.observe(observable, { childList: true, subtree: true });
  });
}
const DEFAULT_CONFIG = Object.freeze({
  childList: true,
  subtree: true
});
class Watcher {
  constructor(element, images, config = DEFAULT_CONFIG) {
    this._shadow = null;
    this._element = element;
    this._images = images;
    this._observer = new MutationObserver((m) => this._onMutate(m));
    if (this._element.shadowRoot) {
      this._shadow = this._element.shadowRoot;
      this._observer.observe(this._shadow, config);
    } else {
      this._observer.observe(this._element, config);
      const attachShadowFn = this._element.attachShadow;
      this._element.attachShadow = (init) => {
        const shadow = attachShadowFn.call(this._element, init);
        this._shadow = shadow;
        this._observer.observe(this._shadow, config);
        return shadow;
      };
    }
  }
  destroy() {
    this._observer.disconnect();
    Reflect.deleteProperty(this, "_observer");
    Reflect.deleteProperty(this, "_element");
  }
  getImgSrc(domain) {
    return domain && domain in this._images ? this._images[domain] : null;
  }
  _onMutate(mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const { addedNodes, removedNodes } = mutations[i];
      for (let j = 0; j < removedNodes.length; j++) {
        const node = removedNodes.item(j);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          this.onRemoveElement(node);
        }
      }
      for (let j = 0; j < addedNodes.length; j++) {
        const node = addedNodes.item(j);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          this._resolveNewElement(node);
        }
      }
    }
  }
  _resolveNewElement(element) {
    resolveElement(element).then((_element) => {
      this.onAddElement(_element);
    });
  }
}
class WatcherDialog extends Watcher {
  constructor(element, images) {
    super(element, images);
  }
  destroy() {
    super.destroy();
    Reflect.deleteProperty(this, "_images");
  }
  onAddElement(element) {
    var _a, _b;
    if (!((_a = element == null ? void 0 : element.integration) == null ? void 0 : _a.domain)) return;
    const domain = element.integration.domain;
    const src = this.getImgSrc(domain);
    if (src) {
      const img = (_b = element.shadowRoot) == null ? void 0 : _b.querySelector("span img");
      if (img) {
        img.src = src;
      }
    }
  }
  onRemoveElement(_element) {
  }
}
class WatcherMain extends Watcher {
  onRemoveElement(element) {
    switch (element.nodeName) {
    }
  }
  onAddElement(element) {
    console.log("WatcherMain %o", element);
    switch (element.nodeName) {
      case "HA-CONFIG-INTEGRATIONS-DASHBOARD":
        waitSelectAll(element, "[data-domain]").then((list) => this.handleIntegrationList(list));
        break;
      case "HA-CONFIG-INTEGRATION-PAGE":
        const domain = element == null ? void 0 : element.domain;
        waitSelect(element, ".logo-container").then((_element) => _element && this.handleIntegrationPage(domain, _element));
        break;
      case "PARTIAL-PANEL-RESOLVER":
        console.log("PARTIAL-PANEL-RESOLVER");
        break;
    }
  }
  handleIntegrationList(list) {
    for (const element of list.values()) {
      const domain = element.getAttribute("data-domain");
      const src = this.getImgSrc(domain);
      if (src) {
        const header = select(element, "ha-integration-header");
        if (header) {
          const img = select(header, "img");
          if (img) {
            img.src = src;
          }
        }
      }
    }
  }
  handleIntegrationPage(domain, element) {
    const src = this.getImgSrc(domain);
    const img = select(element, "img");
    if (img && src) {
      img.src = src;
    }
  }
}
class WatcherRoot extends Watcher {
  constructor(images) {
    const elements = document.body.getElementsByTagName("home-assistant");
    const homeAssistant = elements.item(0);
    if (!homeAssistant) {
      throw new Error("No <home-assistant> element");
    }
    super(homeAssistant, images);
    this._watcher = {};
  }
  onAddElement(element) {
    var _a, _b;
    console.log("WatcherRoot %o", element);
    switch (element.nodeName) {
      case "HOME-ASSISTANT-MAIN":
        if (this._watcher.main) (_a = this._watcher.main) == null ? void 0 : _a.destroy();
        this._watcher.main = new WatcherMain(element, this._images);
        break;
      case "DIALOG-ADD-INTEGRATION":
        if (this._watcher.dialog) (_b = this._watcher.dialog) == null ? void 0 : _b.destroy();
        this._watcher.dialog = new WatcherDialog(element, this._images);
        break;
    }
  }
  onRemoveElement(element) {
    var _a, _b;
    switch (element.nodeName) {
      case "DIALOG-ADD-INTEGRATION":
        (_a = this._watcher.dialog) == null ? void 0 : _a.destroy();
        Reflect.deleteProperty(this._watcher, "dialog");
        break;
      case "HOME-ASSISTANT-MAIN":
        (_b = this._watcher.main) == null ? void 0 : _b.destroy();
        Reflect.deleteProperty(this._watcher, "main");
        break;
    }
  }
}
(async () => {
  if (window.brandResolver) return;
  window.brandResolver = new WatcherRoot({
    ["lovelace_cards"]: "/lovelace_cards_files/lovelace-cards.svg",
    ["yandex_player"]: "/lovelace_cards_files/yandex-music.svg"
  });
})();
