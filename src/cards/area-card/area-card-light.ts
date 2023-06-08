import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './area-card-light.scss';
import { HassLightColorMode, HassLightEntityStateAttributes, HomeAssistant } from 'types';
import { waitElement } from '../../utils/wait-element';

declare global {
  interface HTMLElementTagNameMap {
    'lc-area-card-light': AreaCardLight;
  }
}

const COLOR_SUPPORTING: HassLightColorMode[] = [HassLightColorMode.HS, HassLightColorMode.XY, HassLightColorMode.RGB, HassLightColorMode.RGBW, HassLightColorMode.RGBWW];

const BRIGHTNESS_SUPPORTING: HassLightColorMode[] = [...COLOR_SUPPORTING, HassLightColorMode.COLOR_TEMP, HassLightColorMode.BRIGHTNESS, HassLightColorMode.WHITE];

interface SliderState {
  value: number;
  percent: number;
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
   * Brightness in percentage
   * @private
   */
  private _brightnessPercent?: number;
  /**
   * Color temperature recalculated as a percentage
   * @private
   */
  private _colorTempPercent?: number;

  static properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
    _lightIsOn: { state: true },
    _brightnessPercent: { state: true },
    _colorTempPercent: { state: true },
  };

  static styles = styles;

  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
  }

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (changed.has('entity') || changed.has('hass')) {
      const states = { ...this.hass.states /*, 'light.room_light': ENTITY_LIGHT_STATE*/ };
      const state = this.hass && this.entity && this.entity in states ? states[this.entity] : undefined;
      const attributes = state ? (state.attributes as HassLightEntityStateAttributes) : undefined;

      if (state && attributes) {
        const lightIsOn = state.state === 'on';
        if (lightIsOn !== this._lightIsOn) {
          this._lightIsOn = lightIsOn;
        }

        if (attributes.supported_color_modes?.some(mode => BRIGHTNESS_SUPPORTING.includes(mode))) {
          let brightness = attributes.brightness || 0;
          brightness = brightness > 255 ? 255 : brightness;
          const percent = Math.floor((brightness / 255) * 100);

          if (this._brightnessPercent !== percent) {
            this._brightnessPercent = percent;
          }
        }

        if ((attributes.color_mode && attributes.color_mode === HassLightColorMode.COLOR_TEMP) || attributes.supported_color_modes?.includes(HassLightColorMode.COLOR_TEMP)) {
          const min = attributes.min_color_temp_kelvin || 2000;
          const max = attributes.max_color_temp_kelvin || 6500;
          const value = attributes.color_temp_kelvin || 2000;
          const percent = Math.floor((value / (max - min)) * 100);

          if (this._colorTempPercent !== percent) {
            this._colorTempPercent = percent;
          }
        }
      } else {
        this._lightIsOn = undefined;
        this._brightnessPercent = undefined;
        this._colorTempPercent = undefined;
      }
    }
  }

  updated(changed: PropertyValues) {
    super.updated(changed);

    if (changed.has('_brightnessPercent') && changed.get('_brightnessPercent') === undefined && this._brightnessPercent !== undefined) {
      this._updateSliderStyles();
    }
  }

  render(): TemplateResult {
    return html`
      <div class="area-card-light">
        <mwc-icon-button @click="${this._onoffChange}">
          <ha-icon icon=${this._lightIsOn ? 'mdi:lightbulb-multiple' : 'mdi:lightbulb-multiple-off'} class="icon"></ha-icon>
        </mwc-icon-button>

        ${this._brightnessPercent !== undefined
          ? html` <ha-slider step="1" .min="${0}" .max="${100}" .value="${this._brightnessPercent}" .expand="${true}" pin @change=${this._brightnessChange}></ha-slider> `
          : ''}
      </div>
    `;
  }

  /**
   * Access slider and update styles
   * @private
   */
  private _updateSliderStyles(): void {
    waitElement(this, 'ha-slider', true)
      .then(haSlider => {
        if (haSlider) {
          haSlider.style.width = 'var(--paper-slider-width)';
        }
        return waitElement(haSlider, 'paper-progress', true);
      })
      .then(paperProgress => waitElement(paperProgress, '#progressContainer', true))
      .then(container => {
        if (!container) {
          return;
        }
        container.style.borderRadius = '2px';
        container.style.overflow = 'hidden';
      })
      .catch(console.error);
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
   * Light toggle
   * @private
   */
  private _onoffChange(): void {
    const service = this._lightIsOn ? 'turn_off' : 'turn_on';
    this._lightIsOn = !this._lightIsOn;

    this.hass.callService('light', service, {}, { entity_id: this.entity }).catch(console.error);
  }
}

(window as any).customElements.define('lc-area-card-light', AreaCardLight);
