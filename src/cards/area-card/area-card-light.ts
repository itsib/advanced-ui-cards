import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './area-card-light.scss';
import { HassLightColorMode, HassLightEntityStateAttributes, HomeAssistant } from 'types';

// const roomLightEntity: HassEntity = {
//   area_id: 'gostinaia',
//   entity_id: 'light.room_light',
//   device_id: '8321c25913f9190c5f6f9bc87485263b',
//   platform: 'mqtt',
// };
//
// const roomLightState: HassEntityState = {
//   entity_id: 'light.room_light',
//   state: 'on', // off | on
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
    'lc-area-card-light': AreaCardLight;
  }
}

const COLOR_SUPPORTING: HassLightColorMode[] = [HassLightColorMode.HS, HassLightColorMode.XY, HassLightColorMode.RGB, HassLightColorMode.RGBW, HassLightColorMode.RGBWW];

const BRIGHTNESS_SUPPORTING: HassLightColorMode[] = [...COLOR_SUPPORTING, HassLightColorMode.COLOR_TEMP, HassLightColorMode.BRIGHTNESS, HassLightColorMode.WHITE];

interface Brightness {
  value: number;
  min: number;
  max: number;
}

export class AreaCardLight extends LitElement {
  /**
   * Home assistant instance
   */
  hass!: HomeAssistant;
  /**
   * Sensor entity ID
   */
  entity!: string;
  /**
   * The light is on
   * @private
   */
  private _lightIsOn?: boolean;
  /**
   * Brightness settings (If supported)
   * @private
   */
  private _brightness?: Brightness;
  /**
   * Color temperature settings (If supported)
   * @private
   */
  private _colorTemp?: Brightness;

  static properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
    _lightIsOn: { state: true },
    _brightness: { state: true },
    _colorTemp: { state: true },
  };

  static styles = styles;

  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
  }

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (changed.has('entity') || changed.has('hass')) {
      const states = { ...this.hass.states };
      const state = this.hass && this.entity && this.entity in states ? states[this.entity] : undefined;
      const attributes = state ? (state.attributes as HassLightEntityStateAttributes) : undefined;

      if (state && attributes) {
        const lightIsOn = state.state === 'on';
        if (lightIsOn !== this._lightIsOn) {
          this._lightIsOn = lightIsOn;
        }

        if (attributes.supported_color_modes?.some(mode => BRIGHTNESS_SUPPORTING.includes(mode))) {
          const brightness = attributes.brightness || 0;
          if (!this._brightness || this._brightness.value !== brightness) {
            this._brightness = {
              value: brightness > 255 ? 255 : brightness,
              min: 0,
              max: 255,
            };
          }
        }
      } else {
        this._lightIsOn = undefined;
        this._brightness = undefined;
      }
    }
  }

  render(): TemplateResult {
    return html`
      <div class="area-card-light">
        ${this._brightness
          ? html`
              <div class="brightness-control">
                <lc-round-slider
                  .hass="${this.hass}"
                  .value="${this._brightness.value}"
                  .min="${this._brightness.min}"
                  .max="${this._brightness.max}"
                  .disabled="${!this._lightIsOn}"
                  @value-changed="${this._brightnessChange}"
                ></lc-round-slider>
              </div>
            `
          : undefined}
      </div>
    `;
  }

  private _brightnessChange(event: CustomEvent): void {
    const brightness = event.detail.value;

    this.hass.callService('light', 'turn_on', { brightness }, { entity_id: this.entity }).catch(console.error);
  }
}

(window as any).customElements.define('lc-area-card-light', AreaCardLight);
