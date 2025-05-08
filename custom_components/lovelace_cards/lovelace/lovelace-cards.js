const LC_ICONS = {
  "reload-config": "M18 14.5c1.1 0 2.1.4 2.8 1.2l1.2-1.2v4h-4l1.8-1.8c-.5-.4-1.1-.7-1.8-.7c-1.4 0-2.5 1.1-2.5 2.5S16.6 21 18 21c.8 0 1.5-.4 2-1h1.7c-.6 1.5-2 2.5-3.7 2.5c-2.2 0-4-1.8-4-4s1.8-4 4-4m-6.5 4c0-1.1.3-2.1.7-3H12c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5c0 .2 0 .4-.1.5c.8-.3 1.6-.5 2.6-.5c.5 0 1 .1 1.5.2V12c0-.3 0-.7-.1-1l2.1-1.6c.2-.2.2-.4.1-.6l-2-3.5c-.1-.3-.3-.3-.6-.3l-2.5 1c-.5-.4-1.1-.7-1.7-1l-.4-2.7c.1-.1-.2-.3-.4-.3h-4c-.2 0-.5.2-.5.4l-.4 2.7c-.6.2-1.1.6-1.7.9L5 5c-.3 0-.5 0-.7.3l-2 3.5c-.1.2 0 .4.2.6L4.6 11c0 .3-.1.7-.1 1s0 .7.1 1l-2.1 1.7c-.2.2-.2.4-.1.6l2 3.5c.1.2.3.2.6.2l2.5-1c.5.4 1.1.7 1.7 1l.4 2.7c0 .2.2.4.5.4h2.5c-.7-1.1-1.1-2.3-1.1-3.6"
};
const LC_ICONS_MAP = Object.freeze(Object.keys(LC_ICONS).map((icon) => Object.freeze({ name: icon })));
window.customIcons = window.customIcons || {};
window.customIcons["lc"] = {
  async getIcon(name) {
    return { path: LC_ICONS[name.replace(/_/g, "-")] };
  },
  async getIconList() {
    return LC_ICONS_MAP;
  }
};
const { LitElement, css, html } = function getLit() {
  const keys = Object.keys(customElements);
  for (let i2 = 0; i2 < keys.length; i2++) {
    const entity = customElements[keys[i2]];
    if (entity instanceof Map) {
      for (const entityKey of entity.keys()) {
        if (typeof entityKey === "string") {
          const LitElement2 = Object.getPrototypeOf(customElements.get(entityKey));
          const html2 = LitElement2.prototype.html;
          const css2 = LitElement2.prototype.css;
          if (html2 && css2) {
            return { LitElement: LitElement2, css: css2, html: html2 };
          }
        } else {
          break;
        }
      }
    }
  }
  throw new Error("No lit found");
}();
const t$1 = (t2) => (e2, o2) => {
  void 0 !== o2 ? o2.addInitializer(() => {
    customElements.define(t2, e2);
  }) : customElements.define(t2, e2);
};
const t = globalThis, e$1 = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s = Symbol(), o$2 = /* @__PURE__ */ new WeakMap();
let n$2 = class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e$1 && void 0 === t2) {
      const e2 = void 0 !== s2 && 1 === s2.length;
      e2 && (t2 = o$2.get(s2)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e2 && o$2.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$3 = (t2) => new n$2("string" == typeof t2 ? t2 : t2 + "", void 0, s), S = (s2, o2) => {
  if (e$1) s2.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else for (const e2 of o2) {
    const o3 = document.createElement("style"), n3 = t.litNonce;
    void 0 !== n3 && o3.setAttribute("nonce", n3), o3.textContent = e2.cssText, s2.appendChild(o3);
  }
}, c$1 = e$1 ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (const s2 of t3.cssRules) e2 += s2.cssText;
  return r$3(e2);
})(t2) : t2;
const { is: i, defineProperty: e, getOwnPropertyDescriptor: h, getOwnPropertyNames: r$2, getOwnPropertySymbols: o$1, getPrototypeOf: n$1 } = Object, a = globalThis, c = a.trustedTypes, l = c ? c.emptyScript : "", p = a.reactiveElementPolyfillSupport, d = (t2, s2) => t2, u = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l : null;
      break;
    case Object:
    case Array:
      t2 = null == t2 ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s2) {
  let i2 = t2;
  switch (s2) {
    case Boolean:
      i2 = null !== t2;
      break;
    case Number:
      i2 = null === t2 ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i2 = JSON.parse(t2);
      } catch (t3) {
        i2 = null;
      }
  }
  return i2;
} }, f = (t2, s2) => !i(t2, s2), b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s2 = b) {
    if (s2.state && (s2.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t2, s2), !s2.noAccessor) {
      const i2 = Symbol(), h2 = this.getPropertyDescriptor(t2, i2, s2);
      void 0 !== h2 && e(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s2, i2) {
    const { get: e2, set: r2 } = h(this.prototype, t2) ?? { get() {
      return this[s2];
    }, set(t3) {
      this[s2] = t3;
    } };
    return { get: e2, set(s3) {
      const h2 = e2 == null ? void 0 : e2.call(this);
      r2 == null ? void 0 : r2.call(this, s3), this.requestUpdate(t2, h2, i2);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t2 = n$1(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t3 = this.properties, s2 = [...r$2(t3), ...o$1(t3)];
      for (const i2 of s2) this.createProperty(i2, t3[i2]);
    }
    const t2 = this[Symbol.metadata];
    if (null !== t2) {
      const s2 = litPropertyMetadata.get(t2);
      if (void 0 !== s2) for (const [t3, i2] of s2) this.elementProperties.set(t3, i2);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t3, s2] of this.elementProperties) {
      const i2 = this._$Eu(t3, s2);
      void 0 !== i2 && this._$Eh.set(i2, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s2) {
    const i2 = [];
    if (Array.isArray(s2)) {
      const e2 = new Set(s2.flat(1 / 0).reverse());
      for (const s3 of e2) i2.unshift(c$1(s3));
    } else void 0 !== s2 && i2.push(c$1(s2));
    return i2;
  }
  static _$Eu(t2, s2) {
    const i2 = s2.attribute;
    return false === i2 ? void 0 : "string" == typeof i2 ? i2 : "string" == typeof t2 ? t2.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var _a;
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (_a = this.constructor.l) == null ? void 0 : _a.forEach((t2) => t2(this));
  }
  addController(t2) {
    var _a;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t2), void 0 !== this.renderRoot && this.isConnected && ((_a = t2.hostConnected) == null ? void 0 : _a.call(t2));
  }
  removeController(t2) {
    var _a;
    (_a = this._$EO) == null ? void 0 : _a.delete(t2);
  }
  _$E_() {
    const t2 = /* @__PURE__ */ new Map(), s2 = this.constructor.elementProperties;
    for (const i2 of s2.keys()) this.hasOwnProperty(i2) && (t2.set(i2, this[i2]), delete this[i2]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    var _a;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (_a = this._$EO) == null ? void 0 : _a.forEach((t2) => {
      var _a2;
      return (_a2 = t2.hostConnected) == null ? void 0 : _a2.call(t2);
    });
  }
  enableUpdating(t2) {
  }
  disconnectedCallback() {
    var _a;
    (_a = this._$EO) == null ? void 0 : _a.forEach((t2) => {
      var _a2;
      return (_a2 = t2.hostDisconnected) == null ? void 0 : _a2.call(t2);
    });
  }
  attributeChangedCallback(t2, s2, i2) {
    this._$AK(t2, i2);
  }
  _$ET(t2, s2) {
    var _a;
    const i2 = this.constructor.elementProperties.get(t2), e2 = this.constructor._$Eu(t2, i2);
    if (void 0 !== e2 && true === i2.reflect) {
      const h2 = (void 0 !== ((_a = i2.converter) == null ? void 0 : _a.toAttribute) ? i2.converter : u).toAttribute(s2, i2.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    var _a, _b;
    const i2 = this.constructor, e2 = i2._$Eh.get(t2);
    if (void 0 !== e2 && this._$Em !== e2) {
      const t3 = i2.getPropertyOptions(e2), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== ((_a = t3.converter) == null ? void 0 : _a.fromAttribute) ? t3.converter : u;
      this._$Em = e2, this[e2] = h2.fromAttribute(s2, t3.type) ?? ((_b = this._$Ej) == null ? void 0 : _b.get(e2)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t2, s2, i2) {
    var _a;
    if (void 0 !== t2) {
      const e2 = this.constructor, h2 = this[t2];
      if (i2 ?? (i2 = e2.getPropertyOptions(t2)), !((i2.hasChanged ?? f)(h2, s2) || i2.useDefault && i2.reflect && h2 === ((_a = this._$Ej) == null ? void 0 : _a.get(t2)) && !this.hasAttribute(e2._$Eu(t2, i2)))) return;
      this.C(t2, s2, i2);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t2, s2, { useDefault: i2, reflect: e2, wrapped: h2 }, r2) {
    i2 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t2) && (this._$Ej.set(t2, r2 ?? s2 ?? this[t2]), true !== h2 || void 0 !== r2) || (this._$AL.has(t2) || (this.hasUpdated || i2 || (s2 = void 0), this._$AL.set(t2, s2)), true === e2 && this._$Em !== t2 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return null != t2 && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var _a;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t4, s3] of this._$Ep) this[t4] = s3;
        this._$Ep = void 0;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0) for (const [s3, i2] of t3) {
        const { wrapped: t4 } = i2, e2 = this[s3];
        true !== t4 || this._$AL.has(s3) || void 0 === e2 || this.C(s3, void 0, i2, e2);
      }
    }
    let t2 = false;
    const s2 = this._$AL;
    try {
      t2 = this.shouldUpdate(s2), t2 ? (this.willUpdate(s2), (_a = this._$EO) == null ? void 0 : _a.forEach((t3) => {
        var _a2;
        return (_a2 = t3.hostUpdate) == null ? void 0 : _a2.call(t3);
      }), this.update(s2)) : this._$EM();
    } catch (s3) {
      throw t2 = false, this._$EM(), s3;
    }
    t2 && this._$AE(s2);
  }
  willUpdate(t2) {
  }
  _$AE(t2) {
    var _a;
    (_a = this._$EO) == null ? void 0 : _a.forEach((t3) => {
      var _a2;
      return (_a2 = t3.hostUpdated) == null ? void 0 : _a2.call(t3);
    }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t3) => this._$ET(t3, this[t3]))), this._$EM();
  }
  updated(t2) {
  }
  firstUpdated(t2) {
  }
}
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p == null ? void 0 : p({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.0");
const o = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f }, r$1 = (t2 = o, e2, r2) => {
  const { kind: n3, metadata: i2 } = r2;
  let s2 = globalThis.litPropertyMetadata.get(i2);
  if (void 0 === s2 && globalThis.litPropertyMetadata.set(i2, s2 = /* @__PURE__ */ new Map()), "setter" === n3 && ((t2 = Object.create(t2)).wrapped = true), s2.set(r2.name, t2), "accessor" === n3) {
    const { name: o2 } = r2;
    return { set(r3) {
      const n4 = e2.get.call(this);
      e2.set.call(this, r3), this.requestUpdate(o2, n4, t2);
    }, init(e3) {
      return void 0 !== e3 && this.C(o2, void 0, t2, e3), e3;
    } };
  }
  if ("setter" === n3) {
    const { name: o2 } = r2;
    return function(r3) {
      const n4 = this[o2];
      e2.call(this, r3), this.requestUpdate(o2, n4, t2);
    };
  }
  throw Error("Unsupported decorator location: " + n3);
};
function n2(t2) {
  return (e2, o2) => "object" == typeof o2 ? r$1(t2, e2, o2) : ((t3, e3, o3) => {
    const r2 = e3.hasOwnProperty(o3);
    return e3.constructor.createProperty(o3, t3), r2 ? Object.getOwnPropertyDescriptor(e3, o3) : void 0;
  })(t2, e2, o2);
}
function r(r2) {
  return n2({ ...r2, state: true, attribute: false });
}
const styles$a = css`:host {
  --lc-button-size: 40px;
  --lc-button-icon-size: 24px;
  --lc-button-color: currentColor;
  width: var(--lc-button-size);
  height: var(--lc-button-size);
  color: var(--lc-button-color);
  font-family: var(--paper-font-body1_-_font-family);
  -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
  font-size: var(--paper-font-body1_-_font-size);
  font-weight: var(--paper-font-body1_-_font-weight);
  line-height: var(--paper-font-body1_-_line-height);
  display: inline-block;
  position: relative;
}
:host:before {
  content: " ";
  left: 0;
  right: 0;
  width: var(--lc-button-size);
  height: var(--lc-button-size);
  border-radius: 50%;
  background-color: currentcolor;
  opacity: 0.15;
  position: absolute;
}

.lc-circle-button-icon {
  --ha-icon-display: block;
  --mdc-icon-button-size: var(--lc-button-size);
  --mdc-icon-size: var(--lc-button-icon-size);
  --mdc-theme-primary: var(--lc-button-color);
  color: var(--lc-button-color);
}

.lc-circle-button-spinner {
  width: var(--lc-button-size);
  height: var(--lc-button-size);
  border-radius: 50%;
  font-size: var(--lc-button-icon-size);
}`;
var __defProp$b = Object.defineProperty;
var __getOwnPropDesc$a = Object.getOwnPropertyDescriptor;
var __decorateClass$b = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$a(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$b(target, key, result);
  return result;
};
function createComponent(Base) {
  const _LCCircleButton = class _LCCircleButton extends Base {
    constructor(...rest) {
      super(...rest);
      this._popoverOff = false;
      this.disabled = false;
      this.icon = "mdi:gesture-tap-button";
    }
    set color(value) {
      switch (value) {
        case "default":
          this.style.setProperty("--lc-button-color", "currentColor");
          break;
        case "success":
          this.style.setProperty("--lc-button-color", "var(--success-color)");
          break;
        case "info":
          this.style.setProperty("--lc-button-color", "var(--info-color)");
          break;
        case "warning":
          this.style.setProperty("--lc-button-color", "var(--warning-color)");
          break;
        case "error":
          this.style.setProperty("--lc-button-color", "var(--error-color)");
          break;
        default:
          this.style.setProperty("--lc-button-color", value);
          break;
      }
    }
    render() {
      return html`
        <mwc-icon-button
          type="button"
          role="button"
          class="lc-circle-button-icon"
          .disabled=${this.disabled}
          @mouseenter="${this._onMouseenter}"
          @mouseleave="${this._onMouseLeave}"
          @click=${this._onClick}
        >
          ${this._renderIcon()}
        </mwc-icon-button>
      `;
    }
    _renderIcon() {
      if (this.disabled || !this.status) {
        return html`<ha-icon icon=${this.icon} class="icon"></ha-icon>`;
      }
      switch (this.status) {
        case "loading":
          return html`<lc-icon-spinner color="var(--lc-button-color)"></lc-icon-spinner>`;
        case "success":
          return html`<lc-icon-success color="var(--lc-button-color)"></lc-icon-success>`;
        case "error":
          return html`<lc-icon-error color="var(--lc-button-color)"></lc-icon-error>`;
      }
    }
    _removePopover() {
      if (this._popover) {
        this._popover.hide();
        this._popover = void 0;
      }
    }
    _onClick() {
      this._popoverOff = true;
      this._removePopover();
    }
    /**
     * Show tooltip popover
     * @private
     */
    _onMouseenter() {
      if (this._popoverOff) return;
      const rect = this.getClientRects().item(0);
      if (!rect || this.status) return;
      this._popover = document.createElement("lc-popover");
      this._popover.text = this.tooltip;
      this._popover.rect = rect;
      this._popover.placement = "top";
      this._popover.offset = 2;
      document.body.append(this._popover);
    }
    /**
     * Hide tooltip popover
     * @private
     */
    _onMouseLeave() {
      this._removePopover();
      this._popoverOff = false;
    }
  };
  _LCCircleButton.styles = styles$a;
  let LCCircleButton = _LCCircleButton;
  __decorateClass$b([
    n2({ attribute: true })
  ], LCCircleButton.prototype, "icon", 2);
  __decorateClass$b([
    n2({ attribute: "color", reflect: true, type: String })
  ], LCCircleButton.prototype, "color", 1);
  __decorateClass$b([
    n2({ attribute: true })
  ], LCCircleButton.prototype, "tooltip", 2);
  __decorateClass$b([
    n2({ attribute: "status", reflect: true, type: String })
  ], LCCircleButton.prototype, "status", 2);
  __decorateClass$b([
    n2({ attribute: "disabled", reflect: true, type: Boolean })
  ], LCCircleButton.prototype, "disabled", 2);
  return LCCircleButton;
}
(async () => {
  await customElements.whenDefined("ha-icon");
  const source = await customElements.whenDefined("mwc-icon-button");
  customElements.define("lc-circle-button", createComponent(source), { extends: "button" });
})();
function fireEvent(node, type2, detail, options = {}) {
  const _detail = detail === null || detail === void 0 ? {} : detail;
  const event = new Event(type2, {
    bubbles: options.bubbles === void 0 ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === void 0 ? true : options.composed
  });
  event.detail = _detail;
  node.dispatchEvent(event);
  return event;
}
function forwardHaptic(hapticType) {
  fireEvent(window, "haptic", hapticType);
}
function domainToName(localize, domain, manifest) {
  return localize(`component.${domain}.title`) || (manifest == null ? void 0 : manifest.name) || domain;
}
const MAIN_WINDOW_NAME = "ha-main-window";
const mainWindow = (() => {
  try {
    return window.name === MAIN_WINDOW_NAME ? window : parent.name === MAIN_WINDOW_NAME ? parent : top;
  } catch {
    return window;
  }
})();
function isCustomType(type2) {
  return type2.startsWith("custom:");
}
function computeDomain(entityId) {
  return entityId.substring(0, entityId.indexOf("."));
}
function arrayFilter(array2, conditions, maxSize) {
  if (!maxSize || maxSize > array2.length) {
    maxSize = array2.length;
  }
  const filteredArray = [];
  for (let i2 = 0; i2 < array2.length && filteredArray.length < maxSize; i2++) {
    let meetsConditions = true;
    for (const condition of conditions) {
      if (!condition(array2[i2])) {
        meetsConditions = false;
        break;
      }
    }
    if (meetsConditions) {
      filteredArray.push(array2[i2]);
    }
  }
  return filteredArray;
}
function processEditorEntities(entities) {
  return entities.map((entityConf) => {
    if (typeof entityConf === "string") {
      return { entity: entityConf };
    }
    return entityConf;
  });
}
function processEntities(entities, opts = {}) {
  const domains = opts.domains ? typeof opts.domains === "string" ? [opts.domains] : opts.domains : null;
  const maxLength = opts.maxLength ?? Infinity;
  const validateId = opts.validateId == null ? true : opts.validateId;
  if (maxLength < entities.length) {
    throw new Error(`The maximum number of elements is ${maxLength}`);
  }
  const results = new Array(entities.length);
  for (let i2 = 0; i2 < entities.length; i2++) {
    const entity = entities[i2];
    if (!entity) {
      throw new Error(`Missing entity in position ${i2}, null provided`);
    }
    let result;
    if (typeof entity === "string") {
      result = { entity };
    } else if (typeof entity === "object" && !Array.isArray(entity)) {
      if ("type" in entity || "entity" in entity) {
        result = entity;
      } else {
        throw new Error(`Object at position ${i2} is missing entity or type field`);
      }
    } else {
      throw new Error(`Invalid entity at position ${i2}`);
    }
    if ((domains == null ? void 0 : domains.length) || validateId) {
      let regExResult = null;
      if (result.entity) {
        regExResult = /^(\w+)\.(\w+)$/.exec(result.entity);
        if (!regExResult && validateId) {
          throw new Error(`Invalid entity ID at position ${i2}: ${result.entity}`);
        }
      }
      if (domains && regExResult && !domains.includes(regExResult[1])) {
        throw new Error(`Invalid entity domain ${regExResult[1]} at position ${i2}. Allowed ${domains.join(". ")}`);
      }
    }
    results[i2] = result;
  }
  return results;
}
function findEntities(hass, maxEntities, entities, entitiesFallback, includeDomains, entityFilter) {
  const conditions = [];
  if (includeDomains == null ? void 0 : includeDomains.length) {
    conditions.push((eid) => includeDomains.includes(computeDomain(eid)));
  }
  if (entityFilter) {
    conditions.push(
      (eid) => hass.states[eid] && entityFilter(hass.states[eid])
    );
  }
  const entityIds = arrayFilter(entities, conditions, maxEntities);
  if (entityIds.length < maxEntities && entitiesFallback.length) {
    const fallbackEntityIds = findEntities(
      hass,
      maxEntities - entityIds.length,
      entitiesFallback,
      [],
      includeDomains,
      entityFilter
    );
    entityIds.push(...fallbackEntityIds);
  }
  return entityIds;
}
function isShowConfirmation(confirmation, userId) {
  if (!confirmation) return false;
  if (confirmation === true) return true;
  return !confirmation.exemptions || !confirmation.exemptions.some((e2) => e2.user === userId);
}
const style = css`.footer {
  margin-top: 0;
}
.footer .divider {
  margin: 0;
  border: none;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--divider-color);
}
.footer .buttons {
  width: auto;
  padding: var(--padding-top, 10px) 12px var(--padding-bottom, 10px);
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
}
.footer .buttons .btn-wrap {
  padding: 0 6px;
}`;
var __defProp$a = Object.defineProperty;
var __getOwnPropDesc$9 = Object.getOwnPropertyDescriptor;
var __decorateClass$a = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$9(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$a(target, key, result);
  return result;
};
let FooterButtons = class extends LitElement {
  constructor() {
    super(...arguments);
    this._statuses = [];
  }
  render() {
    var _a;
    if (!((_a = this.buttons) == null ? void 0 : _a.length)) {
      return html``;
    }
    return html`
      <div class="footer">
        <hr class="divider" role="separator" />

        <div class="buttons">
          ${this.buttons.map((config, index) => this._renderButton(index, config))}
        </div>
      </div>
    `;
  }
  _renderButton(index, config) {
    if (!config) {
      return html``;
    }
    return html`
      <div class="btn-wrap">
        <lc-circle-button
          data-index=${index}
          color=${config.color}
          icon=${config.icon}
          tooltip=${config.tooltip}
          .status=${this._statuses[index]}
          @click=${this._onClick}
        ></lc-circle-button>
      </div>
    `;
  }
  async _onClick(event) {
    event.stopPropagation();
    const element = event.target;
    const index = parseInt(element.dataset.index);
    if (this._statuses[index] === "loading") return;
    this._setButtonStatus(index, "loading");
    const config = this.buttons[index];
    if (await this._isConfirmed(config)) {
      this._setButtonStatus(index, void 0);
      return;
    }
    const [domain, service] = config.action.split(".", 2);
    const begin = Date.now();
    try {
      await this.hass.callService(domain, service, config.data, config.target);
      const delay = Date.now() - begin;
      if (delay > 600) {
        this._setCallResult(index, "success")();
      } else {
        setTimeout(this._setCallResult(index, "success"), 600 - delay);
      }
    } catch {
      this._setCallResult(index, "error")();
    }
  }
  async _isConfirmed(config) {
    var _a;
    if (!isShowConfirmation(config.confirmation, (_a = this.hass.user) == null ? void 0 : _a.id)) return false;
    forwardHaptic("warning");
    let text = "";
    if (typeof config.confirmation !== "boolean" && config.confirmation.text) {
      text = config.confirmation.text;
    } else {
      const [domain, service] = config.action.split(".", 2);
      const serviceDomains = this.hass.services;
      let serviceName = "";
      if (domain in serviceDomains && service in serviceDomains[domain]) {
        await this.hass.loadBackendTranslation("title");
        const localize = await this.hass.loadBackendTranslation("entity");
        serviceName += domainToName(localize, domain);
        serviceName += ": ";
        serviceName += localize(`component.${domain}.services.${serviceName}.name`) || serviceDomains[domain][service].name || service;
      }
      text = this.hass.localize("ui.panel.lovelace.cards.actions.action_confirmation", {
        action: serviceName || this.hass.localize(`ui.panel.lovelace.editor.action-editor.actions.${config.action}`) || config.action
      });
    }
    const utils = await mainWindow.loadCardHelpers();
    return !await utils.showConfirmationDialog(this, { text, title: config.tooltip });
  }
  _setButtonStatus(index, status) {
    this._statuses[index] = status;
    this._statuses = [...this._statuses];
  }
  _setCallResult(index, status) {
    return () => {
      forwardHaptic("light");
      this._setButtonStatus(index, status);
      setTimeout(() => {
        this._setButtonStatus(index, void 0);
      }, 2500);
    };
  }
};
FooterButtons.styles = style;
__decorateClass$a([
  n2({ attribute: false })
], FooterButtons.prototype, "hass", 2);
__decorateClass$a([
  n2({ attribute: false })
], FooterButtons.prototype, "buttons", 2);
__decorateClass$a([
  r()
], FooterButtons.prototype, "_statuses", 2);
FooterButtons = __decorateClass$a([
  t$1("lc-footer-buttons")
], FooterButtons);
function compareRects(newVal, oldVal) {
  if (!oldVal) return true;
  return newVal.x !== oldVal.x || newVal.y !== oldVal.y || newVal.width !== oldVal.width || newVal.height !== oldVal.height;
}
const styles$9 = css`:host {
  --lc-popover-y: 0px;
  --lc-popover-x: 0px;
  --lc-popover-width: auto;
  --lc-popover-height: auto;
  --lc-popover-arrow-position: 0px;
  --lc-popover-arrow-left: 0px;
  --lc-popover-background-color: var(--card-background-color);
  --lc-popover-text-color: var(--primary-text-color);
  --lc-popover-border-color: var(--divider-color);
  --lc-popover-border-radius: .4rem;
  --lc-popover-padding: .5rem .75rem;
  --lc-popover-arrow-size: 8px;
  --lc-popover-offset: 2px;
  --lc-popover-transform-x: 0;
  --lc-popover-transform-y: 0;
  --lc-popover-transform-scale: .7;
  top: var(--lc-popover-y);
  left: var(--lc-popover-x);
  width: var(--lc-popover-width);
  height: var(--lc-popover-height);
  max-width: 280px;
  display: block;
  position: absolute;
  box-sizing: border-box;
  z-index: 999999;
}

.popover {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: var(--lc-popover-padding);
  opacity: 0;
  transition: opacity 0.2s ease-out, transform 0.15s ease-out;
  box-shadow: var(--mui-shadows-8, 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12));
  background-color: var(--lc-popover-background-color);
  color: var(--lc-popover-text-color);
  border-radius: var(--lc-popover-border-radius);
  border: 1px solid var(--lc-popover-border-color);
  text-align: center;
  pointer-events: none;
  box-sizing: border-box;
  z-index: 9999;
  /* TOP */
  /* BOTTOM */
  /* LEFT */
  /* RIGHT */
}
.popover .text {
  font-size: 0.825rem;
  letter-spacing: 0.3px;
  line-height: 1.3;
  text-rendering: geometricPrecision;
}
.popover .arrow {
  border: var(--lc-popover-arrow-size) solid transparent;
  height: 0;
  width: 0;
  display: block;
  position: absolute;
}
.popover.popover-top {
  transform: translate(0, 6px) scale(0.7);
}
.popover.popover-top .arrow {
  bottom: calc(var(--lc-popover-arrow-size) * -2);
  left: var(--lc-popover-arrow-position);
  border-top-color: var(--lc-popover-background-color);
  filter: drop-shadow(0 1px var(--lc-popover-border-color));
}
.popover.popover-bottom {
  transform: translate(0, -6px) scale(0.7);
}
.popover.popover-bottom .arrow {
  top: calc(var(--lc-popover-arrow-size) * -2);
  left: var(--lc-popover-arrow-position);
  border-bottom-color: var(--lc-popover-background-color);
  filter: drop-shadow(0 -1px var(--lc-popover-border-color));
}
.popover.popover-left {
  transform: translate(6px, 0) scale(0.7);
}
.popover.popover-left .arrow {
  top: var(--lc-popover-arrow-position);
  right: calc(var(--lc-popover-arrow-size) * -2);
  border-left-color: var(--lc-popover-background-color);
  filter: drop-shadow(1px 0 var(--lc-popover-border-color));
}
.popover.popover-right {
  transform: translate(-6px, 0) scale(0.7);
}
.popover.popover-right .arrow {
  top: var(--lc-popover-arrow-position);
  left: calc(var(--lc-popover-arrow-size) * -2);
  border-right-color: var(--lc-popover-background-color);
  filter: drop-shadow(-1px 0 var(--lc-popover-border-color));
}
.popover.show.in {
  transform: translate(0, 0) scale(1);
  opacity: 1;
}
.popover.show.in.out {
  opacity: 0;
}`;
var __defProp$9 = Object.defineProperty;
var __decorateClass$9 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$9(target, key, result);
  return result;
};
const _Popover = class _Popover extends LitElement {
  constructor() {
    super();
    this._hiddenInProcess = false;
    this.placement = "bottom";
    this.rect = { x: 0, y: 0, width: 40, height: 40 };
    this.arrow = 8;
    this.offset = 0;
    this.maxWidth = 280;
  }
  hide() {
    if (this._hiddenInProcess) return;
    this._hiddenInProcess = true;
    const popup = this.shadowRoot.firstElementChild;
    popup.classList.add("out");
    setTimeout(() => this.remove(), 200);
  }
  connectedCallback() {
    super.connectedCallback();
    const elements = document.getElementsByTagName("lc-popover");
    for (const popover of elements) {
      if (popover !== this) {
        popover.hide();
      }
    }
  }
  updated() {
    this._computePosition();
  }
  render() {
    return html`
      <div class="popover">
        <div class="text">${this.text}</div>
        <div class="arrow" />
      </div>
    `;
  }
  _computePosition() {
    const sizeMin = (this.offset + this.arrow) * 2;
    let y2;
    let x;
    let height = Math.ceil(this.offsetHeight) + 1;
    let width = Math.ceil(this.offsetWidth) + 1;
    let arrowPosition;
    let placement = this.placement;
    height = Math.max(height, sizeMin);
    width = Math.min(Math.max(width, sizeMin), this.maxWidth);
    const popover = this.shadowRoot.firstElementChild;
    const xMin = this.offset;
    const xMax = window.innerWidth - width - this.offset;
    const yMin = this.offset;
    const yMax = window.innerHeight - height - this.offset;
    switch (placement) {
      case "top":
        y2 = Math.round(this.rect.y - height - this.arrow - this.offset);
        x = Math.round(this.rect.x + this.rect.width / 2 - width / 2);
        if (y2 < yMin) {
          y2 = Math.round(this.rect.y + this.rect.height + this.arrow + this.offset);
          placement = "bottom";
        }
        x = Math.max(Math.min(x, xMax), xMin);
        break;
      case "bottom":
        y2 = Math.round(this.rect.y + this.rect.height + this.arrow + this.offset);
        x = Math.round(this.rect.x + this.rect.width / 2 - width / 2);
        if (y2 > yMax) {
          y2 = Math.round(this.rect.y - height - this.arrow - this.offset);
          placement = "top";
        }
        x = Math.max(Math.min(x, xMax), xMin);
        break;
      case "left":
        y2 = Math.round(this.rect.y + this.rect.height / 2 - height / 2);
        x = Math.round(this.rect.x - width - this.arrow - this.offset);
        if (x < xMin) {
          x = Math.round(this.rect.x + this.rect.width + this.arrow + this.offset);
          placement = "right";
        }
        y2 = Math.max(Math.min(y2, yMax), yMin);
        break;
      case "right":
        y2 = Math.round(this.rect.y + this.rect.height / 2 - height / 2);
        x = Math.round(this.rect.x + this.rect.width + this.arrow + this.offset);
        if (x > xMax) {
          x = Math.round(this.rect.x - width - this.arrow - this.offset);
          placement = "left";
        }
        y2 = Math.max(Math.min(y2, yMax), yMin);
        break;
    }
    if (placement === "top" || placement === "bottom") {
      arrowPosition = this.rect.x - x + this.rect.width / 2 - this.arrow;
    } else {
      arrowPosition = this.rect.y - y2 + this.rect.height / 2 - this.arrow;
    }
    for (const className of popover.classList.values()) {
      if (/^popover-(:?top|bottom|left|right)$/.test(className)) {
        popover.classList.remove(className);
      }
    }
    popover.classList.add(`popover-${placement}`);
    this.style.setProperty("--lc-popover-arrow-position", `${arrowPosition}px`);
    this.style.setProperty("--lc-popover-arrow-size", `${this.arrow}px`);
    this.style.setProperty("--lc-popover-offset", `${this.offset}px`);
    this.style.setProperty("--lc-popover-y", `${y2}px`);
    this.style.setProperty("--lc-popover-x", `${x}px`);
    this.style.setProperty("--lc-popover-height", `${height}px`);
    this.style.setProperty("--lc-popover-width", `${width}px`);
    setTimeout(() => popover.classList.add("show", "in"), 100);
  }
};
_Popover.styles = styles$9;
let Popover = _Popover;
__decorateClass$9([
  n2()
], Popover.prototype, "text");
__decorateClass$9([
  n2()
], Popover.prototype, "placement");
__decorateClass$9([
  n2({ hasChanged: compareRects })
], Popover.prototype, "rect");
__decorateClass$9([
  n2()
], Popover.prototype, "arrow");
__decorateClass$9([
  n2()
], Popover.prototype, "offset");
__decorateClass$9([
  n2({ attribute: "max-width" })
], Popover.prototype, "maxWidth");
customElements.define("lc-popover", Popover, { extends: "div" });
const styles$8 = css`:host {
  --gauge-needle-position: 0deg;
  display: block;
}
:host .gauge .needle-shadow {
  transition: all 1s ease-in-out;
}
:host .gauge .needle {
  transition: transform 0.6s cubic-bezier(0.26, 0, 0.78, 1.4);
}

.lc-gauge {
  filter: none;
  position: relative;
}
.lc-gauge .gauge {
  position: relative;
  z-index: 1;
}
.lc-gauge .gauge.animated {
  animation-name: flicker;
  animation-timing-function: linear;
  animation-duration: 800ms;
}
.lc-gauge .value {
  left: 0;
  right: 0;
  transform: translateY(-100%);
  text-align: center;
  position: absolute;
  z-index: 2;
}
.lc-gauge .label {
  width: 100%;
  margin-top: 10px;
  text-align: center;
  font-size: 16px;
  position: relative;
  z-index: 3;
}
.lc-gauge.disabled .gauge {
  filter: grayscale(1) brightness(0.6);
}

@keyframes flicker {
  0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
    filter: grayscale(1) brightness(0.6);
  }
  20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
    filter: none;
  }
}`;
var __defProp$8 = Object.defineProperty;
var __getOwnPropDesc$8 = Object.getOwnPropertyDescriptor;
var __decorateClass$8 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$8(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$8(target, key, result);
  return result;
};
function round(value, decimals = 2) {
  const mul = 10 ** decimals;
  return Math.round(value * mul) / mul;
}
function normalize(value, min, max) {
  min = isNaN(min) ? 0 : min;
  max = isNaN(max) || max < min ? 100 : max;
  value = value == null || isNaN(value) ? 0 : value;
  value = value > max ? max : value < min ? min : value;
  return [value, min, max];
}
function getPercent(value, min, max) {
  [value, min, max] = normalize(value, min, max);
  return round((value - min) / (max - min) * 100);
}
function getAngle(value, min, max) {
  const percent = getPercent(value, min, max);
  return percent * 180 / 100;
}
let Gauge = class extends LitElement {
  constructor() {
    super(...arguments);
    this.label = "";
    this.unit = "";
    this.min = 0;
    this.max = 100;
    this.value = 0;
    this.disabled = false;
  }
  set levels(levels) {
    if (!levels) {
      this._levels = void 0;
    } else {
      this._levels = levels.map(({ level, color }) => ({ level, color })).sort((a2, b2) => a2.level - b2.level);
    }
  }
  get levels() {
    if (!this._levels || this._levels.length === 0) {
      return void 0;
    }
    if (this._levels[0].level !== this.min) {
      this._levels = [{ level: this.min, color: "var(--info-color)" }, ...this._levels];
    }
    return this._levels;
  }
  connectedCallback() {
    var _a;
    super.connectedCallback();
    const insetShadowFilterId = "filter-" + Math.random().toString().split(".")[1];
    const dropShadowFilterId = "filter-" + Math.random().toString().split(".")[1];
    this._svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._svg.classList.add("gauge");
    this._svg.setAttribute("viewBox", "-50 -50 100 60");
    this._svg.setAttribute("width", "250");
    this._svg.setAttribute("height", "125");
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.append(this._renderInsetShadow(insetShadowFilterId));
    defs.append(this._renderDropShadow(dropShadowFilterId));
    this._svg.append(defs);
    this._scale = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this._scale.setAttribute("stroke-linejoin", "round");
    this._scale.setAttribute("stroke-width", "0");
    this._scale.setAttribute("stroke", "rgb(0, 0, 0)");
    this._scale.setAttribute("filter", `url(#${insetShadowFilterId})`);
    this._svg.append(this._scale);
    this._needle = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this._needle.classList.add("needle");
    this._needle.setAttribute("style", `transform: rotate(var(--gauge-needle-position))`);
    this._needle.setAttribute("filter", `url(#${dropShadowFilterId})`);
    this._svg.append(this._needle);
    this._text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    this._text.setAttribute("text-anchor", "middle");
    this._text.setAttribute("x", "0");
    this._text.setAttribute("y", "-2");
    this._text.setAttribute("font-weight", "400");
    this._text.setAttribute("font-family", "Roboto, Noto, sans-serif");
    this._text.setAttribute("font-size", "14px");
    this._text.setAttribute("fill", "var(--text-primary-color)");
    this._svg.append(this._text);
    (_a = this.shadowRoot) == null ? void 0 : _a.append(this._svg);
    this._renderScale();
    this._renderNeedle();
    this._renderTextValue();
    this.applyValue();
  }
  disconnectedCallback() {
    var _a;
    super.disconnectedCallback();
    (_a = this._svg) == null ? void 0 : _a.remove();
    this._svg = void 0;
    this._scale = void 0;
  }
  updated(_changed) {
    super.updated(_changed);
    if (_changed.has("levels") || _changed.has("min") || _changed.has("max")) {
      this._renderScale();
    }
    if (_changed.has("value") || _changed.has("min") || _changed.has("max")) {
      this.applyValue();
      this._renderTextValue();
    }
  }
  applyValue() {
    if (this._rafID != null) {
      cancelAnimationFrame(this._rafID);
      this._rafID = null;
    }
    const [value, min, max] = normalize(this.value, this.min, this.max);
    const angle = getAngle(value, min, max);
    const angleRad = (angle - 90) * Math.PI / 180;
    this.style.setProperty("--gauge-needle-position", `${angle}deg`);
    this._shadow.setAttribute("dx", `${round(Math.cos(angleRad), 4)}`);
    this._shadow.setAttribute("dy", `${round(Math.sin(angleRad), 4)}`);
    this._text.innerHTML = `${value}${this.unit}`;
    parseFloat(this.style.getPropertyValue("--gauge-needle-position").replace("deg", ""));
    getAngle(value, min, max);
  }
  _render() {
  }
  _renderNeedle() {
    if (!this._needle) return;
    for (let i2 = 0; i2 < this._needle.childNodes.length; i2++) {
      this._needle.childNodes.item(i2).remove();
    }
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M -25 -2 L -47.5 0 L -25 2 z");
    path.setAttribute("fill", "rgb(200, 200, 200)");
    this._needle.append(path);
  }
  _renderScale() {
    if (!this._scale) return;
    for (let i2 = 0; i2 < this._scale.childNodes.length; i2++) {
      this._scale.childNodes.item(i2).remove();
    }
    if (this.levels) {
      for (let i2 = 0; i2 < this.levels.length; i2++) {
        const { level, color } = this.levels[i2];
        const beginAngle = getAngle(level, this.min, this.max);
        const beginAngleCos = Math.cos(beginAngle * Math.PI / 180);
        const beginAngleSin = Math.sin(beginAngle * Math.PI / 180);
        const endAngle = this.levels[i2 + 1] ? getAngle(this.levels[i2 + 1].level, this.min, this.max) : 180;
        const endAngleCos = Math.cos(endAngle * Math.PI / 180);
        const endAngleSin = Math.sin(endAngle * Math.PI / 180);
        let d2 = "M ";
        d2 += round(0 - 47.5 * beginAngleCos);
        d2 += " ";
        d2 += round(0 - 47.5 * beginAngleSin);
        d2 += " A 47.5 47.5 0 0 1 ";
        d2 += round(0 - 47.5 * endAngleCos);
        d2 += " ";
        d2 += round(0 - 47.5 * endAngleSin);
        d2 += " L ";
        d2 += round(0 - 32.5 * endAngleCos);
        d2 += " ";
        d2 += round(0 - 32.5 * endAngleSin);
        d2 += " A 32.5 32.5 0 0 0 ";
        d2 += round(0 - 32.5 * beginAngleCos);
        d2 += " ";
        d2 += round(0 - 32.5 * beginAngleSin);
        d2 += " z";
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d2);
        path.setAttribute("fill", color);
        this._scale.append(path);
      }
    } else {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M -47.5 0 A 47.5 47.5 0 0 1 47.5 0 L 32.5 0 A 32.5 32.5 0 1 0 -32.5 0 z");
      path.setAttribute("fill", "var(--info-color)");
      this._scale.append(path);
    }
  }
  _renderTextValue() {
  }
  _renderInsetShadow(filterId) {
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.id = filterId;
    const feOffset = document.createElementNS("http://www.w3.org/2000/svg", "feOffset");
    feOffset.setAttribute("in", "SourceGraphic");
    feOffset.setAttribute("dx", "0");
    feOffset.setAttribute("dy", "0");
    filter.append(feOffset);
    const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    feGaussianBlur.setAttribute("stdDeviation", "1");
    feGaussianBlur.setAttribute("result", "offset-blur");
    filter.append(feGaussianBlur);
    const feCompositeOut = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
    feCompositeOut.setAttribute("operator", "out");
    feCompositeOut.setAttribute("in", "SourceGraphic");
    feCompositeOut.setAttribute("in2", "offset-blur");
    feCompositeOut.setAttribute("result", "inverse");
    filter.append(feCompositeOut);
    const feFlood = document.createElementNS("http://www.w3.org/2000/svg", "feFlood");
    feFlood.setAttribute("flood-color", "rgb(0, 0, 0)");
    feFlood.setAttribute("flood-opacity", ".95");
    filter.append(feFlood);
    const feCompositeIn = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
    feCompositeIn.setAttribute("operator", "in");
    feCompositeIn.setAttribute("in", "color");
    feCompositeIn.setAttribute("in2", "inverse");
    feCompositeIn.setAttribute("result", "shadow");
    filter.append(feCompositeIn);
    const feCompositeOver = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
    feCompositeOver.setAttribute("operator", "over");
    feCompositeOver.setAttribute("in", "shadow");
    feCompositeOver.setAttribute("in2", "SourceGraphic");
    filter.append(feCompositeOver);
    return filter;
  }
  _renderDropShadow(filterId) {
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.id = filterId;
    this._shadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow");
    this._shadow.classList.add("needle-shadow");
    this._shadow.setAttribute("dx", "0");
    this._shadow.setAttribute("dy", "0");
    this._shadow.setAttribute("stdDeviation", "0");
    this._shadow.setAttribute("flood-color", "rgb(0, 0, 0)");
    this._shadow.setAttribute("flood-opacity", "0.3");
    filter.append(this._shadow);
    return filter;
  }
};
Gauge.styles = styles$8;
__decorateClass$8([
  n2({ type: String })
], Gauge.prototype, "label", 2);
__decorateClass$8([
  n2({ type: String })
], Gauge.prototype, "unit", 2);
__decorateClass$8([
  n2({ type: Number, reflect: true })
], Gauge.prototype, "min", 2);
__decorateClass$8([
  n2({ type: Number, reflect: true })
], Gauge.prototype, "max", 2);
__decorateClass$8([
  n2({ type: Number })
], Gauge.prototype, "value", 2);
__decorateClass$8([
  n2({ type: Boolean, reflect: true })
], Gauge.prototype, "disabled", 2);
__decorateClass$8([
  n2({ attribute: false })
], Gauge.prototype, "levels", 1);
Gauge = __decorateClass$8([
  t$1("lc-gauge")
], Gauge);
const styles$7 = css``;
var __defProp$7 = Object.defineProperty;
var __getOwnPropDesc$7 = Object.getOwnPropertyDescriptor;
var __decorateClass$7 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$7(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$7(target, key, result);
  return result;
};
let IconSpinner = class extends LitElement {
  constructor() {
    super();
    this.size = 24;
    this.color = "currentColor";
  }
  render() {
    return html`
      <svg role="progressbar" aria-label="Loading" width=${this.size} height=${this.size} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke=${this.color} stroke-linecap="round" stroke-width="5">
          <circle cx="25" cy="25" r="22" opacity="0.3" />
          <g>
            <circle cx="25" cy="25" r="22"  stroke-dasharray="0 138" stroke-dashoffset="0">
              <animate attributeName="stroke-dasharray" dur="1.5s" calcMode="linear" values="0 1400;38 1400;100 1400;100 1400" keyTimes="0;0.33;0.66;1" repeatCount="indefinite" />
              <animate attributeName="stroke-dashoffset" dur="1.5s" calcMode="linear" values="0;-38;-100;-139" keyTimes="0;0.33;0.66;1" repeatCount="indefinite" />
            </circle>
            <animateTransform attributeName="transform" type="rotate" dur="1.5s" values="0 25 25;360 25 25" repeatCount="indefinite" />
          </g>
        </g>
      </svg>
    `;
  }
};
IconSpinner.styles = styles$7;
__decorateClass$7([
  n2({ attribute: "size", type: Number })
], IconSpinner.prototype, "size", 2);
__decorateClass$7([
  n2({ attribute: "color", type: String })
], IconSpinner.prototype, "color", 2);
IconSpinner = __decorateClass$7([
  t$1("lc-icon-spinner")
], IconSpinner);
const styles$6 = css``;
var __defProp$6 = Object.defineProperty;
var __getOwnPropDesc$6 = Object.getOwnPropertyDescriptor;
var __decorateClass$6 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$6(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$6(target, key, result);
  return result;
};
let IconSuccess = class extends LitElement {
  constructor() {
    super();
    this.size = 24;
    this.color = "currentColor";
  }
  render() {
    return html`
      <svg role="status" aria-label="Success" width=${this.size} height=${this.size} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke=${this.color} stroke-linecap="round" stroke-linejoin="round" stroke-width="5">
          <path
            fill=${this.color}
            fill-opacity="0"
            stroke-dasharray="138"
            stroke-dashoffset="138"
            d="m2.5 25c0-12 10-22 22-22s22 10 22 22-10 22-22 22-22-10-22-22z"
          >
            <animate fill="freeze" attributeName="fill-opacity" begin="0.6s" dur="0.15s" values="0;0.2" />
            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="138;0" />
          </path>
          <path stroke-dasharray="30" stroke-dashoffset="30" d="m15 25 7.5 7.5 12-12">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.75s" dur="0.15s" values="30;0" />
          </path>
        </g>
      </svg>
    `;
  }
};
IconSuccess.styles = styles$6;
__decorateClass$6([
  n2({ attribute: "size", type: Number })
], IconSuccess.prototype, "size", 2);
__decorateClass$6([
  n2({ attribute: "color", type: String })
], IconSuccess.prototype, "color", 2);
IconSuccess = __decorateClass$6([
  t$1("lc-icon-success")
], IconSuccess);
const styles$5 = css``;
var __defProp$5 = Object.defineProperty;
var __getOwnPropDesc$5 = Object.getOwnPropertyDescriptor;
var __decorateClass$5 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$5(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$5(target, key, result);
  return result;
};
let IconError = class extends LitElement {
  constructor() {
    super();
    this.size = 24;
    this.color = "currentColor";
  }
  render() {
    return html`
      <svg role="status" aria-label="Success" width=${this.size} height=${this.size} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke=${this.color} stroke-linecap="round" stroke-linejoin="round" stroke-width="5">

          <path
            stroke-dasharray="138"
            stroke-dashoffset="138"
            d="m25 2.5c12 0 22 10 22 22s-10 22-22 22-22-10-22-22 10-22 22-22z"
            fill="#f00"
            fill-opacity="0"
            stroke=${this.color}
            stroke-width="5"
          >
            <animate fill="freeze" attributeName="fill-opacity" begin="0.6s" dur="0.15s" values="0;0.3" />
            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="138;0" />
          </path>
          <path
            d="m25 25 10 10m-10-10-10-10m10 10-10 10m10-10 10-10"
            stroke-dasharray="16"
            stroke-dashoffset="16">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.75s" dur="0.2s" values="16;0" />
          </path>
        </g>
      </svg>

    `;
  }
};
IconError.styles = styles$5;
__decorateClass$5([
  n2({ attribute: "size", type: Number })
], IconError.prototype, "size", 2);
__decorateClass$5([
  n2({ attribute: "color", type: String })
], IconError.prototype, "color", 2);
IconError = __decorateClass$5([
  t$1("lc-icon-error")
], IconError);
const styles$4 = css``;
var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$4 = Object.getOwnPropertyDescriptor;
var __decorateClass$4 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$4(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$4(target, key, result);
  return result;
};
function isSupported(stateObj) {
  const domain = stateObj.entity_id.split(".")[0];
  return domain === "button" || domain === "input_button";
}
let ActionButtonFeature = class extends LitElement {
  static getStubConfig() {
    return {
      type: "custom:lc-circle-button-feature",
      label: "Circle Button Feature",
      icon: "mdi:gesture-tap-button",
      color: "success"
    };
  }
  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }
  render() {
    if (!this._config || !this.hass || !this.stateObj || !isSupported(this.stateObj)) {
      return null;
    }
    return html`
      <lc-circle-button class="button" .icon=${this._config.icon} .tooltip=${this._config.label} .color=${this._config.color} @click=${this._press} />
    `;
  }
  _press(event) {
    event.stopPropagation();
    this.hass.callService("input_button", "press", {
      entity_id: this.stateObj.entity_id
    });
  }
};
ActionButtonFeature.styles = styles$4;
__decorateClass$4([
  n2({ attribute: true })
], ActionButtonFeature.prototype, "hass", 2);
__decorateClass$4([
  n2({ attribute: true })
], ActionButtonFeature.prototype, "stateObj", 2);
__decorateClass$4([
  r()
], ActionButtonFeature.prototype, "_config", 2);
ActionButtonFeature = __decorateClass$4([
  t$1("lc-action-button-feature")
], ActionButtonFeature);
window.customCardFeatures = window.customCardFeatures || [];
window.customCardFeatures.push({
  type: "lc-action-button-feature",
  name: "Circle Button",
  supported: isSupported,
  configurable: true
});
class StructError extends TypeError {
  constructor(failure, failures) {
    let cached;
    const { message, explanation, ...rest } = failure;
    const { path } = failure;
    const msg = path.length === 0 ? message : `At path: ${path.join(".")} -- ${message}`;
    super(explanation ?? msg);
    if (explanation != null)
      this.cause = msg;
    Object.assign(this, rest);
    this.name = this.constructor.name;
    this.failures = () => {
      return cached ?? (cached = [failure, ...failures()]);
    };
  }
}
function isIterable(x) {
  return isObject(x) && typeof x[Symbol.iterator] === "function";
}
function isObject(x) {
  return typeof x === "object" && x != null;
}
function isNonArrayObject(x) {
  return isObject(x) && !Array.isArray(x);
}
function print(value) {
  if (typeof value === "symbol") {
    return value.toString();
  }
  return typeof value === "string" ? JSON.stringify(value) : `${value}`;
}
function shiftIterator(input) {
  const { done, value } = input.next();
  return done ? void 0 : value;
}
function toFailure(result, context, struct, value) {
  if (result === true) {
    return;
  } else if (result === false) {
    result = {};
  } else if (typeof result === "string") {
    result = { message: result };
  }
  const { path, branch } = context;
  const { type: type2 } = struct;
  const { refinement, message = `Expected a value of type \`${type2}\`${refinement ? ` with refinement \`${refinement}\`` : ""}, but received: \`${print(value)}\`` } = result;
  return {
    value,
    type: type2,
    refinement,
    key: path[path.length - 1],
    path,
    branch,
    ...result,
    message
  };
}
function* toFailures(result, context, struct, value) {
  if (!isIterable(result)) {
    result = [result];
  }
  for (const r2 of result) {
    const failure = toFailure(r2, context, struct, value);
    if (failure) {
      yield failure;
    }
  }
}
function* run(value, struct, options = {}) {
  const { path = [], branch = [value], coerce = false, mask: mask2 = false } = options;
  const ctx = { path, branch, mask: mask2 };
  if (coerce) {
    value = struct.coercer(value, ctx);
  }
  let status = "valid";
  for (const failure of struct.validator(value, ctx)) {
    failure.explanation = options.message;
    status = "not_valid";
    yield [failure, void 0];
  }
  for (let [k, v, s2] of struct.entries(value, ctx)) {
    const ts = run(v, s2, {
      path: k === void 0 ? path : [...path, k],
      branch: k === void 0 ? branch : [...branch, v],
      coerce,
      mask: mask2,
      message: options.message
    });
    for (const t2 of ts) {
      if (t2[0]) {
        status = t2[0].refinement != null ? "not_refined" : "not_valid";
        yield [t2[0], void 0];
      } else if (coerce) {
        v = t2[1];
        if (k === void 0) {
          value = v;
        } else if (value instanceof Map) {
          value.set(k, v);
        } else if (value instanceof Set) {
          value.add(v);
        } else if (isObject(value)) {
          if (v !== void 0 || k in value)
            value[k] = v;
        }
      }
    }
  }
  if (status !== "not_valid") {
    for (const failure of struct.refiner(value, ctx)) {
      failure.explanation = options.message;
      status = "not_refined";
      yield [failure, void 0];
    }
  }
  if (status === "valid") {
    yield [void 0, value];
  }
}
class Struct {
  constructor(props) {
    const { type: type2, schema, validator, refiner, coercer = (value) => value, entries = function* () {
    } } = props;
    this.type = type2;
    this.schema = schema;
    this.entries = entries;
    this.coercer = coercer;
    if (validator) {
      this.validator = (value, context) => {
        const result = validator(value, context);
        return toFailures(result, context, this, value);
      };
    } else {
      this.validator = () => [];
    }
    if (refiner) {
      this.refiner = (value, context) => {
        const result = refiner(value, context);
        return toFailures(result, context, this, value);
      };
    } else {
      this.refiner = () => [];
    }
  }
  /**
   * Assert that a value passes the struct's validation, throwing if it doesn't.
   */
  assert(value, message) {
    return assert(value, this, message);
  }
  /**
   * Create a value with the struct's coercion logic, then validate it.
   */
  create(value, message) {
    return create(value, this, message);
  }
  /**
   * Check if a value passes the struct's validation.
   */
  is(value) {
    return is(value, this);
  }
  /**
   * Mask a value, coercing and validating it, but returning only the subset of
   * properties defined by the struct's schema. Masking applies recursively to
   * props of `object` structs only.
   */
  mask(value, message) {
    return mask(value, this, message);
  }
  /**
   * Validate a value with the struct's validation logic, returning a tuple
   * representing the result.
   *
   * You may optionally pass `true` for the `coerce` argument to coerce
   * the value before attempting to validate it. If you do, the result will
   * contain the coerced result when successful. Also, `mask` will turn on
   * masking of the unknown `object` props recursively if passed.
   */
  validate(value, options = {}) {
    return validate(value, this, options);
  }
}
function assert(value, struct, message) {
  const result = validate(value, struct, { message });
  if (result[0]) {
    throw result[0];
  }
}
function create(value, struct, message) {
  const result = validate(value, struct, { coerce: true, message });
  if (result[0]) {
    throw result[0];
  } else {
    return result[1];
  }
}
function mask(value, struct, message) {
  const result = validate(value, struct, { coerce: true, mask: true, message });
  if (result[0]) {
    throw result[0];
  } else {
    return result[1];
  }
}
function is(value, struct) {
  const result = validate(value, struct);
  return !result[0];
}
function validate(value, struct, options = {}) {
  const tuples = run(value, struct, options);
  const tuple = shiftIterator(tuples);
  if (tuple[0]) {
    const error = new StructError(tuple[0], function* () {
      for (const t2 of tuples) {
        if (t2[0]) {
          yield t2[0];
        }
      }
    });
    return [error, void 0];
  } else {
    const v = tuple[1];
    return [void 0, v];
  }
}
function assign(...Structs) {
  const isType = Structs[0].type === "type";
  const schemas = Structs.map((s2) => s2.schema);
  const schema = Object.assign({}, ...schemas);
  return isType ? type(schema) : object(schema);
}
function define(name, validator) {
  return new Struct({ type: name, schema: null, validator });
}
function dynamic(fn) {
  return new Struct({
    type: "dynamic",
    schema: null,
    *entries(value, ctx) {
      const struct = fn(value, ctx);
      yield* struct.entries(value, ctx);
    },
    validator(value, ctx) {
      const struct = fn(value, ctx);
      return struct.validator(value, ctx);
    },
    coercer(value, ctx) {
      const struct = fn(value, ctx);
      return struct.coercer(value, ctx);
    },
    refiner(value, ctx) {
      const struct = fn(value, ctx);
      return struct.refiner(value, ctx);
    }
  });
}
function any() {
  return define("any", () => true);
}
function array(Element) {
  return new Struct({
    type: "array",
    schema: Element,
    *entries(value) {
      if (Element && Array.isArray(value)) {
        for (const [i2, v] of value.entries()) {
          yield [i2, v, Element];
        }
      }
    },
    coercer(value) {
      return Array.isArray(value) ? value.slice() : value;
    },
    validator(value) {
      return Array.isArray(value) || `Expected an array value, but received: ${print(value)}`;
    }
  });
}
function boolean() {
  return define("boolean", (value) => {
    return typeof value === "boolean";
  });
}
function enums(values) {
  const schema = {};
  const description = values.map((v) => print(v)).join();
  for (const key of values) {
    schema[key] = key;
  }
  return new Struct({
    type: "enums",
    schema,
    validator(value) {
      return values.includes(value) || `Expected one of \`${description}\`, but received: ${print(value)}`;
    }
  });
}
function literal(constant) {
  const description = print(constant);
  const t2 = typeof constant;
  return new Struct({
    type: "literal",
    schema: t2 === "string" || t2 === "number" || t2 === "boolean" ? constant : null,
    validator(value) {
      return value === constant || `Expected the literal \`${description}\`, but received: ${print(value)}`;
    }
  });
}
function never() {
  return define("never", () => false);
}
function number() {
  return define("number", (value) => {
    return typeof value === "number" && !isNaN(value) || `Expected a number, but received: ${print(value)}`;
  });
}
function object(schema) {
  const knowns = schema ? Object.keys(schema) : [];
  const Never = never();
  return new Struct({
    type: "object",
    schema: schema ? schema : null,
    *entries(value) {
      if (schema && isObject(value)) {
        const unknowns = new Set(Object.keys(value));
        for (const key of knowns) {
          unknowns.delete(key);
          yield [key, value[key], schema[key]];
        }
        for (const key of unknowns) {
          yield [key, value[key], Never];
        }
      }
    },
    validator(value) {
      return isNonArrayObject(value) || `Expected an object, but received: ${print(value)}`;
    },
    coercer(value, ctx) {
      if (!isNonArrayObject(value)) {
        return value;
      }
      const coerced = { ...value };
      if (ctx.mask && schema) {
        for (const key in coerced) {
          if (schema[key] === void 0) {
            delete coerced[key];
          }
        }
      }
      return coerced;
    }
  });
}
function optional(struct) {
  return new Struct({
    ...struct,
    validator: (value, ctx) => value === void 0 || struct.validator(value, ctx),
    refiner: (value, ctx) => value === void 0 || struct.refiner(value, ctx)
  });
}
function string() {
  return define("string", (value) => {
    return typeof value === "string" || `Expected a string, but received: ${print(value)}`;
  });
}
function type(schema) {
  const keys = Object.keys(schema);
  return new Struct({
    type: "type",
    schema,
    *entries(value) {
      if (isObject(value)) {
        for (const k of keys) {
          yield [k, value[k], schema[k]];
        }
      }
    },
    validator(value) {
      return isNonArrayObject(value) || `Expected an object, but received: ${print(value)}`;
    },
    coercer(value) {
      return isNonArrayObject(value) ? { ...value } : value;
    }
  });
}
function union(Structs) {
  const description = Structs.map((s2) => s2.type).join(" | ");
  return new Struct({
    type: "union",
    schema: null,
    coercer(value, ctx) {
      for (const S2 of Structs) {
        const [error, coerced] = S2.validate(value, {
          coerce: true,
          mask: ctx.mask
        });
        if (!error) {
          return coerced;
        }
      }
      return value;
    },
    validator(value, ctx) {
      const failures = [];
      for (const S2 of Structs) {
        const [...tuples] = run(value, S2, ctx);
        const [first] = tuples;
        if (!first[0]) {
          return [];
        } else {
          for (const [failure] of tuples) {
            if (failure) {
              failures.push(failure);
            }
          }
        }
      }
      return [
        `Expected the value to satisfy a union of \`${description}\`, but received: ${print(value)}`,
        ...failures
      ];
    }
  });
}
function refine(struct, name, refiner) {
  return new Struct({
    ...struct,
    *refiner(value, ctx) {
      yield* struct.refiner(value, ctx);
      const result = refiner(value, ctx);
      const failures = toFailures(result, ctx, struct, value);
      for (const failure of failures) {
        yield { ...failure, refinement: name };
      }
    }
  });
}
const configElementStyle = css`
    .card-config {
        /* Cancels overlapping Margins for HAForm + Card Config options */
        overflow: auto;
    }

    ha-switch {
        padding: 16px 6px;
    }

    .side-by-side {
        display: flex;
        align-items: flex-end;
    }

    .side-by-side > * {
        flex: 1;
        padding-right: 8px;
        padding-inline-end: 8px;
        padding-inline-start: initial;
    }

    .side-by-side > *:last-child {
        flex: 1;
        padding-right: 0;
        padding-inline-end: 0;
        padding-inline-start: initial;
    }

    .suffix {
        margin: 0 8px;
    }

    hui-action-editor,
    ha-select,
    ha-textfield,
    ha-icon-picker {
        margin-top: 8px;
        display: block;
    }

    ha-expansion-panel {
        display: block;
        --expansion-panel-content-padding: 0;
        border-radius: 6px;
        --ha-card-border-radius: 6px;
    }

    ha-expansion-panel .content {
        padding: 12px;
    }

    ha-expansion-panel > *[slot="header"] {
        margin: 0;
        font-size: inherit;
        font-weight: inherit;
    }

    ha-expansion-panel ha-svg-icon {
        color: var(--secondary-text-color);
    }
`;
const BaseCardConfigSchema = object({
  type: string(),
  view_layout: any(),
  layout_options: any(),
  grid_options: any(),
  visibility: any()
});
const ExemptionSchema = object({
  user: string()
});
const ConfirmDialogSchema = object({
  text: optional(string()),
  exemptions: optional(array(ExemptionSchema))
});
const ConfirmationConfigSchema = union([
  boolean(),
  ConfirmDialogSchema
]);
const TargetConfigSchema = object({
  entity_id: optional(union([string(), array(string())])),
  device_id: optional(union([string(), array(string())])),
  area_id: optional(union([string(), array(string())])),
  floor_id: optional(union([string(), array(string())])),
  label_id: optional(union([string(), array(string())]))
});
const ActionConfigServiceSchema = object({
  action: enums(["call-service", "perform-action"]),
  service: optional(string()),
  perform_action: optional(string()),
  service_data: optional(object()),
  data: optional(object()),
  target: optional(TargetConfigSchema),
  confirmation: optional(ConfirmationConfigSchema)
});
const ActionConfigNavigateSchema = object({
  action: literal("navigate"),
  navigation_path: string(),
  navigation_replace: optional(boolean()),
  confirmation: optional(ConfirmationConfigSchema)
});
const ActionConfigUrlSchema = object({
  action: literal("url"),
  url_path: string(),
  confirmation: optional(ConfirmationConfigSchema)
});
const ActionConfigAssistSchema = type({
  action: literal("assist"),
  pipeline_id: optional(string()),
  start_listening: optional(boolean())
});
const ActionConfigMoreInfoSchema = type({
  action: literal("more-info"),
  entity: optional(string())
});
const ActionConfigTypeSchema = object({
  action: enums([
    "none",
    "toggle",
    "more-info",
    "call-service",
    "perform-action",
    "url",
    "navigate",
    "assist"
  ]),
  confirmation: optional(ConfirmationConfigSchema)
});
const ActionConfigSchema = dynamic((value) => {
  if (value && typeof value === "object" && "action" in value) {
    switch (value.action) {
      case "call-service": {
        return ActionConfigServiceSchema;
      }
      case "perform-action": {
        return ActionConfigServiceSchema;
      }
      case "navigate": {
        return ActionConfigNavigateSchema;
      }
      case "url": {
        return ActionConfigUrlSchema;
      }
      case "assist": {
        return ActionConfigAssistSchema;
      }
      case "more-info": {
        return ActionConfigMoreInfoSchema;
      }
    }
  }
  return ActionConfigTypeSchema;
});
function customType() {
  return refine(string(), "custom element type", isCustomType);
}
const TIMESTAMP_RENDERING_FORMATS = ["relative", "total", "date", "time", "datetime"];
const EntitiesConfigBaseSchema = union([
  object({
    entity: string(),
    name: optional(string()),
    icon: optional(string()),
    image: optional(string()),
    secondary_info: optional(string()),
    format: optional(enums(TIMESTAMP_RENDERING_FORMATS)),
    state_color: optional(boolean()),
    tap_action: optional(ActionConfigSchema),
    hold_action: optional(ActionConfigSchema),
    double_tap_action: optional(ActionConfigSchema),
    confirmation: optional(ConfirmationConfigSchema)
  }),
  string()
]);
const ButtonEntityConfigSchema = object({
  entity: string(),
  name: optional(string()),
  icon: optional(string()),
  image: optional(string()),
  show_name: optional(boolean()),
  show_icon: optional(boolean()),
  tap_action: optional(ActionConfigSchema),
  hold_action: optional(ActionConfigSchema),
  double_tap_action: optional(ActionConfigSchema)
});
const ButtonEntitiesRowConfigSchema = object({
  type: literal("button"),
  entity: optional(string()),
  name: optional(string()),
  icon: optional(string()),
  action_name: optional(string()),
  tap_action: ActionConfigSchema,
  hold_action: optional(ActionConfigSchema),
  double_tap_action: optional(ActionConfigSchema)
});
const CastEntitiesRowConfigSchema = object({
  type: literal("cast"),
  view: optional(union([string(), number()])),
  dashboard: optional(string()),
  name: optional(string()),
  icon: optional(string()),
  hide_if_unavailable: optional(boolean())
});
const CallServiceEntitiesRowConfigSchema = object({
  type: enums(["call-service", "perform-action"]),
  name: string(),
  service: optional(string()),
  action: optional(string()),
  icon: optional(string()),
  action_name: optional(string()),
  data: optional(any())
});
const ConditionalEntitiesRowConfigSchema = object({
  type: literal("conditional"),
  row: any(),
  conditions: array(any())
});
const DividerEntitiesRowConfigSchema = object({
  type: literal("divider"),
  style: optional(any())
});
const SectionEntitiesRowConfigSchema = object({
  type: literal("section"),
  label: optional(string())
});
const WebLinkEntitiesRowConfigSchema = object({
  type: literal("weblink"),
  url: string(),
  name: optional(string()),
  icon: optional(string())
});
const ButtonsEntitiesRowConfigSchema = object({
  type: literal("buttons"),
  entities: array(ButtonEntityConfigSchema)
});
const AttributeEntitiesRowConfigSchema = object({
  type: literal("attribute"),
  entity: string(),
  attribute: string(),
  prefix: optional(string()),
  suffix: optional(string()),
  name: optional(string()),
  icon: optional(string()),
  format: optional(enums(["relative", "total", "date", "time", "datetime"]))
});
const TextEntitiesRowConfigSchema = object({
  type: literal("text"),
  name: string(),
  text: string(),
  icon: optional(string())
});
const CustomEntitiesRowConfigSchema = type({
  type: customType()
});
const EntitiesConfigSchema = dynamic((value) => {
  if (value && typeof value === "object" && "type" in value) {
    if (isCustomType(value.type)) {
      return CustomEntitiesRowConfigSchema;
    }
    switch (value.type) {
      case "attribute": {
        return AttributeEntitiesRowConfigSchema;
      }
      case "button": {
        return ButtonEntitiesRowConfigSchema;
      }
      case "buttons": {
        return ButtonsEntitiesRowConfigSchema;
      }
      case "perform-action":
      case "call-service": {
        return CallServiceEntitiesRowConfigSchema;
      }
      case "cast": {
        return CastEntitiesRowConfigSchema;
      }
      case "conditional": {
        return ConditionalEntitiesRowConfigSchema;
      }
      case "divider": {
        return DividerEntitiesRowConfigSchema;
      }
      case "section": {
        return SectionEntitiesRowConfigSchema;
      }
      case "text": {
        return TextEntitiesRowConfigSchema;
      }
      case "weblink": {
        return WebLinkEntitiesRowConfigSchema;
      }
    }
  }
  return EntitiesConfigBaseSchema;
});
const ButtonConfigSchema = object({
  color: optional(string()),
  icon: optional(string()),
  tooltip: optional(string()),
  action: string(),
  data: optional(object()),
  target: optional(TargetConfigSchema),
  confirmation: optional(ConfirmationConfigSchema)
});
const EntitiesActionsCardConfigSchema = assign(
  BaseCardConfigSchema,
  object({
    title: optional(union([string(), boolean()])),
    entity: optional(string()),
    entities: array(EntitiesConfigSchema),
    theme: optional(string()),
    icon: optional(string()),
    buttons: optional(array(ButtonConfigSchema))
  })
);
const styles$3 = css`.edit-entity-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
}

hui-header-footer-editor {
  padding-top: 4px;
}

ha-textfield {
  display: block;
  margin-bottom: 16px;
}`;
var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __decorateClass$3 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$3(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$3(target, key, result);
  return result;
};
let EntitiesActionsCardConfig = class extends LitElement {
  setConfig(config) {
    assert(config, EntitiesActionsCardConfigSchema);
    this._config = config;
    this._configEntities = processEntities(config.entities);
  }
  async firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    const utils = await window.parent.loadCardHelpers();
    utils.importMoreInfoControl;
  }
  render() {
    if (!this.hass || !this._config) {
      return html``;
    }
    if (this._subElementEditorConfig) {
      return html`
        <hui-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        >
        </hui-sub-element-editor>
      `;
    }
    const optional2 = `(${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})`;
    return html`
      <div class="card-config">
        <ha-textfield
          .label="${this.hass.localize("ui.panel.lovelace.editor.card.generic.title")} ${optional2}"
          .value=${this._title}
          .configValue=${"title"}
          @input=${this._valueChanged}
        ></ha-textfield>
        <ha-theme-picker
          .hass=${this.hass}
          .value=${this._theme}
          .label=${`${this.hass.localize("ui.panel.lovelace.editor.card.generic.theme")} ${optional2}`}
          .configValue=${"theme"}
          @value-changed=${this._valueChanged}
        ></ha-theme-picker>
      </div>
      <hui-entities-card-row-editor
        .hass=${this.hass}
        .entities=${this._configEntities}
        @entities-changed=${this._valueChanged}
        @edit-detail-element=${this._editDetailElement}
      ></hui-entities-card-row-editor>
    `;
  }
  _valueChanged(ev) {
    var _a;
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    const configValue = target.configValue || ((_a = this._subElementEditorConfig) == null ? void 0 : _a.type);
    const value = target.checked !== void 0 ? target.checked : target.value || ev.detail.config || ev.detail.value;
    if (configValue === "title" && target.value === this._title || configValue === "theme" && target.value === this._theme) {
      return;
    }
    if (configValue === "row" || ev.detail && ev.detail.entities) {
      const newConfigEntities = ev.detail.entities || this._configEntities.concat();
      if (configValue === "row") {
        if (!value) {
          newConfigEntities.splice(this._subElementEditorConfig.index, 1);
          this._goBack();
        } else {
          newConfigEntities[this._subElementEditorConfig.index] = value;
        }
        this._subElementEditorConfig.elementConfig = value;
      }
      this._config = {
        ...this._config,
        entities: newConfigEntities
      };
      this._configEntities = processEditorEntities(this._config.entities);
    } else if (configValue) {
      if (value === "") {
        this._config = { ...this._config };
        delete this._config[configValue];
      } else {
        this._config = {
          ...this._config,
          [configValue]: value
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }
  _handleSubElementChanged(ev) {
    var _a;
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const configValue = (_a = this._subElementEditorConfig) == null ? void 0 : _a.type;
    const value = ev.detail.config;
    if (configValue === "row") {
      const newConfigEntities = this._configEntities.concat();
      if (!value) {
        newConfigEntities.splice(this._subElementEditorConfig.index, 1);
        this._goBack();
      } else {
        newConfigEntities[this._subElementEditorConfig.index] = value;
      }
      this._config = { ...this._config, entities: newConfigEntities };
      this._configEntities = processEditorEntities(this._config.entities);
    } else if (configValue) {
      if (value === "") {
        this._config = { ...this._config };
        delete this._config[configValue];
      } else {
        this._config = {
          ...this._config,
          [configValue]: value
        };
      }
    }
    this._subElementEditorConfig = {
      ...this._subElementEditorConfig,
      elementConfig: value
    };
    console.log(this._subElementEditorConfig);
    fireEvent(this, "config-changed", { config: this._config });
  }
  _editDetailElement(ev) {
    this._subElementEditorConfig = ev.detail.subElementConfig;
    console.log(this._subElementEditorConfig);
  }
  _handleConfigChanged(ev) {
    console.log(ev);
  }
  _handleGUIModeChanged(ev) {
    console.log(ev);
  }
  _goBack() {
    this._subElementEditorConfig = void 0;
  }
  get _title() {
    return this._config.title || "";
  }
  get _theme() {
    return this._config.theme || "";
  }
};
EntitiesActionsCardConfig.styles = [styles$3, configElementStyle];
__decorateClass$3([
  n2({ attribute: false })
], EntitiesActionsCardConfig.prototype, "hass", 2);
__decorateClass$3([
  r()
], EntitiesActionsCardConfig.prototype, "_config", 2);
__decorateClass$3([
  r()
], EntitiesActionsCardConfig.prototype, "_configEntities", 2);
__decorateClass$3([
  r()
], EntitiesActionsCardConfig.prototype, "_subElementEditorConfig", 2);
EntitiesActionsCardConfig = __decorateClass$3([
  t$1("lc-entities-actions-card-config")
], EntitiesActionsCardConfig);
const styles$2 = css`ha-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
}

.card-header .name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#states {
  flex: 1;
}

#states > * {
  margin: 8px 0;
}

#states > *:first-child {
  margin-top: 0;
}

#states > *:last-child {
  margin-bottom: 0;
}

#states > div > * {
  overflow: clip visible;
}

#states > div {
  position: relative;
}

.icon {
  padding: 0px 18px 0px 8px;
}

.header {
  border-top-left-radius: var(--ha-card-border-radius, 12px);
  border-top-right-radius: var(--ha-card-border-radius, 12px);
  margin-bottom: 16px;
  overflow: hidden;
}

.footer {
  border-bottom-left-radius: var(--ha-card-border-radius, 12px);
  border-bottom-right-radius: var(--ha-card-border-radius, 12px);
  margin-top: -16px;
  overflow: hidden;
}`;
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$2(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$2(target, key, result);
  return result;
};
let EntitiesActionsCard = class extends LitElement {
  static async getConfigElement() {
    const source = await customElements.whenDefined("hui-entities-card");
    await source.getConfigElement();
    return document.createElement("lc-entities-actions-card-config");
  }
  static getStubConfig(hass, entities, entitiesFallback) {
    const maxEntities = 3;
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFallback,
      ["light", "switch", "sensor"]
    );
    return {
      entities: foundEntities,
      buttons: [
        { color: "info", icon: "mdi:reload", action: "homeassistant.reload_all" }
      ]
    };
  }
  async setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("Entities must be specified");
    }
    const entities = processEntities(config.entities);
    const utils = await mainWindow.loadCardHelpers();
    this._config = config;
    this._configEntities = entities;
    this._createRowElement = utils.createRowElement;
  }
  getCardSize() {
    if (!this._config) {
      return 0;
    }
    return (this._config.title ? 2 : 0) + (this._config.entities.length || 1);
  }
  render() {
    if (!this._config || !this.hass) {
      return html``;
    }
    return html`
      <ha-card>
        ${this._renderHeader()}
        ${this._renderEntities()}
        <lc-footer-buttons 
          .hass=${this.hass}
          .buttons=${this._config.buttons}
        ></lc-footer-buttons>
      </ha-card>
    `;
  }
  _renderHeader() {
    var _a, _b;
    if (!((_a = this._config) == null ? void 0 : _a.title) && !((_b = this._config) == null ? void 0 : _b.icon)) {
      return html``;
    }
    const icon = this._config.icon ? html`
      <ha-icon class="icon" .icon=${this._config.icon}></ha-icon>` : "";
    return html`
      <h1 class="card-header">
        <div class="name">
          ${icon}
          ${this._config.title}
        </div>
      </h1>
    `;
  }
  _renderEntities() {
    if (!this._configEntities) {
      return html``;
    }
    const entities = this._configEntities.map((entityConf) => this._renderEntity(entityConf));
    return html`
      <div id="states" class="card-content">${entities}</div>`;
  }
  _renderEntity(entityConf) {
    let config;
    if ((!("type" in entityConf) || entityConf.type === "conditional") && "state_color" in this._config) {
      config = { state_color: this._config.state_color, ...entityConf };
    } else if (entityConf.type === "perform-action") {
      config = { ...entityConf, type: "call-service" };
    } else {
      config = { ...entityConf };
    }
    const element = this._createRowElement(config);
    if (this.hass) {
      element.hass = this.hass;
    }
    return html`
      <div>${element}</div>`;
  }
};
EntitiesActionsCard.styles = styles$2;
__decorateClass$2([
  n2({ attribute: false })
], EntitiesActionsCard.prototype, "hass", 2);
__decorateClass$2([
  r()
], EntitiesActionsCard.prototype, "_config", 2);
EntitiesActionsCard = __decorateClass$2([
  t$1("lc-entities-actions-card")
], EntitiesActionsCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "lc-entities-actions-card",
  name: "Entities With Actions Card",
  preview: true,
  description: "This map allows you to group entities and actions that are triggered by buttons in the footer.",
  documentationURL: "https://github.com/itsib/lovelace-cards/blob/main/README.md"
});
const TestEntity = object({
  val: optional(number()),
  entity: string(),
  name: optional(string()),
  icon: optional(string()),
  image: optional(string()),
  secondary_info: optional(string()),
  state_color: optional(boolean()),
  tap_action: optional(ActionConfigSchema),
  hold_action: optional(ActionConfigSchema),
  double_tap_action: optional(ActionConfigSchema),
  confirmation: optional(ConfirmationConfigSchema)
});
const GaugeActionsCardConfigSchema = assign(
  BaseCardConfigSchema,
  object({
    title: optional(union([string(), boolean()])),
    entities: array(TestEntity),
    theme: optional(string()),
    icon: optional(string()),
    buttons: optional(array(ButtonConfigSchema))
  })
);
const styles$1 = css``;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$1(target, key, result);
  return result;
};
let GaugeActionsCardConfig = class extends LitElement {
  setConfig(config) {
    assert(config, GaugeActionsCardConfigSchema);
    this._config = config;
    this._configEntities = processEntities(config.entities, { domains: "sensor" });
  }
  async firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    const utils = await window.parent.loadCardHelpers();
    utils.importMoreInfoControl;
  }
  render() {
    if (!this.hass || !this._config) {
      return html``;
    }
    if (this._subElementEditorConfig) {
      return html`
        <hui-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        >
        </hui-sub-element-editor>
      `;
    }
    const optional2 = `(${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})`;
    return html`
      <div class="card-config">
        <ha-textfield
          .label="${this.hass.localize("ui.panel.lovelace.editor.card.generic.title")} ${optional2}"
          .value=${this._title}
          .configValue=${"title"}
          @input=${this._valueChanged}
        ></ha-textfield>
        <ha-theme-picker
          .hass=${this.hass}
          .value=${this._theme}
          .label=${`${this.hass.localize("ui.panel.lovelace.editor.card.generic.theme")} ${optional2}`}
          .configValue=${"theme"}
          @value-changed=${this._valueChanged}
        ></ha-theme-picker>
      </div>
      <hui-entities-card-row-editor
        .hass=${this.hass}
        .entities=${this._configEntities}
        @entities-changed=${this._valueChanged}
        @edit-detail-element=${this._editDetailElement}
      ></hui-entities-card-row-editor>
    `;
  }
  _valueChanged(ev) {
    var _a;
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    const configValue = target.configValue || ((_a = this._subElementEditorConfig) == null ? void 0 : _a.type);
    const value = target.checked !== void 0 ? target.checked : target.value || ev.detail.config || ev.detail.value;
    if (configValue === "title" && target.value === this._title || configValue === "theme" && target.value === this._theme) {
      return;
    }
    if (configValue === "row" || ev.detail && ev.detail.entities) {
      const newConfigEntities = ev.detail.entities || this._configEntities.concat();
      if (configValue === "row") {
        if (!value) {
          newConfigEntities.splice(this._subElementEditorConfig.index, 1);
          this._goBack();
        } else {
          newConfigEntities[this._subElementEditorConfig.index] = value;
        }
        this._subElementEditorConfig.elementConfig = value;
      }
      this._config = {
        ...this._config,
        entities: newConfigEntities
      };
      this._configEntities = processEditorEntities(this._config.entities);
    } else if (configValue) {
      if (value === "") {
        this._config = { ...this._config };
        delete this._config[configValue];
      } else {
        this._config = {
          ...this._config,
          [configValue]: value
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }
  _handleSubElementChanged(ev) {
    var _a;
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const configValue = (_a = this._subElementEditorConfig) == null ? void 0 : _a.type;
    const value = ev.detail.config;
    if (configValue === "row") {
      const newConfigEntities = this._configEntities.concat();
      if (!value) {
        newConfigEntities.splice(this._subElementEditorConfig.index, 1);
        this._goBack();
      } else {
        newConfigEntities[this._subElementEditorConfig.index] = value;
      }
      this._config = { ...this._config, entities: newConfigEntities };
      this._configEntities = processEditorEntities(this._config.entities);
    } else if (configValue) {
      if (value === "") {
        this._config = { ...this._config };
        delete this._config[configValue];
      } else {
        this._config = {
          ...this._config,
          [configValue]: value
        };
      }
    }
    this._subElementEditorConfig = {
      ...this._subElementEditorConfig,
      elementConfig: value
    };
    console.log(this._subElementEditorConfig);
    fireEvent(this, "config-changed", { config: this._config });
  }
  _editDetailElement(ev) {
    this._subElementEditorConfig = ev.detail.subElementConfig;
    console.log(this._subElementEditorConfig);
  }
  _handleConfigChanged(ev) {
    console.log(ev);
  }
  _handleGUIModeChanged(ev) {
    console.log(ev);
  }
  _goBack() {
    this._subElementEditorConfig = void 0;
  }
  get _title() {
    return this._config.title || "";
  }
  get _theme() {
    return this._config.theme || "";
  }
};
GaugeActionsCardConfig.styles = [styles$1, configElementStyle];
__decorateClass$1([
  n2({ attribute: false })
], GaugeActionsCardConfig.prototype, "hass", 2);
__decorateClass$1([
  r()
], GaugeActionsCardConfig.prototype, "_config", 2);
__decorateClass$1([
  r()
], GaugeActionsCardConfig.prototype, "_configEntities", 2);
__decorateClass$1([
  r()
], GaugeActionsCardConfig.prototype, "_subElementEditorConfig", 2);
GaugeActionsCardConfig = __decorateClass$1([
  t$1("lc-gauge-actions-card-config")
], GaugeActionsCardConfig);
const styles = css`:host {
  font-family: var(--paper-font-body1_-_font-family);
  -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
  font-size: var(--paper-font-body1_-_font-size);
  font-weight: var(--paper-font-body1_-_font-weight);
  line-height: var(--paper-font-body1_-_line-height);
  color: var(--primary-text-color);
}

.mariadb-card .card-header {
  padding: 16px;
  display: flex;
}
.mariadb-card .card-header .logo {
  width: auto;
  height: 40px;
}
.mariadb-card .card-header .info {
  padding-left: 16px;
}
.mariadb-card .card-header .info .name {
  font-size: 22px;
  color: var(--ha-card-header-color, --primary-text-color);
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mariadb-card .card-header .info .version {
  margin-top: 4px;
  color: var(--secondary-text-color);
  font-size: 14px;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mariadb-card .card-content {
  margin: 0;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mariadb-card .card-content .gauge-wrap {
  width: 132px;
  margin: 0 6px;
  cursor: pointer;
}
.mariadb-card .card-footer {
  margin: 16px 16px;
  padding-top: 16px;
  border-top: 1px solid var(--entities-divider-color, var(--divider-color));
  display: flex;
  justify-content: space-between;
}
.mariadb-card .card-footer .database-size {
  display: flex;
  align-items: center;
}
.mariadb-card .card-footer .database-size .icon {
  cursor: pointer;
}
.mariadb-card .card-footer .database-size .icon img {
  width: auto;
  height: 36px;
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out 0s;
}
.mariadb-card .card-footer .database-size .icon:hover img {
  opacity: 0.9;
}
.mariadb-card .card-footer .database-size .value {
  margin-left: 14px;
  font-size: 16px;
  cursor: pointer;
}
.mariadb-card .card-footer .actions {
  margin-right: -8px;
  display: flex;
}
.mariadb-card .card-footer .actions .btn-wrap {
  padding: 0 8px;
}
.mariadb-card .card-footer .actions .btn-wrap.purge {
  --button-icon-color: var(--info-color);
}
.mariadb-card .card-footer .actions .btn-wrap.reload {
  --button-icon-color: var(--warning-color);
}
.mariadb-card .card-footer .actions .btn-wrap.stop {
  --button-icon-color: var(--error-color);
}
.mariadb-card .card-footer .actions .btn-wrap.start {
  --button-icon-color: var(--success-color);
}`;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
let GaugeActionsCard = class extends LitElement {
  static async getConfigElement() {
    const source = await customElements.whenDefined("hui-entities-card");
    await source.getConfigElement();
    return document.createElement("lc-gauge-actions-card-config");
  }
  static getStubConfig(hass, entities, entitiesFallback) {
    const maxEntities = 3;
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFallback,
      ["sensor"],
      (entity) => /^\d+(:?\.\d+)?$/.test(entity.state)
    );
    console.log(foundEntities);
    return {
      entities: foundEntities,
      buttons: [
        { color: "info", icon: "mdi:reload", action: "homeassistant.reload_all" }
      ]
    };
  }
  async setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("Entities must be specified");
    }
    const entities = processEntities(config.entities, {
      domains: [
        "counter",
        "input_number",
        "number",
        "sensor",
        "light"
      ]
    });
    this._config = config;
    this._configEntities = entities;
  }
  getCardSize() {
    if (!this._config) {
      return 0;
    }
    return (this._config.title ? 2 : 0) + (this._config.entities.length || 1);
  }
  render() {
    if (!this._config || !this.hass) {
      return html``;
    }
    return html`
      <ha-card>
        ${this._renderHeader()}
        ${this._renderEntities()}
        <lc-footer-buttons
          .hass=${this.hass}
          .buttons=${this._config.buttons}
        ></lc-footer-buttons>
      </ha-card>
    `;
  }
  _renderHeader() {
    var _a, _b;
    if (!((_a = this._config) == null ? void 0 : _a.title) && !((_b = this._config) == null ? void 0 : _b.icon)) {
      return html``;
    }
    const icon = this._config.icon ? html`
      <ha-icon class="icon" .icon=${this._config.icon}></ha-icon>` : "";
    return html`
      <h1 class="card-header">
        <div class="name">
          ${icon}
          ${this._config.title}
        </div>
      </h1>
    `;
  }
  _renderEntities() {
    if (!this._configEntities) {
      return html``;
    }
    const entities = this._configEntities.map((entity) => this._renderEntity(entity));
    return html`
      <div class="card-content">${entities}</div>`;
  }
  _renderEntity(_entity) {
    var _a, _b, _c, _d;
    const stateObj = (_b = (_a = this.hass) == null ? void 0 : _a.states) == null ? void 0 : _b[_entity.entity];
    (stateObj == null ? void 0 : stateObj.state) ? Number(stateObj == null ? void 0 : stateObj.state) : void 0;
    ((_c = this._config) == null ? void 0 : _c.attribute) ? stateObj == null ? void 0 : stateObj.attributes[this._config.attribute] : stateObj == null ? void 0 : stateObj.state;
    const value = Math.round((((_d = stateObj == null ? void 0 : stateObj.attributes) == null ? void 0 : _d.brightness) ?? 0) / 255 * 1e3) / 10;
    console.log(value);
    return html`
      <div class="gauge-wrap">
        <lc-gauge
          .hass="${this.hass}"
          .label="${"CPU"}"
          .unit="${"%"}"
          .min="${0}"
          .max="${100}"
          .levels="${[
      { level: 0, color: "var(--success-color)" },
      { level: 20, color: "var(--warning-color)" },
      { level: 70, color: "var(--error-color)" }
    ]}"
          .value="${value}"
          .disabled="${true}"
        ></lc-gauge>
      </div>`;
  }
};
GaugeActionsCard.styles = styles;
__decorateClass([
  n2({ attribute: false })
], GaugeActionsCard.prototype, "hass", 2);
__decorateClass([
  r()
], GaugeActionsCard.prototype, "_config", 2);
GaugeActionsCard = __decorateClass([
  t$1("lc-gauge-actions-card")
], GaugeActionsCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "lc-gauge-actions-card",
  name: "Gauge With Actions Card",
  description: "This map allows you to group three gauge and actions that are triggered by buttons in the footer.",
  preview: true,
  configurable: false
});
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
    for (let i2 = 0; i2 < mutations.length; i2++) {
      const { addedNodes, removedNodes } = mutations[i2];
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
    switch (element.nodeName) {
      case "HA-CONFIG-INTEGRATIONS-DASHBOARD":
        waitSelectAll(element, "[data-domain]").then((list) => this.handleIntegrationList(list));
        break;
      case "HA-CONFIG-INTEGRATION-PAGE":
        const domain = element == null ? void 0 : element.domain;
        waitSelect(element, ".logo-container").then((_element) => _element && this.handleIntegrationPage(domain, _element));
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
export {
  Gauge,
  IconError,
  IconSpinner,
  IconSuccess,
  LC_ICONS,
  LC_ICONS_MAP
};
