import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './lc-gauge.scss';
import { HomeAssistant } from 'types';
import { waitElement } from '../utils/wait-element';
import { formatNumberValue } from '../utils/format-number-value';

declare global {
  interface HTMLElementTagNameMap {
    'lc-gauge': LcGauge;
  }
}

let GAUGE_PROMISE: Promise<void>;

async function waitGauge(hass: HomeAssistant): Promise<void> {
  if (!GAUGE_PROMISE) {
    GAUGE_PROMISE = window.loadCardHelpers().then(helpers => {
      const entity = Object.keys(hass.entities).find(id => id.startsWith('sensor.'));
      helpers.createCardElement({ type: 'gauge', entity });
    });
  }
  return GAUGE_PROMISE;
}

export class LcGauge extends LitElement {
  /**
   * Home assistant instance
   */
  hass!: HomeAssistant;
  /**
   * Gauge label (bottom)
   */
  label = '';
  /**
   * Unit of measurement
   */
  unit = '';
  /**
   * Min value scale
   */
  min = 0;
  /**
   * Max value scale
   */
  max = 100;
  /**
   * Colorized levels
   */
  levels?: { level: number; stroke: string }[];
  /**
   * Displayed value
   */
  value?: number;
  /**
   * Disable gauge
   */
  disabled = false;
  /**
   * Inner value
   * @private
   */
  private _value = 0;
  /**
   * Previous disabled state
   * @private
   */
  private _disabled = false;
  /**
   * Enable animation is running
   * @private
   */
  private _animated = false;
  /**
   * Animation timeout
   * @private
   */
  private _animationTimeout?: NodeJS.Timeout;

  static properties = {
    hass: { attribute: true },
    label: { attribute: true, type: String },
    unit: { attribute: true, type: String },
    min: { attribute: true, type: Number },
    max: { attribute: true, type: Number },
    levels: { attribute: true },
    value: { attribute: true, type: Number },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
    _value: { state: true, type: Number },
    _animated: { state: true, type: Boolean },
  };

  static styles = styles;

  firstUpdated(changed: PropertyValues): void {
    super.firstUpdated(changed);

    waitGauge(this.hass);

    waitElement(this, 'ha-gauge', true)
      .then(element => waitElement(element, 'svg.text', true))
      .then(element => {
        if (element) {
          element.style.visibility = 'hidden';
        }
      });
  }

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (changed.has('disabled')) {
      if (this.disabled) {
        this._animated = false;
        if (this._animationTimeout) {
          clearTimeout(this._animationTimeout);
        }
      } else if (this._disabled !== this.disabled) {
        this._animated = true;
        this._value = this.max;

        this._animationTimeout = setTimeout(() => {
          this._value = this.min;

          this._animationTimeout = setTimeout(() => {
            this._value = this.value ?? 0;
            this._animated = false;
            this._animationTimeout = undefined;
          }, 1100);
        }, 1100);
      }
      this._disabled = this.disabled;
    }

    if ((changed.has('value') || changed.has('disabled')) && !this.disabled && !this._animated && this._value !== this.value) {
      this._value = this.value ?? 0;
    }

    if ((changed.has('min') || changed.has('disabled')) && this.disabled && !this._animated && this._value !== this.min) {
      this._value = this.min;
    }
  }

  render(): TemplateResult {
    const disabled = this.disabled || this.value === undefined;

    return html`
      <div class="${`lc-gauge ${disabled ? 'disabled' : ''}`}">
        <div class="${`gauge ${this._animated ? 'animated' : ''}`}">
          <ha-gauge .min="${this.min}" .max="${this.max}" .value="${this._value}" .needle="${true}" .levels="${this.levels}" .locale="${this.hass.locale}"></ha-gauge>
        </div>
        <div class="value">${this._formatValue()}</div>
        <div class="label">${this.label}</div>
      </div>
    `;
  }

  private _formatValue(): string {
    if (this.disabled || this._animated || this._value === undefined || isNaN(this._value)) {
      return `--${this.unit}`;
    }
    return `${formatNumberValue(this.hass, this.value)}${this.unit}`;
  }
}

(window as any).customElements.define('lc-gauge', LcGauge);
