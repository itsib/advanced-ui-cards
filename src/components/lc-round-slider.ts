import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './lc-round-slider.scss';
import { HomeAssistant } from 'types';

declare global {
  interface HTMLElementTagNameMap {
    'lc-round-slider': LcRoundSlider;
  }
}

let THERMOSTAT_PROMISE: Promise<void>;

async function waitThermostat(hass: HomeAssistant): Promise<void> {
  if (!THERMOSTAT_PROMISE) {
    THERMOSTAT_PROMISE = window.loadCardHelpers().then(helpers => {
      const entity = Object.keys(hass.entities).find(id => id.startsWith('climate.'));
      helpers.createCardElement({ type: 'thermostat', entity });
    });
  }
  return THERMOSTAT_PROMISE;
}

export class LcRoundSlider extends LitElement {
  /**
   * Home assistant instance
   */
  hass!: HomeAssistant;

  value?: number;

  min?: number;

  max?: number;

  disabled?: boolean;

  static properties = {
    hass: { attribute: true },
    value: { attribute: true, type: Number },
    min: { attribute: true, type: Number },
    max: { attribute: true, type: Number },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
  };

  static styles = styles;

  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    waitThermostat(this.hass).catch(console.error);
  }

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
  }

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }
    return html` <round-slider .value="${this.value}" .min="${this.min}" .max="${this.max}" .disabled="${this.disabled}"></round-slider> `;
  }
}

(window as any).customElements.define('lc-round-slider', LcRoundSlider);
