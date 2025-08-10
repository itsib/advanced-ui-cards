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
      const { addedNodes, removedNodes, attributeName, type } = mutations[i];
      if (type === "childList") {
        for (let j = 0; j < removedNodes.length; j++) {
          const node = removedNodes.item(j);
          if (node && node.nodeType === Node.ELEMENT_NODE) {
            onRemove?.(observable, node);
          }
        }
        for (let j = 0; j < addedNodes.length; j++) {
          const node = addedNodes.item(j);
          if (node && node.nodeType === Node.ELEMENT_NODE) {
            onAdd?.(observable, node);
          }
        }
      } else if (type === "attributes") {
        if (attributeName) {
          onAttribute?.(observable, attributeName);
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
function getElementName(element) {
  return element instanceof ShadowRoot ? "SHADOW" : element.nodeName;
}
const FORMATS = {
  subscribe: "color: #ffcc00; font-weight: 700;",
  create: "color: #37c871; font-weight: 700;",
  remove: "color: #c83737; font-weight: 700;",
  attribute: "color: #37abc8; font-weight: 700;",
  default: "color: #b3b3b3; font-weight: 400;"
};
class DomWatcher {
  _debug;
  _watchers = /* @__PURE__ */ new WeakMap();
  constructor(debug = false) {
    this._debug = debug;
  }
  log(type, ...objects) {
    if (!this._debug) return;
    switch (type) {
      case "create":
        console.log("%cNEW %c%s %O", FORMATS.create, FORMATS.default, objects[0], objects[1]);
        break;
      case "remove":
        console.log("%cREM %c%s %O", FORMATS.remove, FORMATS.default, objects[0], objects[1]);
        break;
      case "subscribe":
        console.log("%cSUB %c%s %O", FORMATS.subscribe, FORMATS.default, objects[0], objects[1]);
        break;
      case "attribute":
        console.log("%cATR %c%s %O", FORMATS.attribute, FORMATS.default, objects[0], objects[1]);
        break;
    }
  }
  /**
   * Handler for the new DOM element.
   *
   * @description
   * All DOM elements are processed here, then distributed to the appropriate
   * handlers. To process a specific HTML element, you need to create an event
   * handler as in the example
   *
   * @examle
   * ```typescript
   * class MyWatcher extends DomWatcher {
   *
   *    // Handle new <img /> element in <observable-node-name />
   *    ['NEW:OBSERVABLE-NODE-NAME:IMG'](created: HTMLImgElement): void {
   *      console.log(created);
   *    }
   *
   *    // Handle all new <img /> element all observed HTML elements
   *    ['NEW:*:IMG'](created: HTMLImgElement): void {
   *      console.log(created);
   *    }
   *
   *    // Handle all new elements inside <observable-node-name />
   *    ['NEW:OBSERVABLE-NODE-NAME:*'](created: HTMLImgElement): void {
   *        console.log(created);
   *    }
   * }
   * ```
   *
   * @param observable - The observed HTML element.
   * @param created - New element in DOM
   * @private
   */
  _onCreate(observable, created) {
    const observableName = getElementName(observable);
    const createdName = getElementName(created);
    const eventNames = [
      [observableName, createdName],
      [observableName, "*"],
      ["*", createdName]
    ];
    for (const [targetName, elementName] of eventNames) {
      const eventName = `NEW:${targetName}:${elementName}`;
      if (eventName in this) {
        this.log("create", eventName, created);
        this[eventName](created);
      }
    }
  }
  /**
   * Handler for the removed DOM element
   * @param observable
   * @param removed
   * @private
   */
  _onRemove(observable, removed) {
    if (this._watchers.has(removed)) {
      this._watchers.get(removed)?.();
      this._watchers.delete(removed);
    }
    const observableName = getElementName(observable);
    const createdName = getElementName(removed);
    const eventNames = [
      [observableName, createdName],
      [observableName, "*"],
      ["*", createdName]
    ];
    for (const [targetName, elementName] of eventNames) {
      const eventName = `REM:${targetName}:${elementName}`;
      if (eventName in this) {
        this.log("remove", eventName, removed);
        this[eventName](removed);
      }
    }
  }
  _onAttribute(observable, attributeName) {
    const methodId = `ATR:${observable.nodeName}[${attributeName.toUpperCase()}]`;
    if (methodId in this) {
      this.log("attribute", methodId, observable);
      this[methodId](observable, attributeName);
    }
  }
  subscribe(observable, watchAttrs = false) {
    this.log("subscribe", getElementName(observable), observable);
    const callbacks = {
      onAdd: this._onCreate.bind(this),
      onRemove: this._onRemove.bind(this),
      ...watchAttrs ? { onAttribute: this._onAttribute.bind(this) } : {}
    };
    const disconnect = onElementChange(observable, callbacks);
    this._watchers.set(observable, disconnect);
  }
  emitCreate(observable, created) {
    this._onCreate(observable, created);
  }
}
class BrandResolver extends DomWatcher {
  _root;
  _hass;
  _images;
  _domains;
  constructor(config) {
    super(config.hass.config.debug);
    this._root = config.root;
    this._hass = config.hass;
    this._images = config.images;
    this._domains = Object.keys(this._images);
    this.subscribe(this._root);
    if (this._root.firstElementChild) {
      this.emitCreate(this._root, this._root.firstElementChild);
    }
  }
  getImgSrc(domain) {
    return domain && this._images && domain in this._images && this._images[domain] || null;
  }
  getDomainByEntityId(entityId) {
    for (let i = 0; i < this._domains.length; i++) {
      const domain = this._domains[i];
      const state = this._hass?.states?.[entityId];
      if (state && state.attributes?.entity_picture?.includes(domain)) {
        return domain;
      }
      const name = entityId.split(".", 2)[1];
      if (name && name.includes(domain)) {
        return domain;
      }
    }
    return null;
  }
  getDomainBySrc(src) {
    for (let i = 0; i < this._domains.length; i++) {
      const domain = this._domains[i];
      if (src.includes(`/${domain}/`)) {
        return domain;
      }
    }
    return null;
  }
  ["ATTR:STATE-BADGE[STYLE]"](target, attributeName, _oldValue) {
    if (attributeName === "style" && "stateObj" in target) {
      const entityId = target.stateObj.entity_id;
      const domain = this.getDomainByEntityId(entityId);
      const src = this.getImgSrc(domain);
      if (src) {
        target.style.backgroundImage = `url(${src})`;
      }
    }
  }
  ["ATTR:IMG[SRC]"](target, attr) {
    if (attr !== "src") return;
    const domain = this.getDomainBySrc(target.src);
    const src = this.getImgSrc(domain);
    if (src) {
      target.src = src;
    }
  }
  ["NEW:SHADOW:HOME-ASSISTANT-MAIN"](element) {
    waitSelector(element, ":shadow partial-panel-resolver", (shadow) => this.subscribe(shadow));
  }
  ["NEW:SHADOW:DIALOG-ADD-INTEGRATION"](element) {
    waitSelector(element, ":shadow", (shadowRoot) => this.subscribe(shadowRoot));
  }
  ["NEW:SHADOW:HA-MORE-INFO-DIALOG"](element) {
    const entityId = element?.["_entityId"];
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;
    waitSelector(element, ":shadow ha-more-info-info :shadow state-card-content :shadow state-card-update :shadow state-info :shadow state-badge", (badge) => {
      badge.style.backgroundImage = `url(${url})`;
      this.subscribe(badge, true);
    });
  }
  ["NEW:SHADOW:HA-INTEGRATION-LIST-ITEM"](element) {
    if (!element?.integration?.domain) return;
    const domain = element.integration.domain;
    const src = this.getImgSrc(domain);
    if (!src) return;
    waitSelector(element, ":shadow .material-icons img", (img) => {
      img.src = src;
      this.subscribe(img, true);
    });
  }
  ["NEW:*:HA-CONFIG-INTEGRATIONS-DASHBOARD"](element) {
    const getCallbackFn = (src) => {
      return (img) => {
        img.src = src;
      };
    };
    waitSelector(element, ":shadow hass-tabs-subpage .container", (container) => {
      for (const child of container.children) {
        const domain = child.getAttribute("data-domain");
        const src = this.getImgSrc(domain);
        if (!src) continue;
        waitSelector(child, ":shadow ha-integration-header :shadow img", getCallbackFn(src));
      }
    });
  }
  ["NEW:*:HA-CONFIG-INTEGRATION-PAGE"](element) {
    const domain = element?.domain;
    const src = this.getImgSrc(domain);
    if (!src || !domain) return;
    waitSelector(element, ":shadow hass-subpage .container .logo-container img", (img) => {
      img.src = src;
    });
  }
  ["NEW:*:HA-CONFIG-DASHBOARD"](element) {
    waitSelector(element, ":shadow ha-top-app-bar-fixed", (appBar) => {
      this.emitCreate(appBar.parentNode, appBar);
      this.subscribe(appBar.parentNode);
    });
  }
  ["NEW:*:HA-TOP-APP-BAR-FIXED"](element) {
    waitSelector(element, "ha-config-repairs", (repairs) => {
      this.emitCreate(element, repairs);
      this.subscribe(repairs);
    });
    waitSelector(element, "ha-config-updates", (updates) => {
      this.emitCreate(element, updates);
      this.subscribe(updates);
    });
  }
  ["NEW:*:HA-CONFIG-UPDATES"](element) {
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
        const entityId = item?.entity_id;
        const domain = this.getDomainByEntityId(entityId);
        const url = this.getImgSrc(domain);
        if (url) {
          isUpdatesList = true;
          this.emitCreate(list, item);
        }
      }
      if (!isUpdatesList) return;
      this.subscribe(list);
    });
  }
  ["NEW:*:HA-LIST-ITEM"](element) {
    const entityId = element?.entity_id;
    const domain = this.getDomainByEntityId(entityId);
    const url = this.getImgSrc(domain);
    if (!url) return;
    const badge = element.querySelector("state-badge");
    if (!badge) return;
    badge.style.backgroundImage = `url(${url})`;
    this.subscribe(badge, true);
  }
  ["NEW:*:HA-CONFIG-REPAIRS"](element) {
    waitSelector(element, ":shadow ha-md-list", (list) => {
      for (const item of list.children) {
        const domain = item?.issue?.issue_domain;
        const url = this.getImgSrc(domain);
        if (!url) continue;
        this.emitCreate(list, item);
      }
      this.subscribe(list);
    });
  }
  ["NEW:*:HA-MD-LIST-ITEM"](element) {
    const domain = element.issue?.issue_domain;
    const url = this.getImgSrc(domain);
    if (!url) return;
    for (const child of element.children) {
      if (child.nodeName === "IMG") {
        child.src = url;
        this.subscribe(child, true);
        return;
      }
    }
  }
  ["NEW:*:HA-CONFIG-DEVICE-PAGE"](element) {
    waitSelector(element, ":shadow .container ha-device-info-card ha-list-item img", (img) => {
      const domain = this.getDomainBySrc(img.src);
      const src = this.getImgSrc(domain);
      if (!src) return;
      img.src = src;
      this.subscribe(img, true);
    });
    waitSelector(element, ":shadow .container .header-right img", (img) => {
      const domain = this.getDomainBySrc(img.src);
      const src = this.getImgSrc(domain);
      if (!src) return;
      img.src = src;
      this.subscribe(img, true);
    });
  }
  ["NEW:*:HA-CONFIG-DEVICES-DASHBOARD"](element) {
    waitSelector(element, ":shadow hass-tabs-subpage-data-table :shadow ha-data-table :shadow lit-virtualizer", (virtualizer) => {
      this.subscribe(virtualizer);
    });
  }
  ["NEW:*:IMG"](element) {
    const domain = this.getDomainBySrc(element.src);
    const src = this.getImgSrc(domain);
    if (src) {
      element.src = src;
    }
  }
}
if (!window.domWatcher) {
  window.domWatcher = new Promise((resolve) => {
    const elements = document.body.getElementsByTagName("home-assistant");
    const homeAssistant = elements.item(0);
    if (!homeAssistant) {
      throw new Error("No <home-assistant> element");
    }
    waitSelector(homeAssistant, ":shadow home-assistant-main", (main) => {
      const hass = main.hass;
      if (!hass) {
        throw new Error("Home Assistant not found");
      }
      const watcher = new BrandResolver({
        hass,
        root: homeAssistant.shadowRoot,
        images: {
          ["advanced_ui_cards"]: "/lovelace_cards_files/logo.svg",
          ["yandex_player"]: "/lovelace_cards_files/yandex-music.svg",
          ["sun"]: "/lovelace_cards_files/sun-logo.svg"
        }
      });
      resolve(watcher);
    });
  });
}
