import { html, LitElement, TemplateResult } from 'lit';
import type { HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'types';
import { customElement, property, state } from 'lit/decorators.js';
import { findEntities, processEntities } from '../../utils/entities-utils';
import type { IGaugeActionsCardConfigSchema, IGaugeEntityConfigSchema } from './gauge-actions-card-schema';
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

  private _configEntities?: IGaugeEntityConfigSchema[];

  async setConfig(config: IGaugeActionsCardConfigSchema) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error('Entities must be specified');
    }

    this._config = config;
    this._configEntities = processEntities<IGaugeEntityConfigSchema>(config.entities, { validateId: false });
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

  private _renderEntities(): TemplateResult {
    if (!this._configEntities) {
      return html``;
    }
    const entities = this._configEntities.map(entity => this._renderEntity(entity));

    return html`
      <div class="card-content">${entities}</div>`;
  }

  private _renderEntity(_entity: IGaugeEntityConfigSchema): TemplateResult {
    const stateObj = this.hass?.states?.[_entity.entity];
    const valueToDisplay = Number(_entity.attribute ? stateObj?.attributes[_entity.attribute] : stateObj?.state);

    return html`
      <div class="gauge-wrap">
        <lc-gauge
          .hass="${this.hass}"
          .label="${_entity.name}"
          .unit="${_entity.unit}"
          .min="${_entity.min}"
          .max="${_entity.max}"
          .step="${_entity.step}"
          .levels="${_entity.levels}"
          .value="${valueToDisplay || 0}"
          .disabled=${isNaN(valueToDisplay)}
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
