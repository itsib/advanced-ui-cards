import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './area-card-light.scss';
import { HassEntityState, HassLightColorMode, HassLightEntityStateAttributes, HomeAssistant } from 'types';
import { waitElement } from '../../utils/wait-element';
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
  private _lightIsOn?: boolean;
  /**
   * Brightness in percentage
   * @private
   */
  private _brightnessPercent?: number;
  /**
   * Color temperature recalculated as a percentage
   * @private
   */
  private _colorTempKelvin?: {
    value: number;
    min: number;
    max: number;
  };

  static properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
    _lightIsOn: { state: true },
    _brightnessPercent: { state: true },
    _colorTempKelvin: { state: true },
  };

  static styles = styles;

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (changed.has('entity') || changed.has('hass')) {
      const state = this._getLightState();

      if (state) {
        const lightIsOn = state.state === 'on';
        if (lightIsOn !== this._lightIsOn) {
          this._lightIsOn = lightIsOn;
        }

        if (state.attributes.supported_color_modes?.some(mode => BRIGHTNESS_SUPPORTING.includes(mode))) {
          let brightness = state.attributes.brightness || 0;
          brightness = brightness > 255 ? 255 : brightness;
          const percent = Math.floor((brightness / 255) * 100);

          if (this._brightnessPercent !== percent) {
            this._brightnessPercent = percent;
          }
        }

        if (
          (state.attributes.color_mode && state.attributes.color_mode === HassLightColorMode.COLOR_TEMP) ||
          state.attributes.supported_color_modes?.includes(HassLightColorMode.COLOR_TEMP)
        ) {
          const value = state.attributes.min_color_temp_kelvin || 2000;
          const min = state.attributes.min_color_temp_kelvin || 2000;
          const max = state.attributes.max_color_temp_kelvin || 2000;

          if (!this._colorTempKelvin || this._colorTempKelvin.value !== value || this._colorTempKelvin.min !== min || this._colorTempKelvin.max !== max) {
            this._colorTempKelvin = { value, min, max };
          }
        }
      } else {
        this._lightIsOn = undefined;
        this._brightnessPercent = undefined;
        this._colorTempKelvin = undefined;
      }
    }
  }

  updated(changed: PropertyValues) {
    super.updated(changed);

    if (changed.has('_brightnessPercent') && changed.get('_brightnessPercent') === undefined && this._brightnessPercent !== undefined) {
      this._makeSliderPretty('.brightness-slider');
    }

    if (changed.has('_colorTempKelvin') && changed.get('_colorTempKelvin') === undefined && this._colorTempKelvin !== undefined) {
      this._makeSliderPretty('.color-temp-slider');
    }
  }

  render(): TemplateResult {
    return html`
      <div class="area-card-light">
        <mwc-icon-button @click="${this._onoffChange}" .style="${this._getLightButtonStyles()}">
          <ha-icon icon="${this._lightIsOn ? 'mdi:lightbulb-multiple' : 'mdi:lightbulb-multiple-off'}" class="icon"></ha-icon>
        </mwc-icon-button>

        ${this._brightnessPercent !== undefined
          ? html`
              <ha-slider
                class="brightness-slider"
                style="width: var(--paper-slider-width)"
                step="1"
                .min="${0}"
                .max="${100}"
                .value="${this._brightnessPercent}"
                .expand="${true}"
                pin
                @change="${this._brightnessChange}"
              ></ha-slider>
            `
          : ''}
        ${this._colorTempKelvin
          ? html`
              <ha-slider
                class="color-temp-slider"
                style="width: var(--paper-slider-width)"
                step="1"
                .min="${this._colorTempKelvin.min}"
                .max="${this._colorTempKelvin.max}"
                .value="${this._colorTempKelvin.value}"
                .expand="${true}"
                pin
                @change="${this._colorTempChange}"
              ></ha-slider>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Access slider and update styles
   * @private
   */
  private _makeSliderPretty(selector: string): void {
    waitElement(this, selector, true)
      .then(element => waitElement(element, 'paper-progress', true))
      .then(element => waitElement(element, '#progressContainer', true))
      .then(element => {
        if (!element) {
          return;
        }
        element.style.borderRadius = '2px';
        element.style.overflow = 'hidden';
      })
      .catch(console.error);
  }

  /**
   * Returns entity light state.
   * @private
   */
  private _getLightState(): LightEntityState | undefined {
    const states = { ...this.hass.states };
    return this.hass && this.entity && this.entity in states ? (states[this.entity] as LightEntityState) : undefined;
  }

  /**
   * Light button color depend from light state.
   * @private
   */
  private _getLightButtonStyles(): string {
    const state = this._getLightState();
    if (!state || state.state === 'off' || !state.attributes.brightness) {
      return '';
    }

    let styles = `filter: brightness(${(state.attributes.brightness + 245) / 5}%);`;
    if (state.attributes.rgb_color) {
      styles += `color: rgb(${state.attributes.rgb_color.join(',')});`;
    }
    return styles;
  }

  /**
   * Change brightness handler
   * @param event
   * @private
   */
  private _brightnessChange(event: CustomEvent): void {
    const brightnessPercent = Math.floor(Number(event.target?.['value']) || 0);
    const brightness = Math.round((255 / 100) * brightnessPercent);

    this.hass.callService('light', 'turn_on', { brightness }, { entity_id: this.entity }).catch(console.error);
  }

  /**
   * Change color temperature handler
   * @param event
   * @private
   */
  private _colorTempChange(event: CustomEvent): void {
    const colorTempKelvin = Math.floor(Number(event.target?.['value']) || 0);
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
