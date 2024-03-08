const LitElement = Object.getPrototypeOf(customElements.get('home-assistant-main'));
const { html, css } = LitElement.prototype;

var styles$7 = css`:host{display:block}.lc-gauge{filter:none;position:relative}.lc-gauge .gauge{position:relative;z-index:1}.lc-gauge .gauge.animated{animation-duration:.8s;animation-name:flicker;animation-timing-function:linear}.lc-gauge .value{left:0;position:absolute;right:0;text-align:center;transform:translateY(-100%);z-index:2}.lc-gauge .label{font-size:16px;margin-top:10px;position:relative;text-align:center;width:100%;z-index:3}.lc-gauge.disabled .gauge{filter:grayscale(1) brightness(.6)}@keyframes flicker{0%,19.999%,22%,62.999%,64%,64.999%,70%,to{filter:grayscale(1) brightness(.6)}20%,21.999%,63%,63.999%,65%,69.999%{filter:none}}`;

async function waitElement(element, selector, inShadowRoot = false) {
    return new Promise(async (resolve, reject) => {
        if (!element) {
            return reject(new Error('Target element not provided'));
        }
        let target;
        if (inShadowRoot) {
            target = await waitShadowRoot(element);
        }
        else {
            target = element;
        }
        return resolve(target.querySelector(selector));
    });
}
async function waitShadowRoot(element) {
    if (element.shadowRoot) {
        return element.shadowRoot;
    }
    return new Promise(resolve => {
        const attachShadow = element.attachShadow;
        element.attachShadow = (init) => {
            setTimeout(() => resolve(element.shadowRoot));
            return attachShadow.call(element, init);
        };
    });
}

function formatNumberValue(hass, value) {
    const numValue = Number(value);
    if (isNaN(numValue)) {
        return undefined;
    }
    return numValue.toLocaleString(numberFormatToLocale(hass));
}
function numberFormatToLocale(hass) {
    switch (hass.locale.number_format) {
        case 'comma_decimal':
            return ['en-US', 'en']; // Use United States with fallback to English formatting 1,234,567.89
        case 'decimal_comma':
            return ['de', 'es', 'it']; // Use German with fallback to Spanish then Italian formatting 1.234.567,89
        case 'space_comma':
            return ['fr', 'sv', 'cs']; // Use French with fallback to Swedish and Czech formatting 1 234 567,89
        case 'system':
            return undefined;
        default:
            return hass.locale.language;
    }
}

let GAUGE_PROMISE;
async function waitGauge(hass) {
    if (!GAUGE_PROMISE) {
        GAUGE_PROMISE = window.loadCardHelpers().then(helpers => {
            const entity = Object.keys(hass.entities).find(id => id.startsWith('sensor.') && !isNaN(Number(hass.states[id].state)));
            helpers.createCardElement({ type: 'gauge', entity });
        });
    }
    return GAUGE_PROMISE;
}
class LcGauge extends LitElement {
    constructor() {
        super(...arguments);
        /**
         * Gauge label (bottom)
         */
        this.label = '';
        /**
         * Unit of measurement
         */
        this.unit = '';
        /**
         * Min value scale
         */
        this.min = 0;
        /**
         * Max value scale
         */
        this.max = 100;
        /**
         * Disable gauge
         */
        this.disabled = false;
        /**
         * Inner value
         * @private
         */
        this._value = 0;
        /**
         * Previous disabled state
         * @private
         */
        this._disabled = false;
        /**
         * Enable animation is running
         * @private
         */
        this._animated = false;
    }
    firstUpdated(changed) {
        super.firstUpdated(changed);
        waitGauge(this.hass).catch(console.error);
        waitElement(this, 'ha-gauge', true)
            .then(element => waitElement(element, 'svg.text', true))
            .then(element => {
            if (element) {
                element.style.visibility = 'hidden';
            }
        })
            .catch(console.error);
    }
    willUpdate(changed) {
        var _a;
        super.willUpdate(changed);
        if (changed.has('disabled')) {
            if (this.disabled) {
                this._animated = false;
                if (this._animationTimeout) {
                    clearTimeout(this._animationTimeout);
                }
            }
            else if (this._disabled !== this.disabled) {
                this._animated = true;
                this._value = this.max;
                this._animationTimeout = setTimeout(() => {
                    this._value = this.min;
                    this._animationTimeout = setTimeout(() => {
                        var _a;
                        this._value = (_a = this.value) !== null && _a !== void 0 ? _a : 0;
                        this._animated = false;
                        this._animationTimeout = undefined;
                    }, 1100);
                }, 1100);
            }
            this._disabled = this.disabled;
        }
        if ((changed.has('value') || changed.has('disabled')) && !this.disabled && !this._animated && this._value !== this.value) {
            this._value = (_a = this.value) !== null && _a !== void 0 ? _a : 0;
        }
        if ((changed.has('min') || changed.has('disabled')) && this.disabled && !this._animated && this._value !== this.min) {
            this._value = this.min;
        }
    }
    render() {
        const disabled = this.disabled || this.value === undefined;
        return html `
      <div class="${`lc-gauge ${disabled ? 'disabled' : ''}`}">
        <div class="${`gauge ${this._animated ? 'animated' : ''}`}">
          <ha-gauge .min="${this.min}" .max="${this.max}" .value="${this._value}" .needle="${true}" .levels="${this.levels}" .locale="${this.hass.locale}"></ha-gauge>
        </div>
        <div class="value">${this._formatValue()}</div>
        <div class="label">${this.label}</div>
      </div>
    `;
    }
    _formatValue() {
        if (this.disabled || this._animated || this._value === undefined || isNaN(this._value)) {
            return `--${this.unit}`;
        }
        return `${formatNumberValue(this.hass, this.value)}${this.unit}`;
    }
}
LcGauge.properties = {
    hass: { attribute: true },
    label: { attribute: true, type: String },
    unit: { attribute: true, type: String },
    min: { attribute: true, type: Number },
    max: { attribute: true, type: Number },
    levels: { attribute: true },
    value: { attribute: true, type: Number },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
    _value: { state: true, type: Number },
    _animated: { state: true, type: Boolean },
};
LcGauge.styles = styles$7;
window.customElements.define('lc-gauge', LcGauge);

