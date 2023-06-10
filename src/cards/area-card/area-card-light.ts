import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './area-card-light.scss';
import { HassEntityState, HassLightColorMode, HassLightEntityStateAttributes, HomeAssistant } from 'types';
// import { ENTITY_LIGHT_STATE } from '../../test-data/entity-light';

declare global {
  interface HTMLElementTagNameMap {
    'lc-area-card-light': AreaCardLight;
  }
}

type LightEntityState = Omit<HassEntityState, 'attributes'> & { attributes: HassLightEntityStateAttributes };

interface SliderState {
  value: number;
  min: number;
  max: number;
}

const COLOR_SUPPORTING: HassLightColorMode[] = [HassLightColorMode.HS, HassLightColorMode.XY, HassLightColorMode.RGB, HassLightColorMode.RGBW, HassLightColorMode.RGBWW];

const BRIGHTNESS_SUPPORTING: HassLightColorMode[] = [...COLOR_SUPPORTING, HassLightColorMode.COLOR_TEMP, HassLightColorMode.BRIGHTNESS, HassLightColorMode.WHITE];

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
   * Brightness in percentage
   * @private
   */
  private _brightness?: SliderState;
  /**
   * Color temperature recalculated as a percentage
   * @private
   */
  private _colorTemp?: SliderState;

  static properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
    _lightIsOn: { state: true },
    _brightness: { state: true },
    _colorTemp: { state: true },
  };

  static styles = styles;

  willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);

    if (changed.has('entity') || changed.has('hass')) {
      const state = this._getLightState();

      if (state) {
        const lightIsOn = state.state === 'on';
        if (lightIsOn !== this._lightIsOn) {
          this._lightIsOn = lightIsOn;
        }

        if (state.attributes.supported_color_modes?.some(mode => BRIGHTNESS_SUPPORTING.includes(mode))) {
          const min = 0;
          const max = 255;
          const value = state.attributes.brightness || min;

          if (!this._brightness || this._brightness.value !== value || this._brightness.min !== min || this._brightness.max !== max) {
            this._brightness = { value, min, max };
          }
        }

        if (
          (state.attributes.color_mode && state.attributes.color_mode === HassLightColorMode.COLOR_TEMP) ||
          state.attributes.supported_color_modes?.includes(HassLightColorMode.COLOR_TEMP)
        ) {
          const value = state.attributes.color_temp_kelvin || 2000;
          const min = state.attributes.min_color_temp_kelvin || 2000;
          const max = state.attributes.max_color_temp_kelvin || 6500;

          if (!this._colorTemp || this._colorTemp.value !== value || this._colorTemp.min !== min || this._colorTemp.max !== max) {
            this._colorTemp = { value, min, max };
          }
        }
      } else {
        this._lightIsOn = undefined;
        this._brightness = undefined;
        this._colorTemp = undefined;
      }
    }
  }

  render(): TemplateResult {
    const state = this._getLightState();
    if (!state) {
      return html``;
    }

    return html`
      <div class="area-card-light">
        ${this._brightness
          ? html`
              <div class="slider-block">
                <lc-vertical-slider
                  class="slider brightness"
                  .value="${this._brightness.value}"
                  .min="${this._brightness.min}"
                  .max="${this._brightness.max}"
                  @change="${this._brightnessChange}"
                ></lc-vertical-slider>
                <ha-icon
                  class="icon"
                  .icon=${this._brightness?.value ? 'mdi:lightbulb' : 'mdi:lightbulb-off'}
                  .style="${`filter: brightness(${(this._brightness.value + 245) / 5}%);`}"
                ></ha-icon>
              </div>
            `
          : null}
        ${this._colorTemp
          ? html`
              <div class="slider-block">
                <lc-vertical-slider
                  class="slider color-temp"
                  .min="${this._colorTemp.min}"
                  .max="${this._colorTemp.max}"
                  .value="${this._colorTemp.value}"
                  @change="${this._colorTempChange}"
                ></lc-vertical-slider>
                <ha-icon class="icon" icon="mdi:temperature-kelvin" .style="${state.attributes.rgb_color ? `color: rgb(${state.attributes.rgb_color.join(',')});` : ''}"></ha-icon>
              </div>
            `
          : null}
      </div>
    `;
  }

  /**
   * Returns entity light state.
   * @private
   */
  private _getLightState(): LightEntityState | undefined {
    const states = { ...this.hass.states /*, 'light.room_light': ENTITY_LIGHT_STATE*/ };
    return this.hass && this.entity && this.entity in states ? (states[this.entity] as LightEntityState) : undefined;
  }

  /**
   * Change brightness handler
   * @param event
   * @private
   */
  private _brightnessChange(event: CustomEvent): void {
    const brightness = event.detail.value;

    this.hass.callService('light', 'turn_on', { brightness }, { entity_id: this.entity }).catch(console.error);
  }

  /**
   * Change color temperature handler
   * @param event
   * @private
   */
  private _colorTempChange(event: CustomEvent): void {
    const colorTempKelvin = Math.floor(Number(event.detail?.value) || 0);

    this.hass.callService('light', 'turn_on', { color_temp_kelvin: colorTempKelvin }, { entity_id: this.entity }).catch(console.error);
  }

  /**
   * Light toggle
   * @private
   */
  private _onoffChange(): void {
    const service = this._lightIsOn ? 'turn_off' : 'turn_on';

    this.hass.callService('light', service, {}, { entity_id: this.entity }).catch(console.error);
  }
}

(window as any).customElements.define('lc-area-card-light', AreaCardLight);
