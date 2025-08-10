import { html, LitElement, type TemplateResult } from 'lit';
import styles from './switch.scss';

declare global {
  interface HTMLElementTagNameMap {
    'lc-switch': Switch;
  }
}

export class Switch extends LitElement {
  static styles = styles;

  static properties = {
    checked: {
      type: Boolean,
      reflect: true,
      attribute: 'checked'
    },
    disabled: {
      type: Boolean,
      reflect: true,
      attribute: 'disabled',
    }
  }

  checked: boolean;

  disabled: boolean;

  constructor() {
    super();
    this.checked = false
    this.disabled = false
  }

  render(): TemplateResult {
    return html`
      <div class="lc-switch" @click="${this._handleClick}">
        <div class="lc-switch-thumb"/>
      </div>
    `;
  }

  private _handleClick(): void {
    const options = {
      detail: {
        checked: !this.checked,
      },
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent('change', options));
  }
}
customElements.define('lc-switch', Switch)

