import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './area-card.scss';
import { HomeAssistant, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'types';
import { t } from 'i18n';
import './area-card-sensor';
import './area-card-light';
import './area-card-conditioner';
import { fireEvent } from '../../utils/fire-event';

// const roomLightEntity: HassEntity = {
//   area_id: 'gostinaia',
//   entity_id: 'light.room_light',
//   device_id: '8321c25913f9190c5f6f9bc87485263b',
//   platform: 'mqtt',
// };
//
// const roomLightState: HassEntityState = {
//   entity_id: 'light.room_light',
//   state: 'on',
//   attributes: {
//     min_color_temp_kelvin: 2702,
//     max_color_temp_kelvin: 6535,
//     min_mireds: 153,
//     max_mireds: 370,
//     supported_color_modes: ['color_temp'],
//     color_mode: 'color_temp',
//     brightness: 255,
//     color_temp_kelvin: 6535,
//     color_temp: 153,
//     hs_color: [54.768, 1.6],
//     rgb_color: [255, 254, 250],
//     xy_color: [0.326, 0.333],
//     friendly_name: 'Room Light',
//     supported_features: 40,
//   },
//   context: {
//     id: '01H2AZVF421ZN12KSMAWJQ3CY8',
//     parent_id: null,
//     user_id: '59a8c2221cae43adb33c28cf6b0c2622',
//   },
//   last_changed: '2023-06-07T12:17:17.074Z',
//   last_updated: '2023-06-07T13:13:34.170Z',
// };

declare global {
  interface HTMLElementTagNameMap {
    'lc-area-card': AreaCard;
  }
}

enum RemoteEntityIndex {
  LIGHT,
  CONDITIONER,
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
  private _headerEntities: (string | undefined)[] = [];
  /**
   * Entities that can be controlled or configured. Hood, light, air conditioning, etc.
   * @private
   */
  private _remoteEntities: (string | undefined)[] = [];

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
  static headerEntitiesDeviceClasses = ['temperature', 'humidity', 'pressure'];

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
              ${this._headerEntities.map(entity => {
                return entity ? html`<lc-area-card-sensor .hass="${this.hass}" .entity="${entity}" @click="${() => this._showMoreInfo(entity)}"></lc-area-card-sensor>` : undefined;
              })}
            </div>
          </div>
        </div>
        <div class="card-content">
          ${this._remoteEntities.map((entity, index) => {
            if (entity && index === RemoteEntityIndex.LIGHT) {
              return html`<lc-area-card-light .hass="${this.hass}" .entity="${entity}"></lc-area-card-light>`;
            }
            if (entity && index === RemoteEntityIndex.CONDITIONER) {
              return html`<lc-area-card-conditioner .hass="${this.hass}" .entity="${entity}"></lc-area-card-conditioner>`;
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
  private _updateEntities(): void {
    if (!this._config.area) {
      this._headerEntities = [];
      return;
    }

    const areaDevices = Object.keys(this.hass.devices).filter(id => this.hass.devices[id].area_id === this._config.area);

    this._headerEntities = new Array<string | undefined>(AreaCard.headerEntitiesDeviceClasses.length);
    this._headerEntities.fill(undefined);

    this._remoteEntities = new Array<string | undefined>(1);
    this._remoteEntities.fill(undefined);

    const entities = { ...this.hass.entities };
    const states = { ...this.hass.states };

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