var styles$6 = css`:host{color:var(--button-icon-color,var(--disabled-text-color,#6f6f6f));--ha-icon-display:block;--mdc-icon-button-size:40px;--mdc-icon-size:24px;--mdc-theme-primary:var(--button-icon-color,var(--disabled-text-color,#6f6f6f));font-family:var(--paper-font-body1_-_font-family);-webkit-font-smoothing:var(--paper-font-body1_-_-webkit-font-smoothing);font-size:var(--paper-font-body1_-_font-size);font-weight:var(--paper-font-body1_-_font-weight);line-height:var(--paper-font-body1_-_line-height);position:relative}:host:before{background-color:currentcolor;border-radius:50%;content:" ";height:var(--mdc-icon-button-size);left:0;opacity:.15;position:absolute;right:0;width:var(--mdc-icon-button-size)}`;

class LcCircleButton extends LitElement {
    constructor() {
        super(...arguments);
        this.loading = false;
        this.disabled = false;
    }
    render() {
        return html `
      <mwc-icon-button class="circle-button" .disabled=${this.disabled} .title=${this.title}>
        ${this.loading && !this.disabled
            ? html ` <mwc-circular-progress indeterminate density=${-6}></mwc-circular-progress> `
            : html ` <ha-icon icon=${this.icon} class="icon"></ha-icon> `}
      </mwc-icon-button>
    `;
    }
}
LcCircleButton.properties = {
    hass: { attribute: true },
    icon: { attribute: true, type: String },
    label: { attribute: true, type: String },
    loading: { attribute: 'loading', reflect: true, type: Boolean },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
};
LcCircleButton.styles = styles$6;
window.customElements.define('lc-circle-button', LcCircleButton);

var styles$5 = css`:host{display:block}`;

let THERMOSTAT_PROMISE;
async function waitThermostat(hass) {
    if (!THERMOSTAT_PROMISE) {
        THERMOSTAT_PROMISE = window.loadCardHelpers().then(helpers => {
            const entity = Object.keys(hass.entities).find(id => id.startsWith('climate.'));
            console.log(entity);
            helpers.createCardElement({ type: 'thermostat', entity });
        });
    }
    return THERMOSTAT_PROMISE;
}
class LcRoundSlider extends LitElement {
    firstUpdated(changed) {
        super.firstUpdated(changed);
        waitThermostat(this.hass).catch(console.error);
    }
    willUpdate(changed) {
        super.willUpdate(changed);
    }
    render() {
        if (!this.hass) {
            return html ``;
        }
        return html ` <round-slider .value="${this.value}" .min="${this.min}" .max="${this.max}" .disabled="${this.disabled}"></round-slider> `;
    }
}
LcRoundSlider.properties = {
    hass: { attribute: true },
    value: { attribute: true, type: Number },
    min: { attribute: true, type: Number },
    max: { attribute: true, type: Number },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
};
LcRoundSlider.styles = styles$5;
window.customElements.define('lc-round-slider', LcRoundSlider);

