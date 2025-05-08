import { html, LitElement, TemplateResult } from 'lit';
import { EntityConfig, HomeAssistant, LovelaceCard, type LovelaceCardEditor } from 'types';
import { customElement, property, state } from 'lit/decorators.js';
import { findEntities, processEntities } from '../../utils/entities-utils';
import { IGaugeActionsCardConfigSchema } from './gauge-actions-card-schema';
import styles from './gauge-actions-card.scss';

@customElement('lc-gauge-actions-card')
class GaugeActionsCard extends LitElement implements LovelaceCard {
  static async getConfigElement(): Promise<LovelaceCardEditor> {
    const source = await customElements.whenDefined('hui-entities-card') as any;
    await source.getConfigElement();

    return document.createElement('lc-gauge-actions-card-config') as LovelaceCardEditor;
  }

  static getStubConfig(hass: HomeAssistant, entities: string[], entitiesFallback: string[]) {
    const maxEntities = 3;
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFallback,
      ['sensor'],
      entity => /^\d+(:?\.\d+)?$/.test(entity.state),
    );
    console.log(foundEntities);

    return {
      entities: foundEntities,
      buttons: [
        { color: 'info', icon: 'mdi:reload', action: 'homeassistant.reload_all' },
      ],
    };
  }

  static styles = styles;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: IGaugeActionsCardConfigSchema;

  private _configEntities?: EntityConfig[];

  async setConfig(config: IGaugeActionsCardConfigSchema) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error('Entities must be specified');
    }

    const entities = processEntities<EntityConfig>(config.entities, {
      domains: [
        'counter',
        'input_number',
        'number',
        'sensor',
        'light',
      ],
    });

    this._config = config;
    this._configEntities = entities;
  }

  getCardSize(): number {
    if (!this._config) {
      return 0;
    }

    return (this._config.title ? 2 : 0) + (this._config.entities.length || 1);
  }

  render(): TemplateResult {
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

  private _renderHeader(): TemplateResult {
    if (!this._config?.title && !this._config?.icon) {
      return html``;
    }
    const icon = this._config.icon ? html`
      <ha-icon class="icon" .icon=${this._config.icon}></ha-icon>` : '';

    return html`
      <h1 class="card-header">
        <div class="name">
          ${icon}
          ${this._config.title}
        </div>
      </h1>
    `;
  }

  private _renderEntities() {
    if (!this._configEntities) {
      return html``;
    }
    const entities = this._configEntities.map(entity => this._renderEntity(entity));

    return html`
      <div class="card-content">${entities}</div>`;
  }

  private _renderEntity(_entity: EntityConfig): TemplateResult {
    const stateObj = this.hass?.states?.[_entity.entity];
    const entityState = stateObj?.state ? Number(stateObj?.state) : undefined;
    const valueToDisplay = this._config?.attribute
      ? stateObj?.attributes[this._config.attribute]
      : stateObj?.state;

    const value = Math.round((stateObj?.attributes?.brightness ?? 0) / 255 * 1000) / 10;
    console.log(value);

    // const valueToDisplay = this._config.attribute
    //  ? stateObj.attributes[this._config.attribute]
    //  : stateObj.state;

    return html`
      <div class="gauge-wrap">
        <lc-gauge
          .hass="${this.hass}"
          .label="${'CPU'}"
          .unit="${'%'}"
          .min="${0}"
          .max="${100}"
          .levels="${[
            { level: 0, color: 'var(--success-color)' },
            { level: 20, color: 'var(--warning-color)' },
            { level: 70, color: 'var(--error-color)' },
          ]}"
          .value="${value}"
          .disabled="${true}"
        ></lc-gauge>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-gauge-actions-card': GaugeActionsCard;
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'lc-gauge-actions-card',
  name: 'Gauge With Actions Card',
  description: 'This map allows you to group three gauge and actions that are triggered by buttons in the footer.',
  preview: true,
  configurable: false,
});


// <div class="gauge-wrap" @click="${() => this._showMoreInfo(GaugeActionsCard.cpuPercentSensor)}">
//             <lc-gauge
//               .hass="${this.hass}"
//               .label="${'CPU'}"
//               .unit="${'%'}"
//               .min="${0}"
//               .max="${10}"
//               .levels="${[
//                 { level: 0, stroke: 'var(--success-color)' },
//                 { level: 2, stroke: 'var(--warning-color)' },
//                 { level: 7, stroke: 'var(--error-color)' },
//               ]}"
//               .value="${this._cpuPercent}"
//               .disabled="${!this._isWorks || !isInitialized}"
//             ></lc-gauge>
//           </div>
//
//           <div class="gauge-wrap" @click="${() => this._showMoreInfo(GaugeActionsCard.ramPercentSensor)}">
//             <lc-gauge
//               .hass="${this.hass}"
//               .label="${'RAM'}"
//               .unit="${'%'}"
//               .min="${0}"
//               .max="${100}"
//               .levels="${[{ level: 0, stroke: 'var(--info-color)' }]}"
//               .value="${this._ramPercent}"
//               .loading="${false}"
//               .disabled="${!this._isWorks || !isInitialized}"
//             ></lc-gauge>
//           </div>
//
//           <div class="gauge-wrap" @click="${() => this._showMoreInfo(GaugeActionsCard.ramPercentSensor)}">
//             <lc-gauge
//               .hass="${this.hass}"
//               .label="${'RAM'}"
//               .unit="${'Mb'}"
//               .min="${0}"
//               .max="${this._ramLimit}"
//               .levels="${[{ level: 0, stroke: 'var(--warning-color)' }]}"
//               .value="${this._ramUsage}"
//               .loading="${false}"
//               .disabled="${!this._isWorks || !isInitialized}"
//             ></lc-gauge>
//           </div>