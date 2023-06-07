import { html, LitElement, PropertyValues } from 'lit';
import { HomeAssistant, LovelaceCard } from 'types';
import { t } from 'i18n';
import styles from './mariadb-card.scss';
import { formatNumberValue } from '../../utils/format-number-value';
import { fireEvent } from '../../utils/fire-event';

enum Action {
  PURGE = 'purge',
  RELOAD = 'reload',
  STOP = 'stop',
  START = 'start',
}

enum AddonState {
  STARTED = 'started',
  STOPPED = 'stopped',
  RUNNING = 'running',
  UNKNOWN = 'unknown',
}

interface AddonInfo {
  name: string;
  version: string;
  state: AddonState;
}

interface AddonStats {
  cpu_percent: number;
  memory_percent: number;
  memory_usage: number;
  memory_limit: number;
}

interface ConfirmationDialogSettings {
  title: string;
  message: string;
  action: Action;
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-mariadb-card': MariadbCard;
  }
}

async function subscribeToAddonStateChange(callback) {
  const { conn } = await hassConnection;

  return await conn.subscribeMessage(
    (event: any) => {
      if (event.event === 'addon' && event.slug === MariadbCard.dbAddonSlug) {
        callback(event.state);
      }
    },
    { type: 'supervisor/subscribe' },
  );
}

class MariadbCard extends LitElement implements LovelaceCard {
  /**
   * Home assistant instance
   */
  hass!: HomeAssistant;
  /**
   * Configuration model
   * @private
   */
  config?: Record<string, any>;
  /**
   * Addon name
   * @private
   */
  private _name?: string;
  /**
   * Addon version
   * @private
   */
  private _version?: string;
  /**
   * Using CPU time by an addon (in %)
   * @private
   */
  private _cpuPercent?: number;
  /**
   * The amount of RAM used by the addon (in %)
   * @private
   */
  private _ramPercent?: number;
  /**
   * The amount of RAM used by the addon (in MB)
   * @private
   */
  private _ramUsage?: number;
  /**
   * Limiting the maximum amount of RAM consumed
   * @private
   */
  private _ramLimit?: number;
  /**
   * Is enabled dark theme
   * @private
   */
  private _isDark?: boolean;
  /**
   * Addon is stopped
   * @private
   */
  private _isWorks = false;
  /**
   * What task is being in progress
   * @private
   */
  private _progress?: Action;
  /**
   * Some action confirmation dialog
   * @private
   */
  private _dialog?: ConfirmationDialogSettings;
  /**
   * Unsubscribe addon state callback
   * @private
   */
  private _addonStateUnsubscribe?: () => {};
  /**
   * Stored refresh timer, for the cansel
   * @private
   */
  private _nextRefreshTimeout?: NodeJS.Timeout;
  /**
   * True if the element is connected in the DOM
   * @private
   */
  private _isConnected = false;

  static styles = styles;