var styles$4 = css`:host{--slider-height:var(--ls-slider-height,120px);--slider-width:var(--ls-slider-width,4px);--slider-thumb-size:var(--ls-slider-thumb-size,14px);--slider-track-color:var(--ls-slider-track-color,var(--accent-color,#2196f3));--slider-bg-color:var(--ls-slider-bg-color,hsla(0,0%,76%,.2));--slider-disabled-color:var(--ls-slider-disabled-color,var(--secondary-text-color));--slider-thumb-color:var(--ls-slider-thumb-color,var(--slider-track-color));--slider-thumb-min-color:var(--ls-slider-thumb-min-color,var(--secondary-text-color));display:block;height:var(--slider-height);text-align:center;width:calc(var(--slider-width) + 16px)}input[type=range]{--range:calc(var(--max) - var(--min));--ratio:calc((var(--value) - var(--min))/var(--range));--sx:calc(var(--slider-thumb-size)*0.5 + var(--ratio)*(100% - var(--slider-thumb-size)));--track-gradient:linear-gradient(var(--slider-track-color),var(--slider-track-color)) 0/var(--sx) 100% no-repeat,var(--slider-bg-color);-webkit-appearance:none;height:var(--slider-width);margin:2px 0;transform:rotate(270deg) translate(calc(var(--slider-height)*-1 + 16px - var(--slider-width)),8px);transform-origin:left top;width:var(--slider-height)}input[type=range]:focus{outline:none}input[type=range]::-webkit-slider-runnable-track{-webkit-appearance:none;background:var(--slider-track-color);background:var(--ls-slider-full-color,var(--track-gradient));border-radius:var(--slider-width);height:var(--slider-width);transition:filter .1s ease-in-out;width:var(--slider-height)}input[type=range]::-moz-range-track{background:var(--slider-track-color);background:var(--ls-slider-full-color,var(--track-gradient));border-radius:var(--slider-width);height:var(--slider-width);transition:filter .1s ease-in-out;width:var(--slider-height)}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;background:var(--thumb-color);border-radius:1em;height:var(--slider-thumb-size);margin-top:calc(var(--slider-width)*.5 - var(--slider-thumb-size)*.5);transition:all .1s ease-in-out;width:var(--slider-thumb-size)}input[type=range]::-webkit-slider-thumb:active{transform:scale(1.5)}input[type=range]::-moz-range-thumb{background:var(--thumb-color);border-radius:1em;height:var(--slider-thumb-size);margin-top:calc(var(--slider-width)*.5 - var(--slider-thumb-size)*.5);transition:all .1s ease-in-out;width:var(--slider-thumb-size)}input[type=range]::-moz-range-thumb:active{transform:scale(1.5)}input[type=range]:disabled::-webkit-slider-runnable-track{filter:grayscale(100%)}input[type=range]:disabled::-moz-range-track{filter:grayscale(100%)}input[type=range]:disabled::-webkit-slider-thumb{background:var(--slider-disabled-color)}input[type=range]:disabled::-webkit-slider-thumb:active{transform:unset}input[type=range]:disabled::-moz-range-thumb{background:var(--slider-disabled-color)}input[type=range]:disabled::-moz-range-thumb:active{transform:unset}`;

