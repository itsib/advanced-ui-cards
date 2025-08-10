import { LitElement, type TemplateResult, html } from 'lit';
import styles from './radio.scss';
import { property } from 'lit/decorators.js';
import { fireEvent } from '../../utils/fire-event';

declare global {
  interface HTMLElementTagNameMap {
    'lc-radio': Radio;
  }
}

class Radio extends LitElement {
  static styles = styles;

  @property()
  label?: string;

  @property({ attribute: 'name', reflect: true, type: String })
  name?: string;

  @property({ attribute: 'value', reflect: true, type: String })
  value?: string;

  @property({ attribute: 'checked', reflect: true, type: Boolean })
  checked = false;

  @property({ attribute: 'disabled', reflect: true, type: Boolean })
  disabled = false;

  @property()
  direction: 'ltr' | 'rtl' = 'ltr';

  render(): TemplateResult {
    if (this.direction === 'ltr') {
      return html`
        <div class="radio ltr" role="radio" @click=${this._handleClick}>
          ${this._renderCheckbox()}
          ${this._renderLabel()}
        </div>
      `;
    } else {
      return html`
        <div class="radio rtl" role="radio" @click=${this._handleClick}>
          ${this._renderLabel()}
          ${this._renderCheckbox()}
        </div>
      `;
    }

  }

  private _renderCheckbox(): TemplateResult {
    return html`
      <div class="checkbox">
        <div class="marker"></div>
      </div>
    `;
  }

  private _renderLabel(): TemplateResult {
    return html`
      <div class="label">${this.label || ''}</div>
    `;
  }

  private _handleClick() {
    fireEvent(this, 'change', { value: this.value, name: this.name });
  }
}

customElements.define('lc-radio', Radio, { extends: 'input' });