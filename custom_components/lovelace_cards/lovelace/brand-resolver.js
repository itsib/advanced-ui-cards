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
function waitSelector(element, selector, cb) {
  const subtree = spreadSelector(selector);
  const abort = new AbortController();
  if (cb) {
    waitSubtree(element, subtree, cb, abort.signal);
    return () => {
      abort.abort();
    };
  }
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
  const { onAdd, onRemove, onAttribute } = callbacks;
  const observer = new MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i++) {
      const { addedNodes, removedNodes, target, attributeName, type, oldValue } = mutations[i];
      if (type === "childList") {
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
      } else if (type === "attributes") {
        if (attributeName) {
          onAttribute == null ? void 0 : onAttribute(observable, attributeName, oldValue);
        }
      }
    }
  });
  observer.observe(observable, {
    childList: true,
    subtree: true,
    attributes: !!onAttribute
  });
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
  attr_call: "",
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
    let template = "%c%s%c%s";
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      if (typeof object === "string") {
        template += " %s";
      } else if (object && typeof object === "object") {
        template += " %O";
      }
    }
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
    const methodId = `RM-${element.nodeName}`;
    if (this._watchers.has(element)) {
      (_a = this._watchers.get(element)) == null ? void 0 : _a();
      this._watchers.delete(element);
    }
    if (methodId in this) {
      this.log("rm_node_call", element, target);
      this[methodId](target, element);
    } else {
      this.log("rm_node_skip", element, target);
    }
  }
  onAddCallback(target, element) {
    const methodId = `NEW:${element.nodeName}`;
    if (methodId in this) {
      this.log("new_node_call", element, target);
      this[methodId](target, element);
    } else {
      this.log("new_node_skip", element, target);
    }
  }
  onAttributeCallback(target, attributeName, oldValue) {
    const methodId = `ATTR:${target.nodeName}[${attributeName.toUpperCase()}]`;
    if (methodId in this) {
      this.log("attr_call", attributeName, target);
      this[methodId](target, attributeName, oldValue);
    } else {
      this.log("attr_skip", attributeName, target);
    }
  }
  subscribe(observable, watchAttrs = false) {
    this.log("subscribe", observable);
    const callbacks = {
      onAdd: this.onAddCallback.bind(this),
      onRemove: this.onRemoveCallback.bind(this),
      ...watchAttrs ? { onAttribute: this.onAttributeCallback.bind(this) } : {}
    };
    const disconnect = onElementChange(observable, callbacks);
    this._watchers.set(observable, disconnect);
  }
  async ["ATTR:STATE-BADGE[STYLE]"](target, attributeName, _oldValue) {
    if (attributeName === "style" && "stateObj" in target) {
      const entityId = target.stateObj.entity_id;
      const domain = this.getDomainByEntityId(entityId);
      const src = this.getImgSrc(domain);
      if (src) {
        target.style.backgroundImage = `url(${src})`;
      }
    }
  }
  async ["ATTR:IMG[src]"](target, _attributeName, _oldValue) {
    console.log(target);
  }
  async ["NEW:HOME-ASSISTANT-MAIN"](_target, element) {
    this._hass = element.hass;
    const observable = await waitSelector(element, ":shadow");
    if (!observable) return;
    this.subscribe(observable);
  }
  async ["NEW:DIALOG-ADD-INTEGRATION"](_target, element) {
    const observable = await waitSelector(element, ":shadow");
    if (!observable) return;
    this.subscribe(observable);
  }
  async ["NEW:HA-MORE-INFO-DIALOG"](_target, element) {
    const entityId = element == null ? void 0 : element["_entityId"];
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;
    const badge = await waitSelector(element, ":shadow ha-more-info-info :shadow state-card-content :shadow state-card-update :shadow state-info :shadow state-badge");
    if (!badge) return;
    badge.style.backgroundImage = `url(${url})`;
    this.subscribe(badge, true);
  }
  async ["NEW:HA-INTEGRATION-LIST-ITEM"](_target, element) {
    var _a;
    if (!((_a = element == null ? void 0 : element.integration) == null ? void 0 : _a.domain)) return;
    const domain = element.integration.domain;
    const src = this.getImgSrc(domain);
    if (!src) return;
    const img = await waitSelector(element, ":shadow .material-icons img");
    if (!img) return;
    img.src = src;
  }
  async ["NEW:HA-CONFIG-INTEGRATIONS-DASHBOARD"](_target, element) {
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
  async ["NEW:HA-CONFIG-INTEGRATION-PAGE"](_target, element) {
    const domain = element == null ? void 0 : element.domain;
    const src = this.getImgSrc(domain);
    if (!src || !domain) return;
    const img = await waitSelector(element, ":shadow hass-subpage .container .logo-container img");
    if (!img) return;
    img.src = src;
  }
  async ["NEW:HA-CONFIG-DASHBOARD"](_target, element) {
    const observable = await waitSelector(element, ":shadow ha-top-app-bar-fixed");
    this.onAddCallback(observable.parentNode, observable);
    this.subscribe(observable.parentNode);
  }
  async ["NEW:HA-TOP-APP-BAR-FIXED"](_target, element) {
    waitSelector(element, "ha-config-repairs", (repairs) => {
      if (repairs && repairs.nodeName === "HA-CONFIG-REPAIRS") {
        this.onAddCallback(element, repairs);
      }
      this.subscribe(repairs);
    });
    waitSelector(element, "ha-config-updates", (updates) => {
      if (updates && updates.nodeName === "HA-CONFIG-UPDATES") {
        this.onAddCallback(element, updates);
      }
      this.subscribe(updates);
    });
  }
  async ["NEW:HA-CONFIG-UPDATES"](_target, element) {
    waitSelector(element, ":shadow", (shadowRoot) => {
      let list = null;
      for (const child of shadowRoot.children) {
        if (/list/i.test(child.nodeName)) {
          list = child;
          break;
        }
      }
      if (!list) return;
      let isUpdatesList = false;
      for (const item of list.children) {
        const entityId = item == null ? void 0 : item.entity_id;
        const domain = this.getDomainByEntityId(entityId);
        const url = this.getImgSrc(domain);
        if (url) {
          isUpdatesList = true;
          this.onAddCallback(list, item);
        }
      }
      if (!isUpdatesList) return;
      this.subscribe(list);
    });
  }
  async ["NEW:HA-LIST-ITEM"](_target, element) {
    const entityId = element == null ? void 0 : element.entity_id;
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;
    const badge = element.querySelector("state-badge");
    if (!badge) return;
    badge.style.backgroundImage = `url(${url})`;
    this.subscribe(badge, true);
  }
  async ["NEW:HA-CONFIG-REPAIRS"](_target, element) {
    var _a;
    const list = await waitSelector(element, ":shadow ha-md-list");
    if (!list) return;
    if (!list || list.children.length === 0) return;
    for (const item of list.children) {
      const domain = (_a = item == null ? void 0 : item.issue) == null ? void 0 : _a.issue_domain;
      const url = this.getImgSrc(domain);
      if (!url) continue;
      this.onAddCallback(list, item);
    }
    this.subscribe(list);
  }
  async ["NEW:HA-MD-LIST-ITEM"](_target, element) {
    var _a;
    const domain = (_a = element.issue) == null ? void 0 : _a.issue_domain;
    const url = this.getImgSrc(domain);
    if (!url) return;
    const img = element.querySelector("img");
    if (!img) return;
    img.src = url;
    this.subscribe(img, true);
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
