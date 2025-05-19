import { html, LitElement, TemplateResult } from 'lit';
import {
  type EntityConfig,
  HomeAssistant,
  IButtonConfigSchema,
  IEntityConfigSchema,
  IGaugeConfigSchema,
  LovelaceCard,
  LovelaceCardEditor,
  LovelaceRowConfig,
} from 'types';
import { customElement, property, state } from 'lit/decorators.js';
import { findEntities, processEntities, processGauges } from '../../utils/entities-utils';
import type { IServiceCardConfigSchema } from './universal-card-schema';
import { getNumberValueWithUnit } from '../../utils/format-number-value';
import { formatEntityName } from '../../utils/format-entity-name';
import { mainWindow } from '../../utils/get-main-window';
import styles from './universal-card.scss';

@customElement('lc-universal-card')
class UniversalCard extends LitElement implements LovelaceCard {
  static async getConfigElement(): Promise<LovelaceCardEditor> {
    const source = await customElements.whenDefined('hui-entities-card') as any;
    await source.getConfigElement();

    return document.createElement('lc-universal-card-config') as LovelaceCardEditor;
  }

  static getStubConfig(hass: HomeAssistant, entities: string[], entitiesFallback: string[]) {
    const gaugesEntities = findEntities(
      hass,
      2,
      entities,
      entitiesFallback,
      ['sensor'],
      entity => /^\d+(:?\.\d+)?$/.test(entity.state),
    );

    return {
      gauges: gaugesEntities.map(entity => ({
        entity: entity,
      })),
      entities: findEntities(hass, 1, entities, entitiesFallback),
      buttons: [
        { color: 'info', icon: 'mdi:reload', action: 'homeassistant.reload_all' },
      ],
    };
  }

  static styles = styles;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: IServiceCardConfigSchema;

  @state() private _createRowElement?: (config: LovelaceRowConfig) => HTMLElement;

  private _configEntities?: IEntityConfigSchema[];

  private _configGauges?: IGaugeConfigSchema[];

  private _configButtons?: IButtonConfigSchema[];

  async setConfig(config: IServiceCardConfigSchema) {
    this._config = config;

    this._configGauges = processGauges(config.gauges);
    this._configEntities = processEntities(config.entities);
    this._configButtons = config.buttons;

    if (!this._createRowElement) {
      const utils = await mainWindow.loadCardHelpers();
      this._createRowElement = utils.createRowElement;
    }
  }

  getCardSize(): number {
    if (!this._config) {
      return 0;
    }

    return (this._config.title ? 2 : 0) + (this._config.entities?.length || 1);
  }

  render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    return html`
      <ha-card>
        ${this._renderHeader()}
        ${this._renderGauges()}
        ${this._renderEntities()}
        ${this._renderButtons()}
      </ha-card>
    `;
  }

  private _renderHeader(): TemplateResult {
    if (!this._config?.title && !this._config?.icon) {
      return html``;
    }


    return html`
      <h1 class="card-header">
        <div class="name">
          ${this._config.icon ? html`
            <ha-icon class="icon" .icon=${this._config.icon}></ha-icon>` : null}
          <span>${this._config.title}</span>
        </div>
      </h1>
    `;
  }

  private _renderGauges(): TemplateResult {
    if (!this._configGauges || !this._configGauges.length) {
      return html``;
    }
    const entities = this._configGauges.map(entity => this._renderGauge(entity));

    return html`
      <div class="card-gauges">${entities}</div>`;
  }

  private _renderGauge(_entity: IGaugeConfigSchema): TemplateResult {
    const entityObj = this.hass!.entities[_entity.entity];
    const { value, unit } = getNumberValueWithUnit(_entity, this.hass!);
    const step = _entity.step == null && entityObj.display_precision != null && (1 / (10 ** entityObj.display_precision)) || undefined;

    return html`
      <div class="gauge-wrap">
        <lc-gauge
          .label="${_entity.name || formatEntityName(_entity.entity, this.hass!)}"
          .unit="${_entity.unit || unit}"
          .min="${_entity.min}"
          .max="${_entity.max}"
          .step="${_entity.step || step}"
          .digits="${_entity.digits}"
          .levels="${_entity.levels}"
          .value=${value || 0}
          .disabled=${value == null}
        ></lc-gauge>
      </div>`;
  }

  private _renderEntities(): TemplateResult {
    if (!this._configEntities) {
      return html``;
    }
    const entities = this._configEntities.map((entityConf) => this._renderEntity(entityConf));

    return html`
      <div id="states" class="card-entities">${entities}</div>`;
  }

  private _renderEntity(entityConf: IEntityConfigSchema): TemplateResult {
    if (!this._createRowElement) return html``;
    let config: EntityConfig;

    // Conditional entity state
    if (!('type' in entityConf) && 'state_color' in this._config!) {
      config = { state_color: this._config.state_color, ...(entityConf as EntityConfig) } as EntityConfig;
    }
    // Simple entity
    else {
      config = { ...entityConf } as EntityConfig;
    }

    const element = this._createRowElement?.(config);
    if (this.hass) {
      (element as any).hass = this.hass;
    }

    return html`
      <div>${element}</div>`;
  }

  private _renderButtons(): TemplateResult {
    if (!this._configButtons) {
      return html``;
    }

    return html`
      <lc-footer-buttons
        .hass=${this.hass}
        .buttons=${this._configButtons}
      ></lc-footer-buttons>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-universal-card': UniversalCard;
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'lc-universal-card',
  name: 'Extended Card',
  description: 'The universal card supports displaying many kinds of UI elements in one place. For example, if you need to display the status in the form of a row and a gauge with action buttons.',
  preview: true,
  configurable: true,
});
