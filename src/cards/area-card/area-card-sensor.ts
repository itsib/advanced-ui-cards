import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './area-card-sensor.scss';
import { HomeAssistant } from 'types';
import { formatNumberValue } from '../../utils/format-number-value';

declare global {
  interface HTMLElementTagNameMap {
    'lc-area-card-sensor': AreaCardSensor;
  }
}

export class AreaCardSensor extends LitElement {
  /**
   * Home assistant instance
   */
  hass?: HomeAssistant;
  /**
   * Sensor entity ID
   */
  entity?: string;

  private _icon?: string;

  private _value?: string;

  private _unit?: string;

  static properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
    _icon: { state: true },
    _value: { state: true },
    _unit: { state: true },
  };

  static styles = styles;

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (changed.has('entity') || changed.has('hass')) {
      if (this.hass && this.entity && this.entity in this.hass.states) {
        const state = this.hass.states[this.entity];

        this._icon = state.attributes.icon || this._getDefaultIcon(state.attributes.device_class);
        this._value = formatNumberValue(this.hass, state.state);
        this._unit = state.attributes.unit_of_measurement;
      } else {
        this._icon = undefined;
        this._value = undefined;
        this._unit = undefined;
      }
    }
  }

  render(): TemplateResult {
    if (!this._icon || !this._value) {
      return html``;
    }
    return html`
      <ha-icon .icon="${this._icon}" class="icon"></ha-icon>
      <span>${this._value}${this._value && this._unit ? ' ' + this._unit : ''}</span>
    `;
  }

  private _getDefaultIcon(deviceClass?: string): string | undefined {
    switch (deviceClass) {
      case 'temperature':
        return 'mdi:thermometer';
      case 'humidity':
        return 'mdi:water-percent';
      case 'pressure':
        return 'mdi:gauge';
      default:
        return undefined;
    }
  }
}

(window as any).customElements.define('lc-area-card-sensor', AreaCardSensor);
