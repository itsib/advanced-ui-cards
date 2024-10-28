const LitElement = Object.getPrototypeOf(customElements.get("home-assistant-main"));
const { html, css } = LitElement.prototype;
const styles$9 = css`:host {
  display: block;
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
function waitShadowRoot(root, callback) {
  let attachShadowSrc = root.attachShadow;
  root.attachShadow = (init) => {
    if (!attachShadowSrc) {
      throw new Error("No attachShadow function");
    }
    const shadowRoot = attachShadowSrc.call(root, init);
    callback(shadowRoot);
    root.attachShadow = attachShadowSrc;
    attachShadowSrc = void 0;
    return shadowRoot;
  };
  return () => {
    if (!attachShadowSrc) {
      return;
    }
    root.attachShadow = attachShadowSrc;
    attachShadowSrc = void 0;
  };
}
function waitHtmlElement(root, selector, callback) {
  const alreadyFound = root.querySelector(selector);
  if (alreadyFound) {
    setTimeout(() => callback(alreadyFound), 1);
    return () => {
    };
  }
  let observer = new MutationObserver(() => {
    const found = root.querySelector(selector);
    if (found && observer) {
      observer.disconnect();
      callback(found);
      observer = void 0;
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  return () => {
    observer == null ? void 0 : observer.disconnect();
    observer = void 0;
  };
}
function waitChildNode(root, selector, callback) {
  if (!root) {
    throw new Error("Target element not provided");
  }
  if (!selector) {
    throw new Error("No selector provided");
  }
  const alreadyFound = querySelector(root, selector);
  if (alreadyFound) {
    setTimeout(() => callback(alreadyFound), 1);
    return () => {
    };
  }
  let destroy0 = void 0;
  let destroy1 = void 0;
  let destroy2 = void 0;
  const destroy = () => {
    destroy0 == null ? void 0 : destroy0();
    destroy1 == null ? void 0 : destroy1();
    destroy2 == null ? void 0 : destroy2();
  };
  const onFound = (element) => {
    destroy();
    callback(element);
  };
  destroy0 = waitHtmlElement(root, selector, onFound);
  destroy1 = waitShadowRoot(root, (shadowRoot) => {
    destroy2 = waitHtmlElement(shadowRoot, selector, onFound);
  });
  return () => {
    destroy();
  };
}
async function waitElement(root, selector, timeout = Infinity) {
  root = await resolveElement(root);
  return new Promise((resolve, reject) => {
    let cancel = void 0;
    let rejectTimer = void 0;
    if (isFinite(timeout)) {
      rejectTimer = setTimeout(() => {
        cancel == null ? void 0 : cancel();
        reject(new DOMException(`Timeout - "${selector}"`, "TimeoutError"));
      }, timeout);
    }
    cancel = waitChildNode(root, selector, (element) => {
      if (rejectTimer != null) {
        clearTimeout(rejectTimer);
      }
      resolve(element);
    });
  });
}
async function resolveElement(element) {
  return new Promise(async (resolve) => {
    if (element.updateComplete) {
      await element.updateComplete;
    }
    setTimeout(() => resolve(element), 10);
  });
}
function querySelector(element, selector) {
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
function formatNumberValue(hass, value) {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return void 0;
  }
  return numValue.toLocaleString(numberFormatToLocale(hass));
}
function numberFormatToLocale(hass) {
  switch (hass.locale.number_format) {
    case "comma_decimal":
      return ["en-US", "en"];
    case "decimal_comma":
      return ["de", "es", "it"];
    case "space_comma":
      return ["fr", "sv", "cs"];
    case "system":
      return void 0;
    default:
      return hass.locale.language;
  }
}
let GAUGE_PROMISE;
async function waitGauge(hass) {
  if (!GAUGE_PROMISE) {
    GAUGE_PROMISE = window.loadCardHelpers().then((helpers) => {
      const entity = Object.keys(hass.entities).find((id) => id.startsWith("sensor.") && !isNaN(Number(hass.states[id].state)));
      helpers.createCardElement({ type: "gauge", entity });
    });
  }
  return GAUGE_PROMISE;
}
const _LcGauge = class _LcGauge extends LitElement {
  constructor() {
    super(...arguments);
    this.label = "";
    this.unit = "";
    this.min = 0;
    this.max = 100;
    this.disabled = false;
    this._value = 0;
    this._disabled = false;
    this._animated = false;
  }
  firstUpdated(changed) {
    super.firstUpdated(changed);
    waitGauge(this.hass).catch(console.error);
    waitElement(this, "ha-gauge").then((element) => waitElement(element, "svg.text")).then((element) => {
      if (element) {
        element.style.visibility = "hidden";
      }
    }).catch(console.error);
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    if (changed.has("disabled")) {
      if (this.disabled) {
        this._animated = false;
        if (this._animationTimeout) {
          clearTimeout(this._animationTimeout);
        }
      } else if (this._disabled !== this.disabled) {
        this._animated = true;
        this._value = this.max;
        this._animationTimeout = setTimeout(() => {
          this._value = this.min;
          this._animationTimeout = setTimeout(() => {
            this._value = this.value ?? 0;
            this._animated = false;
            this._animationTimeout = void 0;
          }, 1100);
        }, 1100);
      }
      this._disabled = this.disabled;
    }
    if ((changed.has("value") || changed.has("disabled")) && !this.disabled && !this._animated && this._value !== this.value) {
      this._value = this.value ?? 0;
    }
    if ((changed.has("min") || changed.has("disabled")) && this.disabled && !this._animated && this._value !== this.min) {
      this._value = this.min;
    }
  }
  render() {
    const disabled = this.disabled || this.value === void 0;
    return html`
      <div class="${`lc-gauge ${disabled ? "disabled" : ""}`}">
        <div class="${`gauge ${this._animated ? "animated" : ""}`}">
          <ha-gauge .min="${this.min}" .max="${this.max}" .value="${this._value}" .needle="${true}" .levels="${this.levels}" .locale="${this.hass.locale}"></ha-gauge>
        </div>
        <div class="value">${this._formatValue()}</div>
        <div class="label">${this.label}</div>
      </div>
    `;
  }
  _formatValue() {
    if (this.disabled || this._animated || this._value === void 0 || isNaN(this._value)) {
      return `--${this.unit}`;
    }
    return `${formatNumberValue(this.hass, this.value)}${this.unit}`;
  }
};
_LcGauge.properties = {
  hass: { attribute: true },
  label: { attribute: true, type: String },
  unit: { attribute: true, type: String },
  min: { attribute: true, type: Number },
  max: { attribute: true, type: Number },
  levels: { attribute: true },
  value: { attribute: true, type: Number },
  disabled: { attribute: "disabled", reflect: true, type: Boolean },
  _value: { state: true, type: Number },
  _animated: { state: true, type: Boolean }
};
_LcGauge.styles = styles$9;
let LcGauge = _LcGauge;
window.customElements.define("lc-gauge", LcGauge);
const styles$8 = css`:host {
  color: var(--button-icon-color, var(--disabled-text-color, #6f6f6f));
  --ha-icon-display: block;
  --mdc-icon-button-size: 40px;
  --mdc-icon-size: 24px;
  --mdc-theme-primary: var(--button-icon-color, var(--disabled-text-color, #6f6f6f));
  font-family: var(--paper-font-body1_-_font-family);
  -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
  font-size: var(--paper-font-body1_-_font-size);
  font-weight: var(--paper-font-body1_-_font-weight);
  line-height: var(--paper-font-body1_-_line-height);
  position: relative;
}
:host:before {
  content: " ";
  left: 0;
  right: 0;
  width: var(--mdc-icon-button-size);
  height: var(--mdc-icon-button-size);
  border-radius: 50%;
  background-color: currentcolor;
  opacity: 0.15;
  position: absolute;
}`;
const _LcCircleButton = class _LcCircleButton extends LitElement {
  constructor() {
    super(...arguments);
    this.loading = false;
    this.disabled = false;
  }
  render() {
    return html`
      <mwc-icon-button class="circle-button" .disabled=${this.disabled} .title=${this.title}>
        ${this.loading && !this.disabled ? html` <mwc-circular-progress indeterminate density=${-6}></mwc-circular-progress> ` : html` <ha-icon icon=${this.icon} class="icon"></ha-icon> `}
      </mwc-icon-button>
    `;
  }
};
_LcCircleButton.properties = {
  hass: { attribute: true },
  icon: { attribute: true, type: String },
  label: { attribute: true, type: String },
  loading: { attribute: "loading", reflect: true, type: Boolean },
  disabled: { attribute: "disabled", reflect: true, type: Boolean }
};
_LcCircleButton.styles = styles$8;
let LcCircleButton = _LcCircleButton;
window.customElements.define("lc-circle-button", LcCircleButton);
const styles$7 = css`:host {
  display: block;
}`;
let THERMOSTAT_PROMISE;
async function waitThermostat(hass) {
  if (!THERMOSTAT_PROMISE) {
    THERMOSTAT_PROMISE = window.loadCardHelpers().then((helpers) => {
      const entity = Object.keys(hass.entities).find((id) => id.startsWith("climate."));
      console.log(entity);
      helpers.createCardElement({ type: "thermostat", entity });
    });
  }
  return THERMOSTAT_PROMISE;
}
const _LcRoundSlider = class _LcRoundSlider extends LitElement {
  firstUpdated(changed) {
    super.firstUpdated(changed);
    waitThermostat(this.hass).catch(console.error);
  }
  willUpdate(changed) {
    super.willUpdate(changed);
  }
  render() {
    if (!this.hass) {
      return html``;
    }
    return html` <round-slider .value="${this.value}" .min="${this.min}" .max="${this.max}" .disabled="${this.disabled}"></round-slider> `;
  }
};
_LcRoundSlider.properties = {
  hass: { attribute: true },
  value: { attribute: true, type: Number },
  min: { attribute: true, type: Number },
  max: { attribute: true, type: Number },
  disabled: { attribute: "disabled", reflect: true, type: Boolean }
};
_LcRoundSlider.styles = styles$7;
let LcRoundSlider = _LcRoundSlider;
window.customElements.define("lc-round-slider", LcRoundSlider);
const styles$6 = css`:host {
  --slider-height: 100%;
  --slider-width: 26px;
  --slider-thumb-size: 20px;
  --slider-padding: calc((var(--slider-width) - var(--slider-thumb-size)) / 2);
  --slider-value: 0px;
  --slider-track-color: var(--disabled-color, #464646);
  --slider-track-color-active: var(--primary-color, #2196f3);
  --slider-track-color-disabled: var(--disabled-color, #464646);
  --slider-thumb-color: var(--primary-text-color, #FFFFFF);
}

.lc-vertical-slider {
  height: var(--slider-height);
  width: var(--slider-width);
  padding: var(--slider-padding);
  background-color: var(--slider-track-color);
  border-radius: 9999px;
  box-sizing: border-box;
  position: relative;
}
.lc-vertical-slider .thumb {
  top: var(--slider-value);
  width: var(--slider-thumb-size);
  height: var(--slider-thumb-size);
  border-radius: 50%;
  background-color: var(--slider-thumb-color);
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 2;
}
.lc-vertical-slider:after {
  content: " ";
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(var(--slider-height) - var(--slider-value));
  min-height: var(--slider-width);
  border-radius: 9999px;
  background-color: var(--slider-track-color-active);
  display: block;
  position: absolute;
  z-index: 1;
}
.lc-vertical-slider.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.lc-vertical-slider.disabled:after {
  display: none;
}`;
const _LcVerticalSlider = class _LcVerticalSlider extends LitElement {
  constructor() {
    super(...arguments);
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.disabled = false;
    this.debounce = 200;
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this._track) {
      this._track = document.createElement("div");
      this._track.classList.add("lc-vertical-slider");
      const thumb = document.createElement("div");
      thumb.classList.add("thumb");
      this._track.append(thumb);
      this.shadowRoot.append(this._track);
    }
    const callback = this._handleMousedown.bind(this);
    this._track.addEventListener("mousedown", callback);
    this._off = () => {
      var _a;
      if (this._track) {
        (_a = this._track) == null ? void 0 : _a.removeEventListener("mousedown", callback);
        this._off = void 0;
      }
    };
  }
  disconnectedCallback() {
    var _a;
    super.disconnectedCallback();
    (_a = this._off) == null ? void 0 : _a.call(this);
  }
  shouldUpdate(changed) {
    if (changed.has("value")) {
      this._applyValue(this.value);
    }
    if (changed.has("min") || changed.has("max")) {
      if (this.min >= this.max) {
        console.warn(`wrong MIN MAX values`);
        this.min = this.max;
        this.max = this.step;
      }
    }
    if (changed.has("disabled")) {
      if (this.disabled) {
        this._track.classList.add("disabled");
      } else {
        this._track.classList.remove("disabled");
      }
    }
    if (changed.has("debounce") && this.debounce < 0) {
      throw new Error("Debounce should positive");
    }
    return false;
  }
  _applyValue(value) {
    const percent = value / (this.max - this.min);
    const height = this._track.offsetHeight;
    const thumb = this._track.firstChild;
    const padding = (this._track.offsetWidth - thumb.offsetWidth) / 2;
    const max = height - padding * 2 - thumb.offsetHeight;
    let offset = max - max * percent;
    offset = offset < 0 ? 0 : offset;
    offset = offset > max ? max : offset;
    offset = Math.round(offset * 1e3) / 1e3;
    this._track.style.setProperty("--slider-value", `${offset}px`);
  }
  _handleMousedown(event) {
    if (this.disabled) {
      return;
    }
    const thumb = this._track.firstChild;
    const offset = event.target === this._track ? event.offsetY : thumb.offsetTop + event.offsetY;
    const startY = event.clientY;
    this._updateThumb(offset);
    const handleMousemove = (_event) => {
      const move = offset + (_event.clientY - startY);
      this._updateThumb(move);
    };
    const handleMouseup = (_event) => {
      window.document.removeEventListener("mouseup", handleMouseup);
      window.document.removeEventListener("mousemove", handleMousemove);
      setTimeout(() => {
        const move = offset + (_event.clientY - startY);
        this._updateThumb(move, false);
      }, 1);
    };
    window.document.addEventListener("mouseup", handleMouseup);
    window.document.addEventListener("mousemove", handleMousemove);
  }
  _emitChange(value) {
    const shadowRoot = this._track.parentNode;
    if (!shadowRoot || !shadowRoot.host || this.disabled || value === this._previous) {
      return;
    }
    this._previous = value;
    const brought = (this.max - this.min) * value;
    const claimed = brought - brought % this.step;
    const options = {
      detail: { value: claimed },
      bubbles: true,
      composed: true
    };
    shadowRoot.host.dispatchEvent(new CustomEvent("change", options));
  }
  _updateThumb(offset, shouldDebounced = true) {
    const height = this._track.offsetHeight;
    const thumb = this._track.firstChild;
    const padding = (this._track.offsetWidth - thumb.offsetWidth) / 2;
    const min = 0;
    const max = height - padding * 2 - thumb.offsetHeight;
    let top = offset - padding - thumb.offsetHeight / 2;
    top = top < min ? min : top;
    top = top > max ? max : top;
    top = Math.round(top * 1e3) / 1e3;
    this._track.style.setProperty("--slider-value", `${top}px`);
    this._debouncedCall(1 - top / max, shouldDebounced);
  }
  _debouncedCall(value, shouldDebounced = true) {
    this._debounced = value;
    if (shouldDebounced) {
      if (this._debounceTimer == null) {
        this._debounceTimer = setTimeout(() => {
          delete this._debounceTimer;
          this._emitChange(this._debounced);
        }, this.debounce);
      }
    } else {
      if (this._debounceTimer != null) {
        clearTimeout(this._debounceTimer);
        delete this._debounceTimer;
      }
      this._emitChange(this._debounced);
    }
  }
};
_LcVerticalSlider.properties = {
  value: { attribute: true, type: Number },
  min: { attribute: true, type: Number },
  max: { attribute: true, type: Number },
  step: { attribute: true, type: Number },
  debounce: { attribute: true, type: Number },
  disabled: { attribute: "disabled", reflect: true, type: Boolean }
};
_LcVerticalSlider.styles = styles$6;
let LcVerticalSlider = _LcVerticalSlider;
window.customElements.define("lc-vertical-slider", LcVerticalSlider);
const styles$5 = css`:host {
  --lc-switch-color: var(--blue-color);
  --lc-switch-aspect-ratio: 1.8333333;
  --lc-switch-thumb-size: 20px;
  --lc-switch-thumb-margin: 2px;
  /* Computed size54s */
  --lc-switch-height: calc(var(--lc-switch-thumb-size) + (var(--lc-switch-thumb-margin) * 2));
  --lc-switch-width: calc(var(--lc-switch-height) * var(--lc-switch-aspect-ratio));
  /* Colors */
  --lc-switch-bg-color: color-mix(in lch, var(--secondary-background-color), var(--secondary-text-color) 20%);
  --lc-switch-border-color: var(--lc-switch-bg-color);
  --lc-switch-thumb-color: color-mix(in lch, rgb(255 255 255 / 1), var(--secondary-background-color) 12%);
  --lc-switch-thumb-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.15), 0 1px 2px -1px rgb(0 0 0 / 0.15);
  /* Colors state */
  --lc-switch-bg-active-color: var(--lc-switch-color);
  --lc-switch-thumb-active-color: rgb(255 255 255 / 1);
  display: block;
}

.lc-switch {
  height: var(--lc-switch-height);
  width: var(--lc-switch-width);
  aspect-ratio: var(--lc-switch-aspect-ratio);
  background-color: var(--lc-switch-bg-color);
  border-radius: 999999px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition-duration: 0.15s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.lc-switch .lc-switch-thumb {
  top: var(--lc-switch-thumb-margin);
  left: var(--lc-switch-thumb-margin);
  width: var(--lc-switch-thumb-size);
  height: var(--lc-switch-thumb-size);
  aspect-ratio: 1/1;
  border-radius: 50%;
  background-color: var(--lc-switch-thumb-color);
  transition-duration: 0.15s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--lc-switch-thumb-shadow);
  display: block;
  position: absolute;
  z-index: 2;
}
.lc-switch.active {
  --lc-switch-border-color: var(--lc-switch-bg-active-color);
  --lc-switch-bg-color: var(--lc-switch-bg-active-color);
}
.lc-switch.active .lc-switch-thumb {
  left: calc(var(--lc-switch-width) - var(--lc-switch-thumb-size) - var(--lc-switch-thumb-margin));
  --lc-switch-thumb-color: var(--lc-switch-thumb-active-color);
}`;
const _LcSwitch = class _LcSwitch extends LitElement {
  constructor() {
    super(...arguments);
    this.checked = false;
    this.disabled = false;
  }
  render() {
    const className = this.checked ? "lc-switch active" : "lc-switch";
    return html`
      <div class="${className}" @click="${this._handleClick}">
        <div class="lc-switch-thumb"/>
      </div>
    `;
  }
  _handleClick() {
    this.checked = !this.checked;
    const options = {
      detail: {
        checked: this.checked
      },
      bubbles: true,
      composed: true
    };
    this.dispatchEvent(new CustomEvent("change", options));
  }
};
_LcSwitch.properties = {
  hass: { attribute: true },
  checked: { attribute: "checked", reflect: true, type: Boolean },
  disabled: { attribute: "disabled", reflect: true, type: Boolean }
};
_LcSwitch.styles = styles$5;
let LcSwitch = _LcSwitch;
window.customElements.define("lc-switch", LcSwitch);
const styles$4 = css`:host {
  font-family: var(--paper-font-body1_-_font-family);
  -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
  font-size: var(--paper-font-body1_-_font-size);
  font-weight: var(--paper-font-body1_-_font-weight);
  line-height: var(--paper-font-body1_-_line-height);
  color: var(--primary-text-color);
}

.area-card {
  position: relative;
  overflow: hidden;
}
.area-card .card-header {
  padding: 12px 16px 16px;
}
.area-card .card-header .name {
  margin-bottom: 4px;
  color: inherit;
  font-family: inherit;
  font-size: var(--ha-card-header-font-size, 24px);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.area-card .card-header .climate {
  margin: 0 -8px;
  display: flex;
}
.area-card .card-content {
  min-height: 200px;
  display: grid;
  grid-auto-columns: 1fr;
  grid-template-rows: 1fr 1fr;
}
.area-card .card-content .item {
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
}`;
const common$1 = {
  version: "Version",
  cpu: "CPU",
  ram: "RAM",
  yes: "Yes",
  cancel: "Cancel",
  are_you_sure: "Are you sure?"
};
const area$1 = {
  name: "Area Card",
  description: "Custom area card. Displays supported entities.",
  config: {
    name: {
      label: "Card or area name",
      helper: "Name of the card or the area"
    },
    area: {
      label: "Area",
      helper: "Select the zone to be displayed"
    }
  }
};
const mariadb$1 = {
  name: "MariaDB Card",
  description: "Shows the status of the database. It also allows you to stop/start, restart and start cleaning.",
  db_size: "DB Size",
  purge: {
    tooltip: "Clean up the database",
    dialog: "The database cleanup process will be started."
  },
  reload: {
    tooltip: "Restart the database server",
    dialog: "The database server will be restarted."
  },
  stop: {
    tooltip: "Stopping the DB server",
    dialog: "The database server will be stopped."
  },
  start: {
    tooltip: "Start the database server",
    dialog: "The database server will be started."
  },
  error_db_stopped: "The database server now is stopped."
};
const en = {
  common: common$1,
  area: area$1,
  mariadb: mariadb$1
};
const en$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  area: area$1,
  common: common$1,
  default: en,
  mariadb: mariadb$1
}, Symbol.toStringTag, { value: "Module" }));
const common = {
  version: "Версия:",
  cpu: "CPU",
  ram: "RAM",
  yes: "Да",
  cancel: "Отмена",
  are_you_sure: "Вы уверены?"
};
const area = {
  name: "Пространство",
  description: "Пользовательская карточка пространства. Отображает поддерживаемые сущности.",
  config: {
    name: {
      label: "Card or area name",
      helper: "Name of the card or the area"
    },
    area: {
      label: "Area",
      helper: "Select the zone to be displayed"
    }
  }
};
const mariadb = {
  name: "Карточка MariaDB",
  description: "Показывает состояние базы данных. Так же позволяет останавливать/запускать, перезапускать и запускать очистку.",
  db_size: "Занимаемое место на диске",
  purge: {
    tooltip: "Запуск отчистки БД",
    dialog: "Будет запущен процесс очистки БД."
  },
  reload: {
    tooltip: "Перезапуск сервера БД",
    dialog: "Сервер баз данных будет перезапущен."
  },
  stop: {
    tooltip: "Остановка сервера БД",
    dialog: "Сервер баз данных будет остановлен."
  },
  start: {
    tooltip: "Запустить сервер БД",
    dialog: "Сервер баз данных будет запущен."
  },
  error_db_stopped: "Сервер баз данных сейчас остановлен."
};
const ru = {
  common,
  area,
  mariadb
};
const ru$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  area,
  common,
  default: ru,
  mariadb
}, Symbol.toStringTag, { value: "Module" }));
const translations = {
  en: en$1,
  ru: ru$1
};
function translateString(string, translatedStrings) {
  if (typeof translatedStrings === "string") {
    return translatedStrings;
  }
  const splitted = string.split(".");
  const [key, ...otherKeys] = splitted;
  const translated = translatedStrings[key];
  if (!translated || typeof translated === "string") {
    return translated;
  }
  return translateString(otherKeys && otherKeys.length > 0 ? otherKeys.join(".") : "", translated);
}
function language() {
  var _a;
  let lang = (_a = localStorage.getItem("selectedLanguage")) == null ? void 0 : _a.replace(/['"]+/g, "").replace("-", "_");
  if (lang === "null") {
    lang = void 0;
  }
  if (!lang) {
    lang = localStorage.getItem("i18nextLng");
  }
  if (!lang || lang === "null") {
    lang = "en";
  }
  return lang;
}
function t(string, search = "", replace = "") {
  const lang = language();
  let translatedStrings;
  try {
    translatedStrings = { ...translations[lang] };
  } catch (e) {
    translatedStrings = { ...translations["en"] };
  }
  let translated = translateString(string, translatedStrings);
  if (translated === void 0) {
    translated = translateString(string, { ...translations["en"] });
  }
  if (translated && search !== "" && replace !== "") {
    translated = translated.replace(`{${search}}`, replace);
  }
  return translated ?? "";
}
const styles$3 = css`:host {
  --mdc-icon-size: 20px;
  margin: 0 4px;
  font-size: 14px;
  line-height: 1;
  color: var(--secondary-text-color);
  cursor: pointer;
  display: block;
}
:host .icon {
  top: -2px;
  position: relative;
}`;
const _AreaCardSensor = class _AreaCardSensor extends LitElement {
  willUpdate(changed) {
    super.willUpdate(changed);
    if (changed.has("entity") || changed.has("hass")) {
      if (this.hass && this.entity && this.entity in this.hass.states) {
        const state = this.hass.states[this.entity];
        this._icon = state.attributes.icon || this._getDefaultIcon(state.attributes.device_class);
        this._value = formatNumberValue(this.hass, state.state);
        this._unit = state.attributes.unit_of_measurement;
      } else {
        this._icon = void 0;
        this._value = void 0;
        this._unit = void 0;
      }
    }
  }
  render() {
    if (!this._icon || !this._value) {
      return html``;
    }
    return html`
      <ha-icon .icon="${this._icon}" class="icon"></ha-icon>
      <span>${this._value}${this._value && this._unit ? " " + this._unit : ""}</span>
    `;
  }
  _getDefaultIcon(deviceClass) {
    switch (deviceClass) {
      case "temperature":
        return "mdi:thermometer";
      case "humidity":
        return "mdi:water-percent";
      case "pressure":
        return "mdi:gauge";
      default:
        return void 0;
    }
  }
};
_AreaCardSensor.properties = {
  hass: { attribute: true },
  entity: { attribute: true, type: String },
  _icon: { state: true },
  _value: { state: true },
  _unit: { state: true }
};
_AreaCardSensor.styles = styles$3;
let AreaCardSensor = _AreaCardSensor;
window.customElements.define("lc-area-card-sensor", AreaCardSensor);
const styles$2 = css`.area-card-light {
  width: 100%;
  display: flex;
  position: relative;
}
.area-card-light .slider-block {
  height: 160px;
  margin-right: 12px;
  display: flex;
  align-items: flex-end;
}
.area-card-light .slider-block .icon {
  --mdc-icon-size: 20px;
}`;
var HassLightColorMode = /* @__PURE__ */ ((HassLightColorMode2) => {
  HassLightColorMode2["UNKNOWN"] = "unknown";
  HassLightColorMode2["ONOFF"] = "onoff";
  HassLightColorMode2["BRIGHTNESS"] = "brightness";
  HassLightColorMode2["COLOR_TEMP"] = "color_temp";
  HassLightColorMode2["HS"] = "hs";
  HassLightColorMode2["XY"] = "xy";
  HassLightColorMode2["RGB"] = "rgb";
  HassLightColorMode2["RGBW"] = "rgbw";
  HassLightColorMode2["RGBWW"] = "rgbww";
  HassLightColorMode2["WHITE"] = "white";
  return HassLightColorMode2;
})(HassLightColorMode || {});
const COLOR_SUPPORTING = [HassLightColorMode.HS, HassLightColorMode.XY, HassLightColorMode.RGB, HassLightColorMode.RGBW, HassLightColorMode.RGBWW];
const BRIGHTNESS_SUPPORTING = [...COLOR_SUPPORTING, HassLightColorMode.COLOR_TEMP, HassLightColorMode.BRIGHTNESS, HassLightColorMode.WHITE];
const _AreaCardLight = class _AreaCardLight extends LitElement {
  willUpdate(changed) {
    var _a;
    super.willUpdate(changed);
    if (changed.has("entity") || changed.has("hass")) {
      const state = this._getLightState();
      if (state) {
        if (this._state !== state.state) {
          this._state = state.state;
        }
        if ((_a = state.attributes.supported_color_modes) == null ? void 0 : _a.some((mode) => BRIGHTNESS_SUPPORTING.includes(mode))) {
          if (!this._brightnessBound) {
            this._brightnessBound = [0, 255];
          }
          if (this._brightness !== state.attributes.brightness) {
            this._brightness = state.attributes.brightness;
          }
        }
      } else {
        this._state = void 0;
        this._brightness = void 0;
        this._brightnessBound = void 0;
      }
    }
  }
  render() {
    const state = this._getLightState();
    if (!state) {
      return html``;
    }
    const isOn = this._state === "on" && (!this._brightnessBound || !!this._brightness);
    return html`
      <div class="area-card-light">
        ${this._brightnessBound ? html`
              <div class="slider-block">
                <lc-vertical-slider
                  class="slider brightness"
                  .value="${this._brightness}"
                  .min="${this._brightnessBound[0]}"
                  .max="${this._brightnessBound[1]}"
                  @change="${this._brightnessChange}"
                ></lc-vertical-slider>
                <ha-icon
                  class="icon"
                  .icon=${isOn ? "mdi:lightbulb" : "mdi:lightbulb-off"}
                  .style="${isOn ? `filter: brightness(${(this._brightness + 245) / 5}%);` : "color: var(--secondary-text-color)"}"
                ></ha-icon>
              </div>
            ` : null}
      </div>
    `;
  }
  /**
   * Returns entity light state.
   * @private
   */
  _getLightState() {
    const states = {
      ...this.hass.states
      /*, 'light.room_light': ENTITY_LIGHT_STATE*/
    };
    return this.hass && this.entity && this.entity in states ? states[this.entity] : void 0;
  }
  /**
   * Change brightness handler
   * @param event
   * @private
   */
  _brightnessChange(event) {
    const brightness = event.detail.value;
    this.hass.callService("light", "turn_on", { brightness }, { entity_id: this.entity }).catch(console.error);
  }
  /**
   * Light toggle
   * @private
   */
  _onoffChange() {
    const service = this._state ? "turn_off" : "turn_on";
    this.hass.callService("light", service, {}, { entity_id: this.entity }).catch(console.error);
  }
};
_AreaCardLight.properties = {
  hass: { attribute: true },
  entity: { attribute: true, type: String },
  _state: { state: true },
  _brightness: { state: true, type: Number },
  _brightnessBound: { state: true },
  _rgbColor: { state: true, type: String }
};
_AreaCardLight.styles = styles$2;
let AreaCardLight = _AreaCardLight;
window.customElements.define("lc-area-card-light", AreaCardLight);
const styles$1 = css``;
const _AreaCardConditioner = class _AreaCardConditioner extends LitElement {
  willUpdate(changed) {
    super.willUpdate(changed);
  }
  render() {
    return html``;
  }
};
_AreaCardConditioner.properties = {
  hass: { attribute: true },
  entity: { attribute: true, type: String }
};
_AreaCardConditioner.styles = styles$1;
let AreaCardConditioner = _AreaCardConditioner;
window.customElements.define("lc-area-card-conditioner", AreaCardConditioner);
function fireEvent(node, type, detail, options) {
  options = options || {};
  detail = detail === null || detail === void 0 ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === void 0 ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === void 0 ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
}
const _AreaCard = class _AreaCard extends LitElement {
  constructor() {
    super(...arguments);
    this.test = 0;
    this._headerEntities = [];
    this._remoteEntities = [];
    this.value1 = 32;
    this.value2 = 0;
  }
  static async getConfigElement() {
    await import("./area-config.js");
    return document.createElement("lc-area-config");
  }
  static async getStubConfig(hass) {
    const area2 = Object.values(hass.areas)[0];
    return {
      type: "custom:lc-area-card",
      name: "",
      area: (area2 == null ? void 0 : area2.area_id) ?? ""
    };
  }
  setConfig(config) {
    this._config = config;
  }
  getCardSize() {
    return 3;
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    if (changed.has("_config")) {
      this._updateEntities();
    }
  }
  render() {
    var _a;
    if (!this.hass || !this._config.area) {
      return html``;
    }
    const areaName = this._config.name || ((_a = this.hass.areas[this._config.area]) == null ? void 0 : _a.name);
    return html`
      <ha-card class="area-card">
        <div class="card-header">
          <div class="name">${areaName}</div>
          <div class="climate">
            ${this._headerEntities.map((entity) => {
      return entity ? html` <lc-area-card-sensor .hass="${this.hass}" .entity="${entity}" @click="${() => this._showMoreInfo(entity)}"></lc-area-card-sensor>` : void 0;
    })}
          </div>
        </div>
        <div class="card-content">
          <div>
             <lc-vertical-slider
                class="slider brightness"
                .value="${this.value1}"
                .min="${0}"
                .max="${255}"
                @change="${(event) => {
      var _a2;
      return this.value1 = (_a2 = event.detail) == null ? void 0 : _a2.value;
    }}"
              />
          </div>
        </div>
        <div class="card-footer">
            
        </div>
      </ha-card>
    `;
  }
  _onChange(event) {
    var _a, _b;
    console.log("value", (_a = event.detail) == null ? void 0 : _a.value);
    this.test = (_b = event.detail) == null ? void 0 : _b.value;
  }
  /**
   * The update entities should be called after config change
   * @private
   */
  _updateEntities() {
    if (!this._config.area) {
      this._headerEntities = [];
      return;
    }
    const areaDevices = Object.keys(this.hass.devices).filter((id) => this.hass.devices[id].area_id === this._config.area);
    this._headerEntities = new Array(_AreaCard.headerEntitiesDeviceClasses.length);
    this._headerEntities.fill(void 0);
    this._remoteEntities = new Array(1);
    this._remoteEntities.fill(void 0);
    const entities = {
      ...this.hass.entities
      /*, 'light.room_light': ENTITY_LIGHT*/
    };
    const states = {
      ...this.hass.states
      /*, 'light.room_light': ENTITY_LIGHT_STATE*/
    };
    for (const entityId in entities) {
      const entity = entities[entityId];
      if (entity.area_id && entity.area_id === this._config.area || entity.device_id && areaDevices.includes(entity.device_id)) {
        const state = states[entity.entity_id];
        if (entity.entity_id.startsWith("sensor.") && state.attributes.device_class && _AreaCard.headerEntitiesDeviceClasses.includes(state.attributes.device_class)) {
          const index = _AreaCard.headerEntitiesDeviceClasses.indexOf(state.attributes.device_class);
          this._headerEntities[index] = entity.entity_id;
          continue;
        }
        if (entity.entity_id.startsWith("light.")) {
          this._remoteEntities[
            0
            /* LIGHT */
          ] = entity.entity_id;
        }
        if (entity.entity_id.startsWith("climate.")) {
          this._remoteEntities[
            1
            /* CONDITIONER */
          ] = entity.entity_id;
        }
      }
    }
  }
  /**
   * Open the more info dialog for entity id
   * @param entityId
   * @private
   */
  _showMoreInfo(entityId) {
    fireEvent(this, "hass-more-info", { entityId });
  }
};
_AreaCard.headerEntitiesDeviceClasses = [
  "temperature",
  "humidity"
  /*, 'pressure'*/
];
_AreaCard.styles = styles$4;
_AreaCard.properties = {
  hass: { attribute: false },
  _config: { state: true },
  _climaticSensors: { state: true },
  test: { attribute: true }
};
let AreaCard = _AreaCard;
window.customElements.define("lc-area-card", AreaCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "lc-area-card",
  name: t("area.name"),
  preview: false,
  description: t("area.description")
});
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
async function subscribeToAddonStateChange(callback) {
  const { conn } = await hassConnection;
  return await conn.subscribeMessage(
    (event) => {
      if (event.event === "addon" && event.slug === MariadbCard.dbAddonSlug) {
        callback(event.state);
      }
    },
    { type: "supervisor/subscribe" }
  );
}
const _MariadbCard = class _MariadbCard extends LitElement {
  constructor() {
    super(...arguments);
    this._ramLimit = 400;
    this._isWorks = false;
    this._isConnected = false;
  }
  setConfig(config = {}) {
    this.config = config;
  }
  getCardSize() {
    return 3;
  }
  firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this._refreshInfo();
  }
  willUpdate(changedProps) {
    var _a;
    super.willUpdate(changedProps);
    if (!this.hass) {
      return;
    }
    if (changedProps.has("hass") && ((_a = this.hass.themes) == null ? void 0 : _a.darkMode) !== this._isDark) {
      this._isDark = this.hass.themes.darkMode;
    }
  }
  async connectedCallback() {
    await super.connectedCallback();
    this._isConnected = true;
    this._addonStateUnsubscribe = await subscribeToAddonStateChange(
      (state) => this._isWorks = state === "started"
      /* STARTED */
    ).catch((error) => {
      console.error(error);
      return void 0;
    });
    this._startRefreshStats();
  }
  async disconnectedCallback() {
    var _a;
    await super.disconnectedCallback();
    this._isConnected = false;
    (_a = this._addonStateUnsubscribe) == null ? void 0 : _a.call(this);
    this._stopRefreshStats();
  }
  render() {
    if (!this.hass) {
      return html``;
    }
    const logoUrl = `/lovelace-cards/mariadb-logo-${this._isDark ? "white" : "dark"}.svg`;
    const isInitialized = this._cpuPercent !== void 0 && this._ramPercent !== void 0 && this._ramUsage !== void 0 && this._ramLimit !== void 0;
    const dbSize = this._bdSize();
    return html`
      <ha-card class="mariadb-card">
        <div class="card-header">
          <img .src="${logoUrl}" class="logo" alt="MariaDB" />
          <div class="info">
            <div class="name">${this._name}</div>
            ${this._version ? html` <div class="version">${t("common.version")}&nbsp;${this._version}</div>` : null}
          </div>
        </div>
        <div class="card-content">
          <div class="gauge-wrap" @click="${() => this._showMoreInfo(_MariadbCard.cpuPercentSensor)}">
            <lc-gauge
              .hass="${this.hass}"
              .label="${"CPU"}"
              .unit="${"%"}"
              .min="${0}"
              .max="${10}"
              .levels="${[
      { level: 0, stroke: "var(--success-color)" },
      { level: 2, stroke: "var(--warning-color)" },
      { level: 7, stroke: "var(--error-color)" }
    ]}"
              .value="${this._cpuPercent}"
              .disabled="${!this._isWorks || !isInitialized}"
            ></lc-gauge>
          </div>

          <div class="gauge-wrap" @click="${() => this._showMoreInfo(_MariadbCard.ramPercentSensor)}">
            <lc-gauge
              .hass="${this.hass}"
              .label="${"RAM"}"
              .unit="${"%"}"
              .min="${0}"
              .max="${100}"
              .levels="${[{ level: 0, stroke: "var(--info-color)" }]}"
              .value="${this._ramPercent}"
              .loading="${false}"
              .disabled="${!this._isWorks || !isInitialized}"
            ></lc-gauge>
          </div>

          <div class="gauge-wrap" @click="${() => this._showMoreInfo(_MariadbCard.ramPercentSensor)}">
            <lc-gauge
              .hass="${this.hass}"
              .label="${"RAM"}"
              .unit="${"Mb"}"
              .min="${0}"
              .max="${this._ramLimit}"
              .levels="${[{ level: 0, stroke: "var(--warning-color)" }]}"
              .value="${this._ramUsage}"
              .loading="${false}"
              .disabled="${!this._isWorks || !isInitialized}"
            ></lc-gauge>
          </div>
        </div>
        <div class="card-footer">
          <div class="database-size">
            ${dbSize ? html`
                  <div class="icon" data-tooltip-pos="top" aria-label="${t("mariadb.db_size")}" @click="${() => this._showMoreInfo(_MariadbCard.dbSizeSensor)}">
                    <img src="/lovelace-cards/database-size.svg" alt="DB Size Icon" />
                  </div>
                  <div class="value" @click="${() => this._showMoreInfo(_MariadbCard.dbSizeSensor)}">${this._bdSize()}</div>
                ` : null}
          </div>
          <div class="actions">
            ${this._isWorks ? html`
                  <div class="btn-wrap purge" data-tooltip-pos="left" aria-label="${t("mariadb.purge.tooltip")}">
                    <lc-circle-button icon="mdi:database-cog" @click="${this._progress ? void 0 : this._purge}" .loading="${this._progress === "purge"}"></lc-circle-button>
                  </div>
                  <div class="btn-wrap reload" data-tooltip-pos="left" aria-label="${t("mariadb.reload.tooltip")}">
                    <lc-circle-button icon="mdi:restart" @click="${this._progress ? void 0 : this._reload}" .loading="${this._progress === "reload"}"></lc-circle-button>
                  </div>
                  <div class="btn-wrap stop" data-tooltip-pos="left" aria-label="${t("mariadb.stop.tooltip")}">
                    <lc-circle-button icon="mdi:stop" @click="${this._progress ? void 0 : this._stop}" .loading="${this._progress === "stop"}"></lc-circle-button>
                  </div>
                ` : html`
                  <div class="btn-wrap start" data-tooltip-pos="left" aria-label="${t("mariadb.start.tooltip")}">
                    <lc-circle-button icon="mdi:play" @click="${this._progress ? void 0 : this._start}" .loading="${this._progress === "start"}"></lc-circle-button>
                  </div>
                `}
          </div>
        </div>
      </ha-card>

      ${this._dialog ? html`
            <ha-dialog .open="${true}" @closed="${this._cancel}" heading="${this._dialog.title}" class="dialog">
              <div>
                <p class="">${this._dialog.message}</p>
              </div>
              <mwc-button slot="secondaryAction" @click="${this._cancel}">CANCEL</mwc-button>
              <mwc-button slot="primaryAction" @click="${this._confirm}">OK</mwc-button>
            </ha-dialog>
          ` : null}
    `;
  }
  /**
   * Returns formatted DB size
   * @private
   */
  _bdSize() {
    if (_MariadbCard.dbSizeSensor in this.hass.states) {
      const size = formatNumberValue(this.hass, this.hass.states[_MariadbCard.dbSizeSensor].state);
      if (size) {
        return `${size} MB`;
      }
    }
    return void 0;
  }
  _confirm() {
    if (!this._dialog) {
      return;
    }
    this._progress = this._dialog.action;
    this._dialog = void 0;
    switch (this._progress) {
      case "purge":
        this._callService("recorder", "purge", { keep_days: 10, apply_filter: true, repack: true });
        break;
      case "start":
        this._callSupervisorWs("start");
        break;
      case "stop":
        this._callSupervisorWs("stop");
        break;
      case "reload":
        this._callSupervisorWs("restart");
        break;
    }
  }
  _callService(domain, service, serviceData = {}) {
    this.hass.callService(domain, service, serviceData).then(() => {
      this._progress = void 0;
    }).catch((err) => {
      this._progress = void 0;
      console.error(err);
    });
  }
  _callSupervisorWs(endpoint) {
    const payload = {
      endpoint: `/addons/${_MariadbCard.dbAddonSlug}/${endpoint}`,
      method: "post",
      timeout: null,
      type: "supervisor/api"
    };
    return this.hass.callWS(payload).then((result) => {
      this._progress = void 0;
      return result;
    }).catch((err) => {
      this._progress = void 0;
      console.error(err);
      return void 0;
    });
  }
  _cancel() {
    this._dialog = void 0;
  }
  _purge() {
    this._dialog = {
      title: t("common.are_you_sure"),
      message: t("mariadb.purge.dialog"),
      action: "purge"
      /* PURGE */
    };
  }
  _reload() {
    this._dialog = {
      title: t("common.are_you_sure"),
      message: t("mariadb.reload.dialog"),
      action: "reload"
      /* RELOAD */
    };
  }
  _stop() {
    this._dialog = {
      title: t("common.are_you_sure"),
      message: t("mariadb.stop.dialog"),
      action: "stop"
      /* STOP */
    };
  }
  _start() {
    this._dialog = {
      title: t("common.are_you_sure"),
      message: t("mariadb.start.dialog"),
      action: "start"
      /* START */
    };
  }
  _showMoreInfo(entityId) {
    fireEvent(this, "hass-more-info", { entityId });
  }
  _startRefreshStats() {
    this._stopRefreshStats();
    this._refreshStats();
  }
  _stopRefreshStats() {
    if (this._nextRefreshTimeout === void 0) {
      return;
    }
    clearTimeout(this._nextRefreshTimeout);
    this._nextRefreshTimeout = void 0;
  }
  _refreshStats() {
    const payload = {
      endpoint: `/addons/core_mariadb/stats`,
      method: "get",
      type: "supervisor/api"
    };
    this.hass.callWS(payload).then((stats) => {
      const oneMb = 1024 ** 2;
      this._cpuPercent = stats.cpu_percent;
      this._ramPercent = stats.memory_percent;
      this._ramUsage = Math.round(stats.memory_usage / oneMb * 10) / 10;
      this._ramLimit = Math.round(stats.memory_limit / oneMb * 10) / 10;
      if (this._isConnected) {
        this._nextRefreshTimeout = setTimeout(() => this._refreshStats(), _MariadbCard.updateStatsInterval);
      }
    }).catch((error) => {
      if (error.message && (error.message.includes("not running") || error.message.includes("Can't read stats"))) {
        return;
      }
      console.error(error);
    });
  }
  _refreshInfo() {
    const payload = {
      endpoint: `/addons/${_MariadbCard.dbAddonSlug}/info`,
      method: "get",
      type: "supervisor/api"
    };
    this.hass.callWS(payload).then((addonInfo) => {
      this._name = addonInfo.name;
      this._version = addonInfo.version;
      this._isWorks = addonInfo.state === "started";
    }).catch(console.error);
  }
};
_MariadbCard.styles = styles;
_MariadbCard.properties = {
  hass: { attribute: false },
  config: { attribute: false },
  _name: { state: true, type: String },
  _version: { state: true, type: String },
  _cpuPercent: { state: true, type: Number },
  _ramPercent: { state: true, type: Number },
  _ramUsage: { state: true, type: Number },
  _ramLimit: { state: true, type: Number },
  _isDark: { state: true, type: Boolean },
  _isWorks: { state: true, type: Boolean },
  _progress: { state: true, type: String },
  _dialog: { state: true }
};
_MariadbCard.dbSizeSensor = "sensor.mariadb_database_size";
_MariadbCard.ramPercentSensor = "sensor.mariadb_memory_percent";
_MariadbCard.cpuPercentSensor = "sensor.mariadb_cpu_percent";
_MariadbCard.dbAddonSlug = "core_mariadb";
_MariadbCard.updateStatsInterval = 2e3;
let MariadbCard = _MariadbCard;
customElements.define("lc-mariadb-card", MariadbCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "lc-mariadb-card",
  name: t("mariadb.name"),
  description: t("mariadb.description"),
  preview: true,
  configurable: false
});
export {
  AreaCard as A,
  LitElement as L,
  LcGauge as a,
  LcCircleButton as b,
  css as c,
  LcRoundSlider as d,
  LcVerticalSlider as e,
  fireEvent as f,
  LcSwitch as g,
  html as h,
  t
};
