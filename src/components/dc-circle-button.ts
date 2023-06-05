import { html, LitElement, TemplateResult } from 'lit';
import styles from './dc-circle-button.scss';
import { HomeAssistant } from 'types';

declare global {
  interface HTMLElementTagNameMap {
    'dc-circle-button': DcCircleButton;
  }
}

export class DcCircleButton extends LitElement {
  hass?: HomeAssistant;
  icon?: string;
  label?: string;
  loading = false;
  disabled = false;

  static properties = {
    hass: { attribute: true },
    icon: { attribute: true, type: String },
    label: { attribute: true, type: String },
    loading: { attribute: 'loading', reflect: true, type: Boolean },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
  };

  static styles = styles;

  render(): TemplateResult {
    return html`
      <mwc-icon-button class="circle-button" .disabled=${this.disabled} .title=${this.title}>
        ${this.loading && !this.disabled
          ? html` <mwc-circular-progress indeterminate density=${-6}></mwc-circular-progress> `
          : html` <ha-icon icon=${this.icon} class="icon"></ha-icon> `}
      </mwc-icon-button>
    `;
  }
}

(window as any).customElements.define('dc-circle-button', DcCircleButton);
