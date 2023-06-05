const LitElement = Object.getPrototypeOf(customElements.get('home-assistant-main'));
const { html, css } = LitElement.prototype;

var styles$3 = css`:host {
  display: block;
}

.dc-gauge {
  filter: none;
  position: relative;
}
.dc-gauge .gauge {
  position: relative;
  z-index: 1;
}
.dc-gauge .gauge.animated {
  animation-name: flicker;
  animation-timing-function: linear;
  animation-duration: 800ms;
}
.dc-gauge .value {
  left: 0;
  right: 0;
  transform: translateY(-100%);
  text-align: center;
  position: absolute;
  z-index: 2;
}
.dc-gauge .label {
  width: 100%;
  margin-top: 10px;
  text-align: center;
  font-size: 16px;
  position: relative;
  z-index: 3;
}
.dc-gauge.disabled .gauge {
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
            const entity = Object.keys(hass.entities).find(id => id.startsWith('sensor.'));
            helpers.createCardElement({ type: 'gauge', entity });
        });
    }
    return GAUGE_PROMISE;
}
class DcGauge extends LitElement {
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
        waitGauge(this.hass);
        waitElement(this, 'ha-gauge', true)
            .then(element => waitElement(element, 'svg.text', true))
            .then(element => {
            if (element) {
                element.style.visibility = 'hidden';
            }
        });
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
      <div class="${`dc-gauge ${disabled ? 'disabled' : ''}`}">
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
DcGauge.properties = {
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
DcGauge.styles = styles$3;
window.customElements.define('dc-gauge', DcGauge);

var styles$2 = css`:host {
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

class DcCircleButton extends LitElement {
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
DcCircleButton.properties = {
    hass: { attribute: true },
    icon: { attribute: true, type: String },
    label: { attribute: true, type: String },
    loading: { attribute: 'loading', reflect: true, type: Boolean },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
};
DcCircleButton.styles = styles$2;
window.customElements.define('dc-circle-button', DcCircleButton);

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
  common: common$1,
  area: area$1,
  mariadb: mariadb$1,
  'default': en
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
	db_size: "Размер БД",
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
  common: common,
  area: area,
  mariadb: mariadb,
  'default': ru
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

var styles$1 = css`[aria-label][data-tooltip-pos][data-tooltip-pos=top]::before {
  border: var(--tooltip-arrow-size, 6px) solid transparent;
  height: 0;
  width: 0;
}

:host {
  font-family: var(--paper-font-body1_-_font-family);
  -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
  font-size: var(--paper-font-body1_-_font-size);
  font-weight: var(--paper-font-body1_-_font-weight);
  line-height: var(--paper-font-body1_-_line-height);
  color: var(--primary-text-color);
}

[aria-label][data-tooltip-pos] {
  cursor: pointer;
  position: relative;
}
[aria-label][data-tooltip-pos]::after {
  background-color: var(--tooltip-bg-color, rgba(var(--rgb-secondary-background-color), 0.95));
  border-radius: var(--tooltip-border-radius, 4px);
  border: var(--tooltip-border-width, 0.5px) solid var(--tooltip-border-color, var(--divider-color));
  box-shadow: 0 0 0.1875rem rgba(0, 0, 0, 0.3);
  color: var(--tooltip-text-color, var(--primary-text-color));
  content: attr(aria-label);
  font-family: var(--paper-font-body1_-_font-family);
  font-size: var(--tooltip-font-size, 12px);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-style: normal;
  font-weight: 400;
  padding: 0.5em 1em;
  text-indent: 0;
  text-shadow: none;
  white-space: nowrap;
  z-index: 10;
}
[aria-label][data-tooltip-pos]::before {
  content: "";
  z-index: 11;
}
[aria-label][data-tooltip-pos]::after, [aria-label][data-tooltip-pos]::before {
  box-sizing: border-box;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: all 0.12s ease-out 0.12s;
  transition-delay: var(--tooltip-delay-hide, 0s);
}
[aria-label][data-tooltip-pos]:hover::before, [aria-label][data-tooltip-pos]:hover::after, [aria-label][data-tooltip-pos]:focus::before, [aria-label][data-tooltip-pos]:focus::after {
  opacity: 1;
  transition-delay: var(--tooltip-delay-show, 0s);
}
[aria-label][data-tooltip-pos][data-tooltip-pos=top]::after {
  margin-bottom: calc(var(--tooltip-arrow-size, 6px) * 2);
}
[aria-label][data-tooltip-pos][data-tooltip-pos=top]::before {
  border-top-color: var(--tooltip-border-color, var(--divider-color));
  filter: drop-shadow(0 1px rgba(0, 0, 0, 0.3));
}
[aria-label][data-tooltip-pos][data-tooltip-pos=top]::after, [aria-label][data-tooltip-pos][data-tooltip-pos=top]::before {
  bottom: calc(100% - var(--tooltip-arrow-size, 6px) / 2);
  left: 50%;
  transform: translate(-50%, 6px);
  transform-origin: top;
}
[aria-label][data-tooltip-pos][data-tooltip-pos=top]:hover::after, [aria-label][data-tooltip-pos][data-tooltip-pos=top]:hover::before, [aria-label][data-tooltip-pos][data-tooltip-pos=top]:focus::after, [aria-label][data-tooltip-pos][data-tooltip-pos=top]:focus::before {
  transform: translate(-50%, 0);
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
  width: 42px;
  height: auto;
}
.mariadb-card .card-footer .database-size .value {
  margin-left: 14px;
  font-size: 16px;
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

var Action;
(function (Action) {
    Action["PURGE"] = "purge";
    Action["RELOAD"] = "reload";
    Action["STOP"] = "stop";
    Action["START"] = "start";
})(Action || (Action = {}));
var AddonState;
(function (AddonState) {
    AddonState["STARTED"] = "started";
    AddonState["STOPPED"] = "stopped";
    AddonState["RUNNING"] = "running";
    AddonState["UNKNOWN"] = "unknown";
})(AddonState || (AddonState = {}));
async function subscribeToAddonStateChange(callback) {
    const { conn } = await hassConnection;
    return await conn.subscribeMessage((event) => {
        if (event.event === 'addon' && event.slug === MariadbCard.dbAddonSlug) {
            callback(event.state);
        }
    }, { type: 'supervisor/subscribe' });
}
class MariadbCard extends LitElement {
    constructor() {
        super(...arguments);
        /**
         * Addon is stopped
         * @private
         */
        this._works = false;
    }
    setConfig(config = {}) {
        this.config = config;
    }
    getCardSize() {
        return 3;
    }
    firstUpdated() {
        const payload = {
            endpoint: `/addons/${MariadbCard.dbAddonSlug}/info`,
            method: 'get',
            type: 'supervisor/api',
        };
        this.hass
            .callWS(payload)
            .then(addonInfo => {
            this._name = addonInfo.name;
            this._version = addonInfo.version;
            this._works = addonInfo.state === AddonState.STARTED;
        })
            .catch(console.error);
    }
    willUpdate(changedProps) {
        var _a;
        super.willUpdate(changedProps);
        if (!this.hass) {
            return;
        }
        if (changedProps.has('hass')) {
            const isDark = !!((_a = this.hass.themes) === null || _a === void 0 ? void 0 : _a.darkMode);
            if (isDark !== this._dark) {
                this._dark = isDark;
            }
        }
    }
    async connectedCallback() {
        await super.connectedCallback();
        this._addonStateUnsubscribe = await subscribeToAddonStateChange(state => (this._works = state === AddonState.STARTED));
    }
    async disconnectedCallback() {
        var _a;
        await super.disconnectedCallback();
        (_a = this._addonStateUnsubscribe) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    render() {
        if (!this.hass) {
            return html ``;
        }
        const logoUrl = `/dashboard-cards/mariadb-logo-${this._dark ? 'white' : 'dark'}.svg`;
        const dbSize = this._bdSize();
        return html `
      <ha-card class="mariadb-card">
        <div class="card-header">
          <img .src="${logoUrl}" class="logo" alt="MariaDB" />
          <div class="info">
            <div class="name">${this._name}</div>
            ${this._version ? html `<div class="version">${t('common.version')}&nbsp;${this._version}</div>` : null}
          </div>
        </div>
        <div class="card-content">
          <div class="gauge-wrap">
            <dc-gauge
              .hass="${this.hass}"
              .label="${'CPU'}"
              .unit="${'%'}"
              .min="${0}"
              .max="${10}"
              .levels="${[
            { level: 0, stroke: 'var(--success-color)' },
            { level: 2, stroke: 'var(--warning-color)' },
            { level: 7, stroke: 'var(--error-color)' },
        ]}"
              .value="${0.4}"
              .loading="${false}"
              .disabled="${!this._works}"
            ></dc-gauge>
          </div>

          <div class="gauge-wrap">
            <dc-gauge
              .hass="${this.hass}"
              .label="${'RAM'}"
              .unit="${'%'}"
              .min="${0}"
              .max="${100}"
              .levels="${[{ level: 0, stroke: 'var(--info-color)' }]}"
              .value="${3}"
              .loading="${false}"
              .disabled="${!this._works}"
            ></dc-gauge>
          </div>

          <div class="gauge-wrap">
            <dc-gauge
              .hass="${this.hass}"
              .label="${'RAM'}"
              .unit="${'Mb'}"
              .min="${0}"
              .max="${4000}"
              .levels="${[{ level: 0, stroke: 'var(--warning-color)' }]}"
              .value="${245}"
              .loading="${false}"
              .disabled="${!this._works}"
            ></dc-gauge>
          </div>
        </div>
        <div class="card-footer">
          <div class="database-size">
            ${dbSize
            ? html `
                  <img class="icon" src="/dashboard-cards/database-size-2.svg" alt="DB Icon" />
                  <div class="value">${this._bdSize()}</div>
                `
            : null}
          </div>
          <div class="actions">
            ${this._works
            ? html `
                  <div class="btn-wrap purge" data-tooltip-pos="top" aria-label="${t('mariadb.purge.tooltip')}">
                    <dc-circle-button icon="mdi:database-cog" @click="${this._progress ? undefined : this._purge}" .loading="${this._progress === Action.PURGE}"></dc-circle-button>
                  </div>
                  <div class="btn-wrap reload" data-tooltip-pos="top" aria-label="${t('mariadb.reload.tooltip')}">
                    <dc-circle-button icon="mdi:restart" @click="${this._progress ? undefined : this._reload}" .loading="${this._progress === Action.RELOAD}"></dc-circle-button>
                  </div>
                  <div class="btn-wrap stop" data-tooltip-pos="top" aria-label="${t('mariadb.stop.tooltip')}">
                    <dc-circle-button icon="mdi:stop" @click="${this._progress ? undefined : this._stop}" .loading="${this._progress === Action.STOP}"></dc-circle-button>
                  </div>
                `
            : html `
                  <div class="btn-wrap start" data-tooltip-pos="top" aria-label="${t('mariadb.start.tooltip')}">
                    <dc-circle-button icon="mdi:play" @click="${this._progress ? undefined : this._start}" .loading="${this._progress === Action.START}"></dc-circle-button>
                  </div>
                `}
          </div>
        </div>
      </ha-card>

      ${this._dialog
            ? html `
            <ha-dialog .open="${true}" @closed="${this._cancel}" heading="${this._dialog.title}" class="dialog">
              <div>
                <p class="">${this._dialog.message}</p>
              </div>
              <mwc-button slot="secondaryAction" @click="${this._cancel}">CANCEL</mwc-button>
              <mwc-button slot="primaryAction" @click="${this._confirm}">OK</mwc-button>
            </ha-dialog>
          `
            : null}
    `;
    }
    /**
     * Returns formatted DB size
     * @private
     */
    _bdSize() {
        if (MariadbCard.dbSizeSensor in this.hass.states) {
            const size = formatNumberValue(this.hass, this.hass.states[MariadbCard.dbSizeSensor].state);
            if (size) {
                return `${size} MB`;
            }
        }
        return undefined;
    }
    _confirm() {
        if (!this._dialog) {
            return;
        }
        this._progress = this._dialog.action;
        this._dialog = undefined;
        switch (this._progress) {
            case Action.PURGE:
                return this._callService('recorder', 'purge', { keep_days: 10, apply_filter: true, repack: true });
            case Action.START:
                return this._callSupervisorWs('start');
            case Action.STOP:
                return this._callSupervisorWs('stop');
            case Action.RELOAD:
                return this._callSupervisorWs('restart');
        }
    }
    _callService(domain, service, serviceData = {}) {
        this.hass
            .callService(domain, service, serviceData)
            .then(() => {
            this._progress = undefined;
        })
            .catch(err => {
            this._progress = undefined;
            console.error(err);
        });
    }
    _callSupervisorWs(endpoint) {
        const payload = {
            endpoint: `/addons/${MariadbCard.dbAddonSlug}/${endpoint}`,
            method: 'post',
            timeout: null,
            type: 'supervisor/api',
        };
        this.hass
            .callWS(payload)
            .then(() => {
            this._progress = undefined;
        })
            .catch(err => {
            this._progress = undefined;
            console.error(err);
        });
    }
    _cancel() {
        this._dialog = undefined;
    }
    _purge() {
        this._dialog = {
            title: t('common.are_you_sure'),
            message: t('mariadb.purge.dialog'),
            action: Action.PURGE,
        };
    }
    _reload() {
        this._dialog = {
            title: t('common.are_you_sure'),
            message: t('mariadb.reload.dialog'),
            action: Action.RELOAD,
        };
    }
    _stop() {
        this._dialog = {
            title: t('common.are_you_sure'),
            message: t('mariadb.stop.dialog'),
            action: Action.STOP,
        };
    }
    _start() {
        this._dialog = {
            title: t('common.are_you_sure'),
            message: t('mariadb.start.dialog'),
            action: Action.START,
        };
    }
}
MariadbCard.styles = styles$1;
MariadbCard.properties = {
    hass: { attribute: false },
    config: { attribute: false },
    _name: { state: true, type: String },
    _version: { state: true, type: String },
    _dark: { state: true, type: Boolean },
    _works: { state: true, type: Boolean },
    _progress: { state: true, type: String },
    _dialog: { state: true },
};
MariadbCard.dbSizeSensor = 'sensor.mariadb_database_size';
MariadbCard.dbAddonSlug = 'core_mariadb';
customElements.define('dc-mariadb-card', MariadbCard);
// Puts card into the UI card picker dialog
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'dc-mariadb-card',
    name: t('mariadb.name'),
    description: t('mariadb.description'),
    preview: true,
    configurable: false,
});

var styles = css`:host {
  --mdc-icon-button-size: 40px;
  --mdc-icon-size: 28px;
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
}`;

class AreaCard extends LitElement {
    static async getConfigElement() {
        await import('./area-config-951c6f0a.js');
        return document.createElement('dc-area-config');
    }
    static async getStubConfig(hass) {
        var _a;
        const area = Object.values(hass.areas)[0];
        return {
            type: 'custom:dc-area-card',
            name: '',
            area: (_a = area === null || area === void 0 ? void 0 : area.area_id) !== null && _a !== void 0 ? _a : '',
        };
    }
    setConfig(config) {
        this._config = config;
    }
    render() {
        return html `
      <ha-card class="area-card">
        <div class="content">
          <h5>Area Card</h5>
        </div>
      </ha-card>
    `;
    }
    getCardSize() {
        return 3;
    }
}
AreaCard.styles = styles;
AreaCard.properties = {
    hass: { attribute: false },
    _config: { state: true },
};
window.customElements.define('dc-area-card', AreaCard);
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'dc-area-card',
    name: t('area.name'),
    preview: false,
    description: t('area.description'),
});

function replace(domain, image) {
    if (!window.brandReplacer) {
        window.brandReplacer = import('./brand-replacer-a313eab0.js');
    }
    window.brandReplacer.then(module => {
        module.BrandReplacer.insert(domain, image);
    });
}

replace('dashboard_cards', '/dashboard-cards/logo.svg');

export { AreaCard as A, DcGauge as D, LitElement as L, DcCircleButton as a, css as c, html as h, t };
