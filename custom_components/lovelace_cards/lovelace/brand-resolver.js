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
function waitShadowRoot(element, callback, signal) {
  if (element.shadowRoot) {
    return callback(element.shadowRoot);
  }
  let rafId = null;
  const attachShadowFn = element.attachShadow;
  const disconnect = () => {
    element.attachShadow = attachShadowFn;
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
  signal.addEventListener("abort", disconnect, { once: true });
  element.attachShadow = (init) => {
    const shadow = attachShadowFn.call(element, init);
    element.attachShadow = attachShadowFn;
    rafId = requestAnimationFrame(() => {
      signal.removeEventListener("abort", disconnect);
      callback(shadow);
    });
    return shadow;
  };
}
function waitQuerySelector(root, selector, callback, signal) {
  const element = root.querySelector(selector);
  if (element) {
    return callback(element);
  }
  let observer;
  const disconnect = () => observer.disconnect();
  signal.addEventListener("abort", disconnect, { once: true });
  const onMutate = (mutations) => {
    const isAddNode = mutations.some((mutation) => mutation.addedNodes.length > 0);
    if (!isAddNode) return;
    const element2 = root.querySelector(selector);
    if (!element2) return;
    signal.removeEventListener("abort", disconnect);
    disconnect();
    callback(element2);
  };
  observer = new MutationObserver(onMutate);
  observer.observe(root, { childList: true, subtree: true });
}
function waitSubtree(root, subtree, resolve, signal) {
  const [selector, ...innerSubtree] = subtree;
  if (!selector) {
    return resolve(root);
  }
  if (selector === ":shadow") {
    return waitShadowRoot(root, (shadow) => {
      waitSubtree(shadow, innerSubtree, resolve, signal);
    }, signal);
  } else {
    return waitQuerySelector(root, selector, (element) => {
      waitSubtree(element, innerSubtree, resolve, signal);
    }, signal);
  }
}
function waitSelector(element, selector) {
  const subtree = spreadSelector(selector);
  const abort = new AbortController();
  const promise = new Promise((resolve, reject) => {
    abort.signal.addEventListener("abort", reject, { once: true });
    waitSubtree(element, subtree, resolve, abort.signal);
  });
  promise.abort = () => {
    abort.abort();
  };
  return promise;
}
function onElementChange(observable, callbacks) {
  const { onAdd, onRemove } = callbacks;
  const observer = new MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i++) {
      const { addedNodes, removedNodes, target } = mutations[i];
      for (let j = 0; j < removedNodes.length; j++) {
        const node = removedNodes.item(j);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          onRemove == null ? void 0 : onRemove(target, node);
        }
      }
      for (let j = 0; j < addedNodes.length; j++) {
        const node = addedNodes.item(j);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          onAdd == null ? void 0 : onAdd(target, node);
        }
      }
    }
  });
  observer.observe(observable, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
  };
}
const FORMATS = {
  subscribe: "color: #999999;",
  new_node_call: "color: #66FF66;",
  new_node_skip: "color: #448844; text-decoration: line-through;",
  rm_node_call: "color: #FF6666;",
  rm_node_skip: "color: #884444; text-decoration: line-through;",
  default: "color: #EAEAEA;"
};
class DomWatcher {
  constructor(config) {
    this._watchers = /* @__PURE__ */ new WeakMap();
    this._root = config.root;
    this._images = config.images;
    this._domains = Object.keys(this._images);
    this._debug = config.debug || false;
    this.subscribe(this._root);
  }
  log(type, ...objects) {
    if (!this._debug) return;
    const color = FORMATS[type] || FORMATS.default;
    const label = type.replace(/_/g, " ").replace("skip", "🗴").replace("call", "✔").replace(/(^\w)/, (c) => c.toUpperCase());
    const template = "%c%s%c%s" + "%O".repeat(objects.length);
    const space = ":" + " ".repeat(14 - label.length);
    console.log(template, color, label, "", space, ...objects);
  }
  getImgSrc(domain) {
    return domain && domain in this._images ? this._images[domain] : null;
  }
  getDomainByEntityId(entityId) {
    var _a, _b, _c, _d;
    for (let i = 0; i < this._domains.length; i++) {
      const domain = this._domains[i];
      const state = (_b = (_a = this._hass) == null ? void 0 : _a.states) == null ? void 0 : _b[entityId];
      if (state && ((_d = (_c = state.attributes) == null ? void 0 : _c.entity_picture) == null ? void 0 : _d.includes(domain))) {
        return domain;
      }
      const name = entityId.split(".", 2)[1];
      if (name && name.includes(domain)) {
        return domain;
      }
    }
    return null;
  }
  onRemoveCallback(target, element) {
    var _a;
    const methodRm = `RM-${element.nodeName}`;
    if (this._watchers.has(element)) {
      (_a = this._watchers.get(element)) == null ? void 0 : _a();
      this._watchers.delete(element);
    }
    if (methodRm in this) {
      this.log("rm_node_call", element, target);
      this[methodRm](target, element);
    } else {
      this.log("rm_node_skip", element, target);
    }
  }
  onAddCallback(target, element) {
    const methodNew = `NEW-${element.nodeName}`;
    if (methodNew in this) {
      this.log("new_node_call", element, target);
      this[methodNew](target, element);
    } else {
      this.log("new_node_skip", element, target);
    }
  }
  subscribe(observable) {
    this.log("subscribe", observable);
    const disconnect = onElementChange(observable, {
      onAdd: this.onAddCallback.bind(this),
      onRemove: this.onRemoveCallback.bind(this)
    });
    this._watchers.set(observable, disconnect);
  }
  async ["NEW-HOME-ASSISTANT-MAIN"](_target, element) {
    this._hass = element.hass;
    const observable = await waitSelector(element, ":shadow");
    if (!observable) return;
    this.subscribe(observable);
  }
  async ["NEW-DIALOG-ADD-INTEGRATION"](_target, element) {
    const observable = await waitSelector(element, ":shadow");
    if (!observable) return;
    this.subscribe(observable);
  }
  async ["NEW-HA-MORE-INFO-DIALOG"](_target, element) {
    const entityId = element == null ? void 0 : element["_entityId"];
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;
    const badge = await waitSelector(element, ":shadow ha-more-info-info :shadow state-card-content :shadow state-card-update :shadow state-info :shadow state-badge");
    if (!badge) return;
    badge.style.backgroundImage = `url("${url}")`;
  }
  async ["NEW-HA-INTEGRATION-LIST-ITEM"](_target, element) {
    var _a;
    if (!((_a = element == null ? void 0 : element.integration) == null ? void 0 : _a.domain)) return;
    const domain = element.integration.domain;
    const src = this.getImgSrc(domain);
    if (!src) return;
    const img = await waitSelector(element, ":shadow .material-icons img");
    if (!img) return;
    img.src = src;
  }
  async ["NEW-HA-CONFIG-INTEGRATIONS-DASHBOARD"](_target, element) {
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
  async ["NEW-HA-CONFIG-INTEGRATION-PAGE"](_target, element) {
    const domain = element == null ? void 0 : element.domain;
    const src = this.getImgSrc(domain);
    if (!src || !domain) return;
    const img = await waitSelector(element, ":shadow hass-subpage .container .logo-container img");
    if (!img) return;
    img.src = src;
  }
  async ["NEW-HA-CONFIG-DASHBOARD"](_target, element) {
    const observable = await waitSelector(element, ":shadow ha-top-app-bar-fixed");
    if (!observable) return;
    const repairs = await waitSelector(observable, "ha-config-repairs");
    const updates = await waitSelector(observable, "ha-config-updates");
    if (repairs && repairs.nodeName === "HA-CONFIG-REPAIRS") {
      this.onAddCallback(observable, repairs);
    }
    if (updates && updates.nodeName === "HA-CONFIG-UPDATES") {
      this.onAddCallback(observable, updates);
    }
    this.subscribe(repairs);
    this.subscribe(updates);
  }
  async ["NEW-HA-CONFIG-UPDATES"](_target, element) {
    const section = await waitSelector(element, ":shadow");
    if (!section) return;
    let list = null;
    for (const item of section.children) {
      if (/list/i.test(item.nodeName)) {
        list = item;
        break;
      }
    }
    if (!list || list.children.length === 0) return;
    for (const child of list.children) {
      const entityId = child == null ? void 0 : child.entity_id;
      const domain = this.getDomainByEntityId(entityId);
      const url = this.getImgSrc(domain);
      if (!url) continue;
      const badge = child.querySelector("state-badge");
      if (!badge) continue;
      badge.style.backgroundImage = `url("${url}")`;
    }
    this.subscribe(list);
  }
  async ["NEW-HA-CONFIG-REPAIRS"](_target, element) {
    var _a;
    const section = await waitSelector(element, ":shadow ha-md-list");
    if (!section) return;
    if (!section || section.children.length === 0) return;
    for (const child of section.children) {
      const domain = (_a = child == null ? void 0 : child.issue) == null ? void 0 : _a.issue_domain;
      const url = this.getImgSrc(domain);
      if (!url) continue;
      const img = child.querySelector("img");
      if (!img) continue;
      img.src = url;
    }
    this.subscribe(section);
  }
}
(async () => {
  if (window.brandResolver) return;
  const elements = document.body.getElementsByTagName("home-assistant");
  const homeAssistant = elements.item(0);
  if (!homeAssistant) {
    throw new Error("No <home-assistant> element");
  }
  const root = await waitSelector(homeAssistant, ":shadow");
  window.brandResolver = new DomWatcher({
    root,
    debug: true,
    images: {
      ["lovelace_cards"]: "/lovelace_cards_files/lovelace-cards.svg",
      ["yandex_player"]: "/lovelace_cards_files/yandex-music.svg",
      ["homeconnect_ws"]: "/lovelace_cards_files/yandex-music.svg"
    }
  });
})();
