import { html, LitElement, PropertyValues } from 'lit';
import { HomeAssistant, LovelaceCard } from 'types';
import { t } from 'i18n';
import styles from './mariadb-card.scss';
import { formatNumberValue } from '../../utils/format-number-value';

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
    'dc-mariadb-card': MariadbCard;
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

  private _cpuPercent?: number;

  private _ramPercent?: number;

  private _ramUsage?: number;

  private _ramLimit = 4000;
  /**
   * Is enabled dark theme
   * @private
   */
  private _dark?: boolean;
  /**
   * Addon is stopped
   * @private
   */
  private _works = false;
  /**
   * Card is initialized
   * @private
   */
  private _initialized = false;
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

  private _nextRefreshTimeout?: NodeJS.Timeout;

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
    _dark: { state: true, type: Boolean },
    _initialized: { state: true, type: Boolean },
    _works: { state: true, type: Boolean },
    _progress: { state: true, type: String },
    _dialog: { state: true },
  };

  static dbSizeSensor = 'sensor.mariadb_database_size';

  static dbAddonSlug = 'core_mariadb';

  static updateStatsInterval = 2000;

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
      .callWS<AddonInfo>(payload)
      .then(addonInfo => {
        this._name = addonInfo.name;
        this._version = addonInfo.version;
        this._works = addonInfo.state === AddonState.STARTED;
      })
      .catch(console.error);
  }

  willUpdate(changedProps: PropertyValues): void {
    super.willUpdate(changedProps);

    if (!this.hass) {
      return;
    }

    if (changedProps.has('hass')) {
      const isDark = !!this.hass.themes?.darkMode;
      if (isDark !== this._dark) {
        this._dark = isDark;
      }
    }

    if (changedProps.has('_works')) {
      if (this._works) {
        this._refreshStats();
      } else if (this._nextRefreshTimeout) {
        clearTimeout(this._nextRefreshTimeout);
        this._nextRefreshTimeout = undefined;
      }
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    this._addonStateUnsubscribe = await subscribeToAddonStateChange(state => {
      console.log('Addon State', state);
      this._works = state === AddonState.STARTED;
    }).catch(error => {
      console.error(error);
      return undefined;
    });

    if (this._works) {
      this._refreshStats();
    }
  }

  async disconnectedCallback() {
    await super.disconnectedCallback();

    this._addonStateUnsubscribe?.();

    if (this._nextRefreshTimeout) {
      clearTimeout(this._nextRefreshTimeout);
      this._nextRefreshTimeout = undefined;
    }
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    const logoUrl = `/lovelace-cards/mariadb-logo-${this._dark ? 'white' : 'dark'}.svg`;

    const dbSize = this._bdSize();

    return html`
      <ha-card class="mariadb-card">
        <div class="card-header">
          <img .src="${logoUrl}" class="logo" alt="MariaDB" />
          <div class="info">
            <div class="name">${this._name}</div>
            ${this._version ? html`<div class="version">${t('common.version')}&nbsp;${this._version}</div>` : null}
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
              .value="${this._cpuPercent}"
              .loading="${false}"
              .disabled="${!this._works || !this._initialized}"
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
              .value="${this._ramPercent}"
              .loading="${false}"
              .disabled="${!this._works || !this._initialized}"
            ></dc-gauge>
          </div>

          <div class="gauge-wrap">
            <dc-gauge
              .hass="${this.hass}"
              .label="${'RAM'}"
              .unit="${'Mb'}"
              .min="${0}"
              .max="${this._ramLimit}"
              .levels="${[{ level: 0, stroke: 'var(--warning-color)' }]}"
              .value="${this._ramUsage}"
              .loading="${false}"
              .disabled="${!this._works || !this._initialized}"
            ></dc-gauge>
          </div>
        </div>
        <div class="card-footer">
          <div class="database-size">
            ${dbSize
              ? html`
                  <div data-tooltip-pos="top" aria-label="${t('mariadb.db_size')}">
                    <img class="icon" src="/lovelace-cards/database-size-2.svg" alt="DB Icon" />
                    <div class="value">${this._bdSize()}</div>
                  </div>
                `
              : null}
          </div>
          <div class="actions">
            ${this._works
              ? html`
                  <div class="btn-wrap purge" data-tooltip-pos="left" aria-label="${t('mariadb.purge.tooltip')}">
                    <dc-circle-button icon="mdi:database-cog" @click="${this._progress ? undefined : this._purge}" .loading="${this._progress === Action.PURGE}"></dc-circle-button>
                  </div>
                  <div class="btn-wrap reload" data-tooltip-pos="left" aria-label="${t('mariadb.reload.tooltip')}">
                    <dc-circle-button icon="mdi:restart" @click="${this._progress ? undefined : this._reload}" .loading="${this._progress === Action.RELOAD}"></dc-circle-button>
                  </div>
                  <div class="btn-wrap stop" data-tooltip-pos="left" aria-label="${t('mariadb.stop.tooltip')}">
                    <dc-circle-button icon="mdi:stop" @click="${this._progress ? undefined : this._stop}" .loading="${this._progress === Action.STOP}"></dc-circle-button>
                  </div>
                `
              : html`
                  <div class="btn-wrap start" data-tooltip-pos="left" aria-label="${t('mariadb.start.tooltip')}">
                    <dc-circle-button icon="mdi:play" @click="${this._progress ? undefined : this._start}" .loading="${this._progress === Action.START}"></dc-circle-button>
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
        this._callSupervisorWs('start').then(() => this._refreshStats());
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

  private _refreshStats() {
    if (this._nextRefreshTimeout !== undefined) {
      clearTimeout(this._nextRefreshTimeout);
      this._nextRefreshTimeout = undefined;
    }

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
        this._ramUsage = Math.round((stats.memory_usage / oneMb) * 10) / 10; // RAM usege in MB

        if (this._ramUsage > this._ramLimit) {
          this._ramLimit = Math.round((stats.memory_limit / oneMb) * 10) / 10; // RAM limit in MB
        }

        if (!this._initialized) {
          this._initialized = true;
        }

        this._nextRefreshTimeout = setTimeout(() => this._refreshStats(), MariadbCard.updateStatsInterval);
      })
      .catch(error => {
        if (error.message && (error.message.includes('not running') || error.message.includes("Can't read stats"))) {
          return;
        }
        console.error(error);
      });
  }
}

customElements.define('dc-mariadb-card', MariadbCard);

// Puts card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'dc-mariadb-card',
  name: t('mariadb.name'),
  description: t('mariadb.description'),
  preview: false,
  configurable: false,
});