  static properties = {
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

  static dbSizeSensor = 'sensor.mariadb_database_size';

  static ramPercentSensor = 'sensor.mariadb_memory_percent';

  static cpuPercentSensor = 'sensor.mariadb_cpu_percent';

  static dbAddonSlug = 'core_mariadb';

  static updateStatsInterval = 2000;

  setConfig(config = {}) {
    this.config = config;
  }

  getCardSize() {
    return 3;
  }

  firstUpdated(changedProps: PropertyValues): void {
    super.firstUpdated(changedProps);

    this._refreshInfo();
  }

  willUpdate(changedProps: PropertyValues): void {
    super.willUpdate(changedProps);

    if (!this.hass) {
      return;
    }

    if (changedProps.has('hass') && this.hass.themes?.darkMode !== this._isDark) {
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
    await super.disconnectedCallback();
    this._isConnected = false;

    this._addonStateUnsubscribe?.();

    this._stopRefreshStats();
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    const logoUrl = `/lovelace-cards/mariadb-logo-${this._isDark ? 'white' : 'dark'}.svg`;

    const isInitialized = this._cpuPercent !== undefined && this._ramPercent !== undefined && this._ramUsage !== undefined && this._ramLimit !== undefined;

    const dbSize = this._bdSize();

    return html`
      <ha-card class="mariadb-card">
        <div class="card-header">
          <img .src="${logoUrl}" class="logo" alt="MariaDB" />
          <div class="info">
            <div class="name">${this._name}</div>
            ${this._version ? html` <div class="version">${t('common.version')}&nbsp;${this._version}</div>` : null}
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
              ? html`
                  <div class="icon" data-tooltip-pos="top" aria-label="${t('mariadb.db_size')}" @click="${() => this._showMoreInfo(MariadbCard.dbSizeSensor)}">
                    <img src="/lovelace-cards/database-size.svg" alt="DB Size Icon" />
                  </div>
                  <div class="value" @click="${() => this._showMoreInfo(MariadbCard.dbSizeSensor)}">${this._bdSize()}</div>
                `
              : null}
          </div>
          <div class="actions">
            ${this._isWorks
              ? html`
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
              : html`
                  <div class="btn-wrap start" data-tooltip-pos="left" aria-label="${t('mariadb.start.tooltip')}">
                    <lc-circle-button icon="mdi:play" @click="${this._progress ? undefined : this._start}" .loading="${this._progress === Action.START}"></lc-circle-button>
                  </div>
                `}
          </div>
        </div>
      </ha-card>

      ${this._dialog
        ? html`
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
  private _bdSize(): string | undefined {
    if (MariadbCard.dbSizeSensor in this.hass.states) {
      const size = formatNumberValue(this.hass, this.hass.states[MariadbCard.dbSizeSensor].state);
      if (size) {
        return `${size} MB`;
      }
    }
    return undefined;
  }

  private _confirm(): void {
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

  private _callService(domain: string, service: string, serviceData: Record<string, any> = {}): void {
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

  private _callSupervisorWs<T = unknown>(endpoint: string): Promise<T | undefined> {
    const payload = {
      endpoint: `/addons/${MariadbCard.dbAddonSlug}/${endpoint}`,
      method: 'post',
      timeout: null,
      type: 'supervisor/api',
    };

    return this.hass
      .callWS<T>(payload)
      .then((result: T) => {
        this._progress = undefined;
        return result;
      })
      .catch(err => {
        this._progress = undefined;
        console.error(err);
        return undefined;
      });
  }

  private _cancel(): void {
    this._dialog = undefined;
  }

  private _purge(): void {
    this._dialog = {
      title: t('common.are_you_sure'),
      message: t('mariadb.purge.dialog'),
      action: Action.PURGE,
    };
  }

  private _reload(): void {
    this._dialog = {
      title: t('common.are_you_sure'),
      message: t('mariadb.reload.dialog'),
      action: Action.RELOAD,
    };
  }

  private _stop(): void {
    this._dialog = {
      title: t('common.are_you_sure'),
      message: t('mariadb.stop.dialog'),
      action: Action.STOP,
    };
  }

  private _start(): void {
    this._dialog = {
      title: t('common.are_you_sure'),
      message: t('mariadb.start.dialog'),
      action: Action.START,
    };
  }

  private _showMoreInfo(entityId: string): void {
    fireEvent(this, 'hass-more-info', { entityId });
  }

  private _startRefreshStats(): void {
    this._stopRefreshStats();

    this._refreshStats();
  }

  private _stopRefreshStats(): void {
    if (this._nextRefreshTimeout === undefined) {
      return;
    }
    clearTimeout(this._nextRefreshTimeout);
    this._nextRefreshTimeout = undefined;
  }

  private _refreshStats() {
    const payload = {
      endpoint: `/addons/core_mariadb/stats`,
      method: 'get',
      type: 'supervisor/api',
    };

    this.hass
      .callWS<AddonStats>(payload)
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

  private _refreshInfo() {
    const payload = {
      endpoint: `/addons/${MariadbCard.dbAddonSlug}/info`,
      method: 'get',
      type: 'supervisor/api',
    };

    this.hass
      .callWS<AddonInfo>(payload)
      .then((addonInfo: AddonInfo) => {
        this._name = addonInfo.name;
        this._version = addonInfo.version;
        this._isWorks = addonInfo.state === AddonState.STARTED;
      })
      .catch(console.error);
  }
}

customElements.define('lc-mariadb-card', MariadbCard);

// Puts card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'lc-mariadb-card',
  name: t('mariadb.name'),
  description: t('mariadb.description'),
  preview: false,
  configurable: false,
});