class LcVerticalSlider extends LitElement {
    constructor() {
        super(...arguments);
        /**
         * Slider input value
         */
        this.value = 50;
        this.min = 0;
        this.max = 100;
        this.step = 1;
        this.disabled = false;
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this._input) {
            this._input = document.createElement('input');
            this._input.type = 'range';
            this.shadowRoot.append(this._input);
        }
        this._input.addEventListener('change', this._handleChange.bind(this));
        this._input.addEventListener('input', this._handleInput.bind(this));
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._input.removeEventListener('change', this._handleChange);
        this._input.removeEventListener('input', this._handleInput);
    }
    shouldUpdate(changed) {
        if (changed.has('min') || changed.has('max')) {
            if (this.min >= this.max) {
                console.warn(`wrong MIN MAX values`);
            }
            else {
                const value = Number(this._input.value);
                if (value < this.min) {
                    this._input.value = this.min.toString();
                }
                else if (value > this.max) {
                    this._input.value = this.max.toString();
                }
                this._input.min = this.min.toString();
                this._input.max = this.max.toString();
                this._input.style.setProperty('--min', this.min.toString());
                this._input.style.setProperty('--max', this.max.toString());
            }
        }
        if (changed.has('step')) {
            this._input.step = this.step.toString();
        }
        if (changed.has('value')) {
            this._input.value = this.value.toString();
            this._input.style.setProperty('--value', this.value.toString());
            this._input.style.setProperty('--thumb-color', this.value > this.min ? 'var(--slider-thumb-color)' : 'var(--slider-thumb-min-color)');
        }
        if (changed.has('disabled')) {
            this._input.disabled = this.disabled;
        }
        return false;
    }
    _handleChange(event) {
        const input = event.target;
        const value = Number(input.value);
        const shadowRoot = input.parentNode;
        if (!shadowRoot || !shadowRoot.host) {
            return;
        }
        const options = {
            detail: { value },
            bubbles: true,
            composed: true,
        };
        shadowRoot.host.dispatchEvent(new CustomEvent('change', options));
    }
    _handleInput(event) {
        const input = event.target;
        input.style.setProperty('--value', input.value);
        input.style.setProperty('--thumb-color', input.value && Number(input.value) > this.min ? 'var(--slider-thumb-color)' : 'var(--slider-thumb-min-color)');
    }
}
LcVerticalSlider.properties = {
    value: { attribute: true, type: Number },
    min: { attribute: true, type: Number },
    max: { attribute: true, type: Number },
    step: { attribute: true, type: Number },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
};
LcVerticalSlider.styles = styles$4;
window.customElements.define('lc-vertical-slider', LcVerticalSlider);

async function getHassioFeatures() {
    var _a, _b;
    const { conn } = await window.hassConnection;
    if (!('_srv' in conn)) {
        return null;
    }
    const subscribe = (_a = conn['_srv']) === null || _a === void 0 ? void 0 : _a['subscribe'];
    if (typeof subscribe !== 'function') {
        return null;
    }
    await new Promise((resolve) => subscribe(resolve));
    const hass = (_b = document.body.querySelector('home-assistant')) === null || _b === void 0 ? void 0 : _b['__hass'];
    if (!hass || !hass.services || !hass.services.hassio) {
        return null;
    }
    return Object.keys(hass.services.hassio);
}

var styles$3 = css`:host{font-family:var(--paper-font-body1_-_font-family);-webkit-font-smoothing:var(--paper-font-body1_-_-webkit-font-smoothing);color:var(--primary-text-color);font-size:var(--paper-font-body1_-_font-size);font-weight:var(--paper-font-body1_-_font-weight);line-height:var(--paper-font-body1_-_line-height)}.area-card{overflow:hidden;position:relative}.area-card .card-header{padding:12px 16px 16px}.area-card .card-header .name{color:inherit;font-family:inherit;font-size:var(--ha-card-header-font-size,24px);line-height:1.2;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.area-card .card-header .climate{display:flex;margin:0 -8px}.area-card .card-content{align-items:center;display:flex;flex-wrap:wrap;justify-content:space-between;margin:0 -10px}.area-card .card-content .item{box-sizing:border-box;margin:0;padding:10px}`;

var common$1 = {
	version: "Version",
	cpu: "CPU",
	ram: "RAM",
	yes: "Yes",
	cancel: "Cancel",
	are_you_sure: "Are you sure?"
};
var area$1 = {
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
var mariadb$1 = {
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
var en = {
	common: common$1,
	area: area$1,
	mariadb: mariadb$1
};

var en$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  area: area$1,
  common: common$1,
  default: en,
  mariadb: mariadb$1
});

var common = {
	version: "Версия:",
	cpu: "CPU",
	ram: "RAM",
	yes: "Да",
	cancel: "Отмена",
	are_you_sure: "Вы уверены?"
};
var area = {
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
var mariadb = {
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
var ru = {
	common: common,
	area: area,
	mariadb: mariadb
};

var ru$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  area: area,
  common: common,
  default: ru,
  mariadb: mariadb
});

