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
  private _state?: 'on' | 'off' | string;
  /**
   * Brightness in percentage
   * @private
   */
  private _brightness?: number;
  /**
   * Brightness min and max bound.
   * If undefined, then brightness is not support.
   * @private
   */
  private _brightnessBound?: [number, number];

  static properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
    _state: { state: true },
    _brightness: { state: true, type: Number },
    _brightnessBound: { state: true },
    _rgbColor: { state: true, type: String },
  };

  static styles = styles;

  willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);

    if (changed.has('entity') || changed.has('hass')) {
      const state = this._getLightState();

      if (state) {
        if (this._state !== state.state) {
          this._state = state.state;
        }

        // Update brightness
        if (state.attributes.supported_color_modes?.some(mode => BRIGHTNESS_SUPPORTING.includes(mode))) {
          if (!this._brightnessBound) {
            this._brightnessBound = [0, 255];
          }
          if (this._brightness !== state.attributes.brightness) {
            this._brightness = state.attributes.brightness;
          }
        }
      } else {
        this._state = undefined;
        this._brightness = undefined;
        this._brightnessBound = undefined;
      }
    }
  }

  render(): TemplateResult {
    const state = this._getLightState();
    if (!state) {
      return html``;
    }

    const isOn = this._state === 'on' && (!this._brightnessBound || !!this._brightness);

    return html`
      <div class="area-card-light">
        ${this._brightnessBound
          ? html`
              <div class="slider-block">
                <lc-vertical-slider
                  class="slider brightness"
                  .value="${this._brightness}"
                  .min="${this._brightnessBound[0]}"
                  .max="${this._brightnessBound[1]}"
                  @change="${this._brightnessChange}"
                ></lc-vertical-slider>
                <ha-icon
                  class="icon"
                  .icon=${isOn ? 'mdi:lightbulb' : 'mdi:lightbulb-off'}
                  .style="${isOn ? `filter: brightness(${(this._brightness! + 245) / 5}%);` : 'color: var(--secondary-text-color)'}"
                ></ha-icon>
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
   * Light toggle
   * @private
   */
  private _onoffChange(): void {
    const service = this._state ? 'turn_off' : 'turn_on';

    this.hass.callService('light', service, {}, { entity_id: this.entity }).catch(console.error);
  }
}

(window as any).customElements.define('lc-area-card-light', AreaCardLight);
