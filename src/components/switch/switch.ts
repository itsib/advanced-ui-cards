import { html, LitElement, TemplateResult } from 'lit';
import styles from './switch.scss';
import { property, customElement } from 'lit/decorators.js';

declare global {
  interface HTMLElementTagNameMap {
    'lc-switch': Switch;
  }
}

@customElement('lc-switch')
export class Switch extends LitElement {
  static styles = styles;

  @property({ attribute: 'checked', reflect: true, type: Boolean })
  checked = false;

  @property({ attribute: 'disabled', reflect: true, type: Boolean })
  disabled = false;

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

