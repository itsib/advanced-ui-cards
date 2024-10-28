import { html, LitElement, TemplateResult } from 'lit';
import styles from './lc-switch.scss';
import { HomeAssistant } from 'types';

declare global {
  interface HTMLElementTagNameMap {
    'lc-switch': LcSwitch;
  }
}

export class LcSwitch extends LitElement {
  hass?: HomeAssistant;
  checked = false;
  disabled = false;

  static properties = {
    hass: { attribute: true },
    checked: { attribute: 'checked', reflect: true, type: Boolean },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
  };

  static styles = styles;

  render(): TemplateResult {
    const className = this.checked ? 'lc-switch active' : 'lc-switch';
    return html`
      <div class="${className}" @click="${this._handleClick}">
        <div class="lc-switch-thumb"/>
      </div>
    `;
  }

  private _handleClick(): void {
    this.checked = !this.checked;
    const options = {
      detail: {
        checked: this.checked,
      },
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent('change', options));
  }
}

(window as any).customElements.define('lc-switch', LcSwitch);