const translations = {
    en: en$1,
    ru: ru$1,
};
function translateString(string, translatedStrings) {
    if (typeof translatedStrings === 'string') {
        return translatedStrings;
    }
    const splitted = string.split('.');
    const [key, ...otherKeys] = splitted;
    const translated = translatedStrings[key];
    if (!translated || typeof translated === 'string') {
        return translated;
    }
    return translateString(otherKeys && otherKeys.length > 0 ? otherKeys.join('.') : '', translated);
}
function language() {
    var _a;
    let lang = (_a = localStorage.getItem('selectedLanguage')) === null || _a === void 0 ? void 0 : _a.replace(/['"]+/g, '').replace('-', '_');
    if (lang === 'null') {
        lang = undefined;
    }
    if (!lang) {
        lang = localStorage.getItem('i18nextLng');
    }
    if (!lang || lang === 'null') {
        lang = 'en';
    }
    return lang;
}
function t(string, search = '', replace = '') {
    const lang = language();
    let translatedStrings;
    try {
        translatedStrings = Object.assign({}, translations[lang]);
    }
    catch (e) {
        translatedStrings = Object.assign({}, translations['en']);
    }
    let translated = translateString(string, translatedStrings);
    if (translated === undefined) {
        translated = translateString(string, Object.assign({}, translations['en']));
    }
    if (translated && search !== '' && replace !== '') {
        translated = translated.replace(`{${search}}`, replace);
    }
    return translated !== null && translated !== void 0 ? translated : '';
}

var styles$2 = css`:host{--mdc-icon-size:20px;color:var(--secondary-text-color);cursor:pointer;display:block;font-size:14px;line-height:1;margin:0 4px}:host .icon{position:relative;top:-2px}`;

class AreaCardSensor extends LitElement {
    willUpdate(changed) {
        super.willUpdate(changed);
        if (changed.has('entity') || changed.has('hass')) {
            if (this.hass && this.entity && this.entity in this.hass.states) {
                const state = this.hass.states[this.entity];
                this._icon = state.attributes.icon || this._getDefaultIcon(state.attributes.device_class);
                this._value = formatNumberValue(this.hass, state.state);
                this._unit = state.attributes.unit_of_measurement;
            }
            else {
                this._icon = undefined;
                this._value = undefined;
                this._unit = undefined;
            }
        }
    }
    render() {
        if (!this._icon || !this._value) {
            return html ``;
        }
        return html `
      <ha-icon .icon="${this._icon}" class="icon"></ha-icon>
      <span>${this._value}${this._value && this._unit ? ' ' + this._unit : ''}</span>
    `;
    }
    _getDefaultIcon(deviceClass) {
        switch (deviceClass) {
            case 'temperature':
                return 'mdi:thermometer';
            case 'humidity':
                return 'mdi:water-percent';
            case 'pressure':
                return 'mdi:gauge';
            default:
                return undefined;
        }
    }
}
AreaCardSensor.properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
    _icon: { state: true },
    _value: { state: true },
    _unit: { state: true },
};
AreaCardSensor.styles = styles$2;
window.customElements.define('lc-area-card-sensor', AreaCardSensor);

var styles$1 = css`.area-card-light{display:flex;height:100%;position:relative;width:100%}.area-card-light .slider-block{align-items:flex-end;display:flex;margin-right:12px}.area-card-light .slider-block .slider.brightness{--ls-slider-track-color:var(--blue-color)}.area-card-light .slider-block .slider.color-temp{--ls-slider-full-color:linear-gradient(90deg,#d18847,#d1d0cd)}.area-card-light .slider-block .icon{--mdc-icon-size:20px}`;

var CallApiMethod;
(function (CallApiMethod) {
    CallApiMethod["GET"] = "GET";
    CallApiMethod["POST"] = "POST";
    CallApiMethod["PUT"] = "PUT";
    CallApiMethod["DELETE"] = "DELETE";
})(CallApiMethod || (CallApiMethod = {}));

var NumberFormat;
(function (NumberFormat) {
    NumberFormat["language"] = "language";
    NumberFormat["system"] = "system";
    NumberFormat["comma_decimal"] = "comma_decimal";
    NumberFormat["decimal_comma"] = "decimal_comma";
    NumberFormat["space_comma"] = "space_comma";
    NumberFormat["none"] = "none";
})(NumberFormat || (NumberFormat = {}));
var TimeFormat;
(function (TimeFormat) {
    TimeFormat["language"] = "language";
    TimeFormat["system"] = "system";
    TimeFormat["am_pm"] = "12";
    TimeFormat["twenty_four"] = "24";
})(TimeFormat || (TimeFormat = {}));
var FirstWeekday;
(function (FirstWeekday) {
    FirstWeekday["language"] = "language";
    FirstWeekday["monday"] = "monday";
    FirstWeekday["tuesday"] = "tuesday";
    FirstWeekday["wednesday"] = "wednesday";
    FirstWeekday["thursday"] = "thursday";
    FirstWeekday["friday"] = "friday";
    FirstWeekday["saturday"] = "saturday";
    FirstWeekday["sunday"] = "sunday";
})(FirstWeekday || (FirstWeekday = {}));

var HassEntityCategory;
(function (HassEntityCategory) {
    HassEntityCategory["CONFIG"] = "config";
    HassEntityCategory["DIAGNOSTIC"] = "diagnostic";
})(HassEntityCategory || (HassEntityCategory = {}));
var HassLightColorMode;
(function (HassLightColorMode) {
    HassLightColorMode["UNKNOWN"] = "unknown";
    HassLightColorMode["ONOFF"] = "onoff";
    HassLightColorMode["BRIGHTNESS"] = "brightness";
    HassLightColorMode["COLOR_TEMP"] = "color_temp";
    HassLightColorMode["HS"] = "hs";
    HassLightColorMode["XY"] = "xy";
    HassLightColorMode["RGB"] = "rgb";
    HassLightColorMode["RGBW"] = "rgbw";
    HassLightColorMode["RGBWW"] = "rgbww";
    HassLightColorMode["WHITE"] = "white";
})(HassLightColorMode || (HassLightColorMode = {}));

const COLOR_SUPPORTING = [HassLightColorMode.HS, HassLightColorMode.XY, HassLightColorMode.RGB, HassLightColorMode.RGBW, HassLightColorMode.RGBWW];
const BRIGHTNESS_SUPPORTING = [...COLOR_SUPPORTING, HassLightColorMode.COLOR_TEMP, HassLightColorMode.BRIGHTNESS, HassLightColorMode.WHITE];
class AreaCardLight extends LitElement {
    willUpdate(changed) {
        var _a, _b, _c, _d;
        super.willUpdate(changed);
        if (changed.has('entity') || changed.has('hass')) {
            const state = this._getLightState();
            if (state) {
                if (this._state !== state.state) {
                    this._state = state.state;
                }
                // Update brightness
                if ((_a = state.attributes.supported_color_modes) === null || _a === void 0 ? void 0 : _a.some(mode => BRIGHTNESS_SUPPORTING.includes(mode))) {
                    if (!this._brightnessBound) {
                        this._brightnessBound = [0, 255];
                    }
                    if (this._brightness !== state.attributes.brightness) {
                        this._brightness = state.attributes.brightness;
                    }
                }
                // Update color temperature
                if ((state.attributes.color_mode && state.attributes.color_mode === HassLightColorMode.COLOR_TEMP) ||
                    ((_b = state.attributes.supported_color_modes) === null || _b === void 0 ? void 0 : _b.includes(HassLightColorMode.COLOR_TEMP))) {
                    if (!this._colorTempBound) {
                        this._colorTempBound = [(_c = state.attributes.min_color_temp_kelvin) !== null && _c !== void 0 ? _c : 2000, (_d = state.attributes.max_color_temp_kelvin) !== null && _d !== void 0 ? _d : 6500];
                    }
                    const colorTemp = state.attributes.color_temp_kelvin || 2000;
                    if (this._colorTemp !== colorTemp) {
                        this._colorTemp = colorTemp;
                    }
                }
                // Update RGB color
                const rgbColor = state.attributes.rgb_color ? `color: rgb(${state.attributes.rgb_color.join(',')});` : '';
                if (rgbColor !== this._rgbColor) {
                    this._rgbColor = rgbColor;
                }
            }
            else {
                this._state = undefined;
                this._brightness = undefined;
                this._brightnessBound = undefined;
                this._colorTemp = undefined;
                this._colorTempBound = undefined;
                this._rgbColor = undefined;
            }
        }
    }
    render() {
        const state = this._getLightState();
        if (!state) {
            return html ``;
        }
        const isOn = this._state === 'on' && (!this._brightnessBound || !!this._brightness);
        return html `
      <div class="area-card-light">
        ${this._brightnessBound
            ? html `
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
                  .icon=${isOn ? 'mdi:lightbulb' : 'mdi:lightbulb-off'}
                  .style="${isOn ? `filter: brightness(${(this._brightness + 245) / 5}%);` : 'color: var(--secondary-text-color)'}"
                ></ha-icon>
              </div>
            `
            : null}
        ${this._colorTempBound
            ? html `
              <div class="slider-block">
                <lc-vertical-slider
                  class="slider color-temp"
                  .min="${this._colorTempBound[0]}"
                  .max="${this._colorTempBound[1]}"
                  .value="${this._colorTemp}"
                  .disabled="${!isOn}"
                  @change="${this._colorTempChange}"
                ></lc-vertical-slider>
                <ha-icon class="icon" icon="mdi:temperature-kelvin" .style="${this._rgbColor && isOn ? this._rgbColor : 'color: var(--secondary-text-color)'}"></ha-icon>
              </div>
            `
            : null}
      </div>
    `;
    }
    /**
     * Returns entity light state.
     * @private
     */
    _getLightState() {
        const states = Object.assign({}, this.hass.states /*, 'light.room_light': ENTITY_LIGHT_STATE*/);
        return this.hass && this.entity && this.entity in states ? states[this.entity] : undefined;
    }
    /**
     * Change brightness handler
     * @param event
     * @private
     */
    _brightnessChange(event) {
        const brightness = event.detail.value;
        // this._brightness = brightness;
        this.hass.callService('light', 'turn_on', { brightness }, { entity_id: this.entity }).catch(console.error);
    }
    /**
     * Change color temperature handler
     * @param event
     * @private
     */
    _colorTempChange(event) {
        var _a;
        const colorTempKelvin = Math.floor(Number((_a = event.detail) === null || _a === void 0 ? void 0 : _a.value) || 0);
        // this._colorTemp = colorTempKelvin;
        this.hass.callService('light', 'turn_on', { color_temp_kelvin: colorTempKelvin }, { entity_id: this.entity }).catch(console.error);
    }
    /**
     * Light toggle
     * @private
     */
    _onoffChange() {
        const service = this._state ? 'turn_off' : 'turn_on';
        this.hass.callService('light', service, {}, { entity_id: this.entity }).catch(console.error);
    }
}
AreaCardLight.properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
    _state: { state: true },
    _brightness: { state: true, type: Number },
    _brightnessBound: { state: true },
    _colorTemp: { state: true, type: Number },
    _colorTempBound: { state: true },
    _rgbColor: { state: true, type: String },
};
AreaCardLight.styles = styles$1;
window.customElements.define('lc-area-card-light', AreaCardLight);

