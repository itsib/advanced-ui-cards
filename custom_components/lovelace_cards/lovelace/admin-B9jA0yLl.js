import { c as css, t, L as LitElement, h as html, f as formatNumberValue, a as fireEvent } from './index-o-g5cC7e.js';

var styles = css`[aria-label][data-tooltip-pos][data-tooltip-pos=left]:before,[aria-label][data-tooltip-pos][data-tooltip-pos=top]:before{border:var(--tooltip-arrow-size,6px) solid transparent;height:0;width:0}:host{font-family:var(--paper-font-body1_-_font-family);-webkit-font-smoothing:var(--paper-font-body1_-_-webkit-font-smoothing);color:var(--primary-text-color);font-size:var(--paper-font-body1_-_font-size);font-weight:var(--paper-font-body1_-_font-weight);line-height:var(--paper-font-body1_-_line-height)}[aria-label][data-tooltip-pos]{cursor:pointer;position:relative}[aria-label][data-tooltip-pos]:after{background-color:var(--tooltip-bg-color,rgba(var(--rgb-secondary-background-color),.95));border:var(--tooltip-border-width,.5px) solid var(--tooltip-border-color,var(--divider-color));border-radius:var(--tooltip-border-radius,4px);box-shadow:0 0 .1875rem rgba(0,0,0,.3);color:var(--tooltip-text-color,var(--primary-text-color));content:attr(aria-label);font-family:var(--paper-font-body1_-_font-family);font-size:var(--tooltip-font-size,12px);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-style:normal;font-weight:400;padding:.5em 1em;text-indent:0;text-shadow:none;white-space:nowrap;z-index:10}[aria-label][data-tooltip-pos]:before{content:"";z-index:11}[aria-label][data-tooltip-pos]:after,[aria-label][data-tooltip-pos]:before{box-sizing:border-box;opacity:0;pointer-events:none;position:absolute;transition:all .12s ease-out .12s;transition-delay:var(--tooltip-delay-hide,0s)}[aria-label][data-tooltip-pos]:focus:after,[aria-label][data-tooltip-pos]:focus:before,[aria-label][data-tooltip-pos]:hover:after,[aria-label][data-tooltip-pos]:hover:before{opacity:1;transition-delay:var(--tooltip-delay-show,0s)}[aria-label][data-tooltip-pos][data-tooltip-pos=top]:after{margin-bottom:calc(var(--tooltip-arrow-size, 6px)*2)}[aria-label][data-tooltip-pos][data-tooltip-pos=top]:before{border-top-color:var(--tooltip-border-color,var(--divider-color));filter:drop-shadow(0 1px rgba(0,0,0,.3))}[aria-label][data-tooltip-pos][data-tooltip-pos=top]:after,[aria-label][data-tooltip-pos][data-tooltip-pos=top]:before{bottom:calc(100% - var(--tooltip-arrow-size, 6px)/2);left:50%;transform:translate(-50%,6px);transform-origin:top}[aria-label][data-tooltip-pos][data-tooltip-pos=top]:focus:after,[aria-label][data-tooltip-pos][data-tooltip-pos=top]:focus:before,[aria-label][data-tooltip-pos][data-tooltip-pos=top]:hover:after,[aria-label][data-tooltip-pos][data-tooltip-pos=top]:hover:before{transform:translate(-50%)}[aria-label][data-tooltip-pos][data-tooltip-pos=left]:after{margin-right:calc(var(--tooltip-arrow-size, 6px)*2)}[aria-label][data-tooltip-pos][data-tooltip-pos=left]:before{border-left-color:var(--tooltip-border-color,var(--divider-color));filter:drop-shadow(1px 0 rgba(0,0,0,.3))}[aria-label][data-tooltip-pos][data-tooltip-pos=left]:after,[aria-label][data-tooltip-pos][data-tooltip-pos=left]:before{right:calc(100% - var(--tooltip-arrow-size, 6px)/2);top:50%;transform:translate(6px,-50%);transform-origin:left}[aria-label][data-tooltip-pos][data-tooltip-pos=left]:focus:after,[aria-label][data-tooltip-pos][data-tooltip-pos=left]:focus:before,[aria-label][data-tooltip-pos][data-tooltip-pos=left]:hover:after,[aria-label][data-tooltip-pos][data-tooltip-pos=left]:hover:before{transform:translateY(-50%)}.mariadb-card .card-header{display:flex;padding:16px}.mariadb-card .card-header .logo{height:40px;width:auto}.mariadb-card .card-header .info{padding-left:16px}.mariadb-card .card-header .info .name{color:var(--ha-card-header-color,--primary-text-color);font-size:22px;line-height:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mariadb-card .card-header .info .version{color:var(--secondary-text-color);font-size:14px;line-height:1;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mariadb-card .card-content{align-items:center;display:flex;justify-content:space-between;margin:0;padding:0 10px}.mariadb-card .card-content .gauge-wrap{cursor:pointer;margin:0 6px;width:132px}.mariadb-card .card-footer{border-top:1px solid var(--entities-divider-color,var(--divider-color));display:flex;justify-content:space-between;margin:16px;padding-top:16px}.mariadb-card .card-footer .database-size{align-items:center;display:flex}.mariadb-card .card-footer .database-size .icon{cursor:pointer}.mariadb-card .card-footer .database-size .icon img{height:36px;opacity:.7;transition:opacity .2s ease-in-out 0s;width:auto}.mariadb-card .card-footer .database-size .icon:hover img{opacity:.9}.mariadb-card .card-footer .database-size .value{cursor:pointer;font-size:16px;margin-left:14px}.mariadb-card .card-footer .actions{display:flex;margin-right:-8px}.mariadb-card .card-footer .actions .btn-wrap{padding:0 8px}.mariadb-card .card-footer .actions .btn-wrap.purge{--button-icon-color:var(--info-color)}.mariadb-card .card-footer .actions .btn-wrap.reload{--button-icon-color:var(--warning-color)}.mariadb-card .card-footer .actions .btn-wrap.stop{--button-icon-color:var(--error-color)}.mariadb-card .card-footer .actions .btn-wrap.start{--button-icon-color:var(--success-color)}`;

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
         * Limiting the maximum amount of RAM consumed
         * @private
         */
        this._ramLimit = 400;
        /**
         * Addon is stopped
         * @private
         */
        this._isWorks = false;
        /**
         * True if the element is connected in the DOM
         * @private
         */
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
        if (changedProps.has('hass') && ((_a = this.hass.themes) === null || _a === void 0 ? void 0 : _a.darkMode) !== this._isDark) {
            this._isDark = this.hass.themes.darkMode;
        }
    }
    async connectedCallback() {
        await super.connectedCallback();
        this._isConnected = true;
        this._addonStateUnsubscribe = await subscribeToAddonStateChange(state => (this._isWorks = state === AddonState.STARTED)).catch(error => {
            console.error(error);
            return undefined;
        });
        this._startRefreshStats();
    }
    async disconnectedCallback() {
        var _a;
        await super.disconnectedCallback();
        this._isConnected = false;
        (_a = this._addonStateUnsubscribe) === null || _a === void 0 ? void 0 : _a.call(this);
        this._stopRefreshStats();
    }
    render() {
        if (!this.hass) {
            return html ``;
        }
        const logoUrl = `/lovelace-cards/mariadb-logo-${this._isDark ? 'white' : 'dark'}.svg`;
        const isInitialized = this._cpuPercent !== undefined && this._ramPercent !== undefined && this._ramUsage !== undefined && this._ramLimit !== undefined;
        const dbSize = this._bdSize();
        return html `
      <ha-card class="mariadb-card">
        <div class="card-header">
          <img .src="${logoUrl}" class="logo" alt="MariaDB" />
          <div class="info">
            <div class="name">${this._name}</div>
            ${this._version ? html ` <div class="version">${t('common.version')}&nbsp;${this._version}</div>` : null}
          </div>
        </div>
        <div class="card-content">
          <div class="gauge-wrap" @click="${() => this._showMoreInfo(MariadbCard.cpuPercentSensor)}">
            <lc-gauge
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
              .value="${this._cpuPercent}"
              .disabled="${!this._isWorks || !isInitialized}"
            ></lc-gauge>
          </div>

          <div class="gauge-wrap" @click="${() => this._showMoreInfo(MariadbCard.ramPercentSensor)}">
            <lc-gauge
              .hass="${this.hass}"
              .label="${'RAM'}"
              .unit="${'%'}"
              .min="${0}"
              .max="${100}"
              .levels="${[{ level: 0, stroke: 'var(--info-color)' }]}"
              .value="${this._ramPercent}"
              .loading="${false}"
              .disabled="${!this._isWorks || !isInitialized}"
            ></lc-gauge>
          </div>

          <div class="gauge-wrap" @click="${() => this._showMoreInfo(MariadbCard.ramPercentSensor)}">
            <lc-gauge
              .hass="${this.hass}"
              .label="${'RAM'}"
              .unit="${'Mb'}"
              .min="${0}"
              .max="${this._ramLimit}"
              .levels="${[{ level: 0, stroke: 'var(--warning-color)' }]}"
              .value="${this._ramUsage}"
              .loading="${false}"
              .disabled="${!this._isWorks || !isInitialized}"
            ></lc-gauge>
          </div>
        </div>
        <div class="card-footer">
          <div class="database-size">
            ${dbSize
            ? html `
                  <div class="icon" data-tooltip-pos="top" aria-label="${t('mariadb.db_size')}" @click="${() => this._showMoreInfo(MariadbCard.dbSizeSensor)}">
                    <img src="/lovelace-cards/database-size.svg" alt="DB Size Icon" />
                  </div>
                  <div class="value" @click="${() => this._showMoreInfo(MariadbCard.dbSizeSensor)}">${this._bdSize()}</div>
                `
            : null}
          </div>
          <div class="actions">
            ${this._isWorks
            ? html `
                  <div class="btn-wrap purge" data-tooltip-pos="left" aria-label="${t('mariadb.purge.tooltip')}">
                    <lc-circle-button icon="mdi:database-cog" @click="${this._progress ? undefined : this._purge}" .loading="${this._progress === Action.PURGE}"></lc-circle-button>
                  </div>
                  <div class="btn-wrap reload" data-tooltip-pos="left" aria-label="${t('mariadb.reload.tooltip')}">
                    <lc-circle-button icon="mdi:restart" @click="${this._progress ? undefined : this._reload}" .loading="${this._progress === Action.RELOAD}"></lc-circle-button>
                  </div>
                  <div class="btn-wrap stop" data-tooltip-pos="left" aria-label="${t('mariadb.stop.tooltip')}">
                    <lc-circle-button icon="mdi:stop" @click="${this._progress ? undefined : this._stop}" .loading="${this._progress === Action.STOP}"></lc-circle-button>
                  </div>
                `
            : html `
                  <div class="btn-wrap start" data-tooltip-pos="left" aria-label="${t('mariadb.start.tooltip')}">
                    <lc-circle-button icon="mdi:play" @click="${this._progress ? undefined : this._start}" .loading="${this._progress === Action.START}"></lc-circle-button>
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
                this._callService('recorder', 'purge', { keep_days: 10, apply_filter: true, repack: true });
                break;
            case Action.START:
                this._callSupervisorWs('start');
                break;
            case Action.STOP:
                this._callSupervisorWs('stop');
                break;
            case Action.RELOAD:
                this._callSupervisorWs('restart');
                break;
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
        return this.hass
            .callWS(payload)
            .then((result) => {
            this._progress = undefined;
            return result;
        })
            .catch(err => {
            this._progress = undefined;
            console.error(err);
            return undefined;
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
    _showMoreInfo(entityId) {
        fireEvent(this, 'hass-more-info', { entityId });
    }
    _startRefreshStats() {
        this._stopRefreshStats();
        this._refreshStats();
    }
    _stopRefreshStats() {
        if (this._nextRefreshTimeout === undefined) {
            return;
        }
        clearTimeout(this._nextRefreshTimeout);
        this._nextRefreshTimeout = undefined;
    }
    _refreshStats() {
        const payload = {
            endpoint: `/addons/core_mariadb/stats`,
            method: 'get',
            type: 'supervisor/api',
        };
        this.hass
            .callWS(payload)
            .then(stats => {
            const oneMb = 1024 ** 2;
            this._cpuPercent = stats.cpu_percent;
            this._ramPercent = stats.memory_percent;
            this._ramUsage = Math.round((stats.memory_usage / oneMb) * 10) / 10; // RAM usage in MB
            this._ramLimit = Math.round((stats.memory_limit / oneMb) * 10) / 10; // RAM limit in MB
            if (this._isConnected) {
                this._nextRefreshTimeout = setTimeout(() => this._refreshStats(), MariadbCard.updateStatsInterval);
            }
        })
            .catch(error => {
            if (error.message && (error.message.includes('not running') || error.message.includes("Can't read stats"))) {
                return;
            }
            console.error(error);
        });
    }
    _refreshInfo() {
        const payload = {
            endpoint: `/addons/${MariadbCard.dbAddonSlug}/info`,
            method: 'get',
            type: 'supervisor/api',
        };
        this.hass
            .callWS(payload)
            .then((addonInfo) => {
            this._name = addonInfo.name;
            this._version = addonInfo.version;
            this._isWorks = addonInfo.state === AddonState.STARTED;
        })
            .catch(console.error);
    }
}
MariadbCard.styles = styles;
MariadbCard.properties = {
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
    _dialog: { state: true },
};
MariadbCard.dbSizeSensor = 'sensor.mariadb_database_size';
MariadbCard.ramPercentSensor = 'sensor.mariadb_memory_percent';
MariadbCard.cpuPercentSensor = 'sensor.mariadb_cpu_percent';
MariadbCard.dbAddonSlug = 'core_mariadb';
MariadbCard.updateStatsInterval = 2000;
customElements.define('lc-mariadb-card', MariadbCard);
// Puts card into the UI card picker dialog
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'lc-mariadb-card',
    name: t('mariadb.name'),
    description: t('mariadb.description'),
    preview: true,
    configurable: false,
});
