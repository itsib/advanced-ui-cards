import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { EntityConfig, HomeAssistant, LovelaceCard, LovelaceCardEditor, LovelaceRowConfig } from 'types';
import { mainWindow } from '../../utils/get-main-window';
import { findEntities, processEntities } from '../../utils/entities-utils';
import { IEntitiesCardConfigSchema } from './entities-card-schema';
import styles from './entities-card.scss';

@customElement('lc-entities-card')
class EntitiesCard extends LitElement implements LovelaceCard {
  static async getConfigElement(): Promise<LovelaceCardEditor> {
    const source = await customElements.whenDefined('hui-entities-card') as any;
    await source.getConfigElement();

    return document.createElement('lc-entities-card-config') as LovelaceCardEditor;
  }

  static getStubConfig(hass: HomeAssistant, entities: string[], entitiesFallback: string[]) {
    const maxEntities = 3;
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFallback,
      ['light', 'switch', 'sensor'],
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

  @state() private _config?: IEntitiesCardConfigSchema;

  private _configEntities?: LovelaceRowConfig[];

  private _createRowElement?: (config: LovelaceRowConfig) => HTMLElement;

  async setConfig(config: IEntitiesCardConfigSchema) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error('Entities must be specified');
    }

    const entities = processEntities<LovelaceRowConfig>(config.entities);
    const utils = await mainWindow.loadCardHelpers();

    this._config = config;
    this._configEntities = entities;
    this._createRowElement = utils.createRowElement;
  }

  getCardSize(): number {
    if (!this._config) {
      return 0;
    }

    return (this._config.title ? 2 : 0) + (this._config.entities.length || 1) + (this._config.buttons ? 2 : 0);
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    return html`
      <ha-card>
        ${this._renderHeader()}
        ${this._renderEntities()}
        ${this._renderFooter()}
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
          ${this._config.icon ? html`<ha-icon class="icon" .icon=${this._config.icon}></ha-icon>` : ''}
          ${this._config.title}
        </div>
      </h1>
    `;
  }

  private _renderFooter(): TemplateResult {
    if (!this._config?.buttons?.length) {
      return html``;
    }

    return html`
      <lc-footer-buttons
        .hass=${this.hass}
        .buttons=${this._config.buttons}
      ></lc-footer-buttons>
    `;
  }

  private _renderEntities() {
    if (!this._configEntities) {
      return html``;
    }
    const entities = this._configEntities.map((entityConf) => this._renderEntity(entityConf));

    return html`
      <div id="states" class="card-content">${entities}</div>`;
  }

  private _renderEntity(entityConf: LovelaceRowConfig): TemplateResult {
    let config: EntityConfig;

    // Conditional entity state
    if ((!('type' in entityConf) || entityConf.type === 'conditional') && 'state_color' in this._config!) {
      config = { state_color: this._config.state_color, ...(entityConf as EntityConfig) } as EntityConfig;
    }
    // Entity is action
    else if (entityConf.type === 'perform-action') {
      config = { ...entityConf, type: 'call-service' } as EntityConfig;
    }
    // Simple entity
    else {
      config = { ...entityConf } as EntityConfig;
    }

    const element = this._createRowElement!(config);
    if (this.hass) {
      (element as any).hass = this.hass;
    }

    return html`
      <div>${element}</div>`;
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'lc-entities-card',
  name: 'Entities With Actions Card',
  preview: true,
  description: 'This map allows you to group entities and actions that are triggered by buttons in the footer.',
  documentationURL: 'https://github.com/itsib/lovelace-cards/blob/main/README.md',
});