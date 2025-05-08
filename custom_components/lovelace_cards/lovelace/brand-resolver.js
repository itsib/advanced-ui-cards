async function waitShadowRoot$1(element) {
  if (element.shadowRoot) {
    return element.shadowRoot;
  }
  return new Promise((resolve) => {
    const attachShadowFn = element.attachShadow;
    element.attachShadow = (init) => {
      const shadow = attachShadowFn.call(element, init);
      requestAnimationFrame(() => resolve(shadow));
      return shadow;
    };
  });
}
function spreadSelector(selector) {
  const selectors = selector.trim().split(/(:shadow)/);
  const spread = [];
  for (let i = 0; i < selectors.length; i++) {
    const item = selectors[i].trim();
    if (item) {
      spread.push(item);
    }
  }
  return spread;
}
function waitShadowRoot(element, callback) {
  if (element.shadowRoot) {
    return callback(element.shadowRoot);
  }
  const attachShadowFn = element.attachShadow;
  element.attachShadow = (init) => {
    const shadow = attachShadowFn.call(element, init);
    element.attachShadow = attachShadowFn;
    requestAnimationFrame(() => callback(shadow));
    return shadow;
  };
}
function waitQuerySelector(element, selector, callback) {
  const foundElement = element.querySelector(selector);
  if (foundElement) {
    return callback(foundElement);
  }
  const observer = new MutationObserver((mutations) => {
    const idAddNode = mutations.some((mutation) => mutation.addedNodes.length > 0);
    if (idAddNode) {
      const foundElement2 = element.querySelector(selector);
      if (foundElement2) {
        observer.disconnect();
        return callback(foundElement2);
      }
    }
  });
  observer.observe(element, { childList: true, subtree: true });
}
function waitSubtree(root, subtree, resolve) {
  const [selector, ...innerSubtree] = subtree;
  if (!selector) {
    return resolve(root);
  }
  if (selector === ":shadow") {
    return waitShadowRoot(root, (shadow) => {
      waitSubtree(shadow, innerSubtree, resolve);
    });
  } else {
    return waitQuerySelector(root, selector, (element) => {
      waitSubtree(element, innerSubtree, resolve);
    });
  }
}
function waitSelector(element, selector) {
  const subtree = spreadSelector(selector);
  return new Promise((resolve) => {
    waitSubtree(element, subtree, resolve);
  });
}
function onElementChange(element, ...rest) {
  const callback = typeof rest[0] === "function" ? rest[0] : rest[1];
  const filter = (typeof rest[0] === "function" ? {} : rest[0]) || {};
  const nodeType = filter.nodeType ?? Node["ELEMENT_NODE"];
  const nodeName = filter.nodeName;
  const observer = new MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i++) {
      const { addedNodes, removedNodes } = mutations[i];
      for (let j = 0; j < removedNodes.length; j++) {
        const node = removedNodes.item(j);
        if (node && node.nodeType === nodeType && (!nodeName || nodeName && nodeName.includes(node.nodeName))) {
          callback("remove", node);
        }
      }
      for (let j = 0; j < addedNodes.length; j++) {
        const node = addedNodes.item(j);
        if (node && node.nodeType === nodeType && (!nodeName || nodeName && nodeName.includes(node.nodeName))) {
          callback("add", node);
        }
      }
    }
  });
  observer.observe(element, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
  };
}
class DomWatcher {
  constructor(config) {
    this._watchers = {};
    this._root = config.root;
    this._images = config.images;
    const filter = {
      nodeName: ["HOME-ASSISTANT-MAIN", "DIALOG-ADD-INTEGRATION"]
    };
    onElementChange(this._root, filter, this.onChangeCallback.bind(this));
  }
  getImgSrc(domain) {
    return domain && domain in this._images ? this._images[domain] : null;
  }
  onChangeCallback(type, element) {
    var _a, _b, _c;
    if (type === "remove") {
      if (element.nodeName in this._watchers) {
        (_b = (_a = this._watchers)[element.nodeName]) == null ? void 0 : _b.call(_a);
        Reflect.deleteProperty(this._watchers, element.nodeName);
      }
      return;
    }
    console.log(element.nodeName);
    (_c = this[element.nodeName]) == null ? void 0 : _c.call(this, element);
  }
  async ["HOME-ASSISTANT-MAIN"](element) {
    const root = await waitShadowRoot$1(element);
    this._watchers[element.nodeName] = onElementChange(root, this.onChangeCallback.bind(this));
  }
  async ["DIALOG-ADD-INTEGRATION"](element) {
    const root = await waitShadowRoot$1(element);
    this._watchers[element.nodeName] = onElementChange(root, this.onChangeCallback.bind(this));
  }
  async ["HA-INTEGRATION-LIST-ITEM"](element) {
    var _a;
    if (!((_a = element == null ? void 0 : element.integration) == null ? void 0 : _a.domain)) return;
    const domain = element.integration.domain;
    const src = this.getImgSrc(domain);
    if (!src) return;
    const img = await waitSelector(element, ":shadow .material-icons img");
    if (!img) return;
    img.src = src;
  }
  async ["HA-CONFIG-INTEGRATIONS-DASHBOARD"](element) {
    const container = await waitSelector(element, ":shadow hass-tabs-subpage .container");
    if (!container) return;
    for (const child of container.children) {
      const domain = child.getAttribute("data-domain");
      const src = this.getImgSrc(domain);
      if (!src) continue;
      const img = await waitSelector(child, ":shadow ha-integration-header :shadow img");
      if (!img) continue;
      img.src = src;
    }
  }
  async ["HA-CONFIG-INTEGRATION-PAGE"](element) {
    const domain = element == null ? void 0 : element.domain;
    const src = this.getImgSrc(domain);
    if (!src || !domain) return;
    const img = await waitSelector(element, ":shadow hass-subpage .container .logo-container img");
    if (!img) return;
    img.src = src;
  }
  async ["HA-CONFIG-DASHBOARD"](element) {
    const observable = await waitSelector(element, ":shadow ha-top-app-bar-fixed ha-config-section");
    if (!observable) return;
    this._watchers[element.nodeName] = onElementChange(observable, this.onChangeCallback.bind(this));
  }
}
(async () => {
  if (window.brandResolver) return;
  const elements = document.body.getElementsByTagName("home-assistant");
  const homeAssistant = elements.item(0);
  if (!homeAssistant) {
    throw new Error("No <home-assistant> element");
  }
  const root = await waitShadowRoot$1(homeAssistant);
  window.brandResolver = new DomWatcher({
    root,
    images: {
      ["lovelace_cards"]: "/lovelace_cards_files/lovelace-cards.svg",
      ["yandex_player"]: "/lovelace_cards_files/yandex-music.svg"
    }
  });
})();
