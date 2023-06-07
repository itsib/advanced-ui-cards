import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './area-card.scss';
import { HomeAssistant, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'types';
import { t } from 'i18n';
import { formatNumberValue } from '../../utils/format-number-value';
import './area-card-sensor';
import { fireEvent } from '../../utils/fire-event';

declare global {
  interface HTMLElementTagNameMap {
    'lc-area-card': AreaCard;
  }
}

export interface AreaCardConfig extends LovelaceCardConfig {
  name: string;
  area: string;
}

export class AreaCard extends LitElement implements LovelaceCard {
  /**
   * Home assistant instance
   */
  hass!: HomeAssistant;
  /**
   * Configuration model
   * @private
   */
  private _config!: AreaCardConfig;
  /**
   * Found entities IDs displayed in card header
   * @private
   */
  private _climaticSensors: string[] = [];

  static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./area-config');
    return document.createElement('lc-area-config') as LovelaceCardEditor;
  }

  static async getStubConfig(hass: HomeAssistant): Promise<AreaCardConfig> {
    const area = Object.values(hass.areas)[0];
    return {
      type: 'custom:lc-area-card',
      name: '',
      area: area?.area_id ?? '',
    };
  }

  /**
   * Sensors displayed in card header
   */
  static climaticSensorDeviceClasses = ['temperature', 'humidity', 'pressure'];

  static styles = styles;

  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _climaticSensors: { state: true },
  };

  setConfig(config: AreaCardConfig): void {
    this._config = config;
  }

  getCardSize(): number {
    return 3;
  }

  willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);

    if (changed.has('_config')) {
      this._updateEntities();
    }
  }

  render(): TemplateResult {
    if (!this.hass || !this._config.area) {
      return html``;
    }

    const areaName = this._config.name || this.hass.areas[this._config.area]?.name;

    return html`
      <ha-card class="area-card">
        <div class="card-header">
          <div class="place-logo">
            <img src="/lovelace-cards/home.svg" alt="Place Icon" />
          </div>
          <div class="place-info">
            <div class="name">${areaName}</div>
            <div class="climate">
              ${this._climaticSensors.map(entity => {
                return html`<lc-area-card-sensor .hass="${this.hass}" .entity="${entity}" @click="${() => this._showMoreInfo(entity)}"></lc-area-card-sensor>`;
              })}
            </div>
          </div>
        </div>
        <div class="card-content"></div>
        <div class="card-footer"></div>
      </ha-card>
    `;
  }

  /**
   * The update entities should be called after config change
   * @private
   */
  private _updateEntities(): void {
    if (!this._config.area) {
      this._climaticSensors = [];
      return;
    }

    const areaDevices = Object.keys(this.hass.devices).filter(id => this.hass.devices[id].area_id === this._config.area);
    const climaticSensors = new Array<string | undefined>(AreaCard.climaticSensorDeviceClasses.length);

    console.log(areaDevices);
    console.log(this.hass);

    climaticSensors.fill(undefined);

    for (const entityId in this.hass.entities) {
      const entity = this.hass.entities[entityId];
      if ((entity.area_id && entity.area_id === this._config.area) || (entity.device_id && areaDevices.includes(entity.device_id))) {
        const state = this.hass.states[entity.entity_id];
        const index = state.attributes.device_class ? AreaCard.climaticSensorDeviceClasses.indexOf(state.attributes.device_class) : -1;
        if (index >= 0) {
          climaticSensors[index] = entity.entity_id;
        }
      }
    }

    this._climaticSensors = climaticSensors.filter(Boolean) as string[];
  }

  /**
   * Open the more info dialog for entity id
   * @param entityId
   * @private
   */
  private _showMoreInfo(entityId: string): void {
    fireEvent(this, 'hass-more-info', { entityId });
  }
}

(window as any).customElements.define('lc-area-card', AreaCard);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'lc-area-card',
  name: t('area.name'),
  preview: false,
  description: t('area.description'),
});