var styles = css``;

class AreaCardConditioner extends LitElement {
    willUpdate(changed) {
        super.willUpdate(changed);
        // if (changed.has('entity') || changed.has('hass')) {
        //
        // }
    }
    render() {
        return html ``;
    }
}
AreaCardConditioner.properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
};
AreaCardConditioner.styles = styles;
window.customElements.define('lc-area-card-conditioner', AreaCardConditioner);

/**
 * Dispatches a custom event with an optional detail value.
 *
 * @param node
 * @param {string} type Name of event type.
 * @param {*=} detail Detail value containing event-specific
 *   payload.
 * @param options
 *           cancelable: (boolean|undefined),
 *           composed: (boolean|undefined) }=}
 *  options Object specifying options.  These may include:
 *  `bubbles` (boolean, defaults to `true`),
 *  `cancelable` (boolean, defaults to false), and
 *  `node` on which to fire the event (HTMLElement, defaults to `this`).
 * @return {Event} The new event that was fired.
 */
function fireEvent(node, type, detail, options) {
    options = options || {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed,
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
}

var RemoteEntityIndex;
(function (RemoteEntityIndex) {
    RemoteEntityIndex[RemoteEntityIndex["LIGHT"] = 0] = "LIGHT";
    RemoteEntityIndex[RemoteEntityIndex["CONDITIONER"] = 1] = "CONDITIONER";
})(RemoteEntityIndex || (RemoteEntityIndex = {}));
class AreaCard extends LitElement {
    constructor() {
        super(...arguments);
        /**
         * Found entities IDs displayed in card header
         * @private
         */
        this._headerEntities = [];
        /**
         * Entities that can be controlled or configured. Hood, light, air conditioning, etc.
         * @private
         */
        this._remoteEntities = [];
    }
    static async getConfigElement() {
        await import('./area-config-BOjLpLGy.js');
        return document.createElement('lc-area-config');
    }
    static async getStubConfig(hass) {
        var _a;
        const area = Object.values(hass.areas)[0];
        return {
            type: 'custom:lc-area-card',
            name: '',
            area: (_a = area === null || area === void 0 ? void 0 : area.area_id) !== null && _a !== void 0 ? _a : '',
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
        if (changed.has('_config')) {
            this._updateEntities();
        }
    }
    render() {
        var _a;
        if (!this.hass || !this._config.area) {
            return html ``;
        }
        const areaName = this._config.name || ((_a = this.hass.areas[this._config.area]) === null || _a === void 0 ? void 0 : _a.name);
        return html `
      <ha-card class="area-card">
        <div class="card-header">
          <div class="name">${areaName}</div>
          <div class="climate">
            ${this._headerEntities.map(entity => {
            return entity ? html ` <lc-area-card-sensor .hass="${this.hass}" .entity="${entity}" @click="${() => this._showMoreInfo(entity)}"></lc-area-card-sensor>` : undefined;
        })}
          </div>
        </div>
        <div class="card-content">
          ${this._remoteEntities.map((entity, index) => {
            if (entity && index === RemoteEntityIndex.LIGHT) {
                return html ` <div class="item">
                <lc-area-card-light .hass="${this.hass}" .entity="${entity}"></lc-area-card-light>
              </div>`;
            }
            if (entity && index === RemoteEntityIndex.CONDITIONER) {
                return html ` <div class="item">
                <lc-area-card-conditioner .hass="${this.hass}" .entity="${entity}"></lc-area-card-conditioner>
              </div>`;
            }
            return '';
        })}
        </div>
        <div class="card-footer"></div>
      </ha-card>
    `;
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
        const areaDevices = Object.keys(this.hass.devices).filter(id => this.hass.devices[id].area_id === this._config.area);
        this._headerEntities = new Array(AreaCard.headerEntitiesDeviceClasses.length);
        this._headerEntities.fill(undefined);
        this._remoteEntities = new Array(1);
        this._remoteEntities.fill(undefined);
        const entities = Object.assign({}, this.hass.entities /*, 'light.room_light': ENTITY_LIGHT*/);
        const states = Object.assign({}, this.hass.states /*, 'light.room_light': ENTITY_LIGHT_STATE*/);
        for (const entityId in entities) {
            const entity = entities[entityId];
            if ((entity.area_id && entity.area_id === this._config.area) || (entity.device_id && areaDevices.includes(entity.device_id))) {
                const state = states[entity.entity_id];
                // Header sensors
                if (entity.entity_id.startsWith('sensor.') && state.attributes.device_class && AreaCard.headerEntitiesDeviceClasses.includes(state.attributes.device_class)) {
                    const index = AreaCard.headerEntitiesDeviceClasses.indexOf(state.attributes.device_class);
                    this._headerEntities[index] = entity.entity_id;
                    continue;
                }
                // Light
                if (entity.entity_id.startsWith('light.')) {
                    this._remoteEntities[RemoteEntityIndex.LIGHT] = entity.entity_id;
                }
                // Conditioner
                if (entity.entity_id.startsWith('climate.')) {
                    this._remoteEntities[RemoteEntityIndex.CONDITIONER] = entity.entity_id;
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
        fireEvent(this, 'hass-more-info', { entityId });
    }
}
/**
 * Sensors displayed in card header
 */
AreaCard.headerEntitiesDeviceClasses = ['temperature', 'humidity' /*, 'pressure'*/];
AreaCard.styles = styles$3;
AreaCard.properties = {
    hass: { attribute: false },
    _config: { state: true },
    _climaticSensors: { state: true },
};
window.customElements.define('lc-area-card', AreaCard);
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'lc-area-card',
    name: t('area.name'),
    preview: false,
    description: t('area.description'),
});

(async () => {
    const features = await getHassioFeatures();
    if (!features) {
        return;
    }
    await import('./admin-B9jA0yLl.js');
})();

export { AreaCard as A, LitElement as L, fireEvent as a, LcGauge as b, css as c, LcCircleButton as d, LcRoundSlider as e, formatNumberValue as f, LcVerticalSlider as g, html as h, t };
