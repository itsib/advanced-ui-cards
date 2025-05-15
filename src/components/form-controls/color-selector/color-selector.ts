import { LitElement, TemplateResult, html } from 'lit';
import styles from './color-selector.scss';
import { customElement, property, state } from 'lit/decorators.js';
import { formatColors } from '../../../utils/format-colors';
import { fireEvent } from '../../../utils/fire-event';
import { HomeAssistant } from 'types';

const COLORS = [
  'primary',
  'accent',
  'danger',
  'warning',
  'success',
  'info',
  'disabled',
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'light-grey',
  'grey',
  'dark-grey',
  'blue-grey',
  'black',
  'white',
];

@customElement('lc-color-selector')
class ColorSelector extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: 'value', reflect: true, type: String })
  value: string = COLORS[0];

  @state()
  private _custom?: string;

  @state()
  private _errorMessage?: string;

  @state()
  get colors(): string[] {
    if (this.isMore) {
      return COLORS;
    }
    return COLORS.slice(0, 6);
  }

  @state()
  private _isMore = false;

  get isMore(): boolean {
    const index = COLORS.indexOf(this.value);
    return index > 5 ? true : this._isMore;
  }

  set isMore(value: boolean) {
    this._isMore = value;
  }

  private _prevColor?: string;

  render(): TemplateResult {
    return html`
      <div class="color-selector">
        <div class="buttons">
          ${this.colors.map((color) => html`
            <button
              type="button"
              class=${`color-button${this.value === color ? ' active' : ''}`}
              style=${`--lc-color-button: ${formatColors(color)}; opacity: ${this.value === color ? '1' : '0.3'};`}
              @click=${() => this._handleSelect(color)}
            >
              <span>${color}</span>
            </button>
          `)}
        </div>

        <div class="more-button">
          ${!this.isMore ? html`
            <button @click=${() => this.isMore = true}>
              ${this.hass?.localize('component.lovelace_cards.entity_component._.more_theme_colors')}
            </button>
          ` : null}
        </div>

        <ha-textfield
          class="color-input"
          .label=${this.hass?.localize('component.lovelace_cards.entity_component._.type_your_color')}
          .value=${COLORS.includes(this.value) ? '' : this.value}
          .configValue=${'confirmation'}
          .helper=${this.hass?.localize('component.lovelace_cards.entity_component._.supports_color_format')}
          .errorMessage=${this._errorMessage}
          .invalid=${!!this._errorMessage}
          @input=${this._handleCustom}
        >
          <slot name="icon" slot="leadingIcon"></slot>
        </ha-textfield>

        <ha-color-picker></ha-color-picker>
      </div>
    `;
  }

  private _handleSelect(color: string) {
    this.value = color;
    fireEvent(this, 'value-changed', { value: color });
  }

  private _handleCustom(event: CustomEvent) {
    const value = (event.target as any).value;
    if (COLORS.includes(this.value)) {
      this._prevColor = this.value;
    }

    if (value) {
      this.value = value;
    } else {
      this.value = this._prevColor || COLORS[0];
    }

    this._errorMessage = CSS.supports('color', value) ? undefined : this.hass?.localize('component.lovelace_cards.entity_component._.unsupported_color_format');
    fireEvent(this, 'value-changed', { value: value });
  }
}