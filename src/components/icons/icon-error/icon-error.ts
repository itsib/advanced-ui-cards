import { html, LitElement, TemplateResult } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import styles from './icon-error.scss';

@customElement('lc-icon-error')
export class IconError extends LitElement {
  static styles = styles;

  @property({ attribute: 'size', type: Number })
  size: number;

  @property({ attribute: 'color', type: String })
  color: string;

  constructor() {
    super();

    this.size = 24;
    this.color = 'currentColor';
  }

  protected render(): TemplateResult {
    return html`
      <svg role="status" aria-label="Success" width=${this.size} height=${this.size} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke=${this.color} stroke-linecap="round" stroke-linejoin="round" stroke-width="5">

          <path
            stroke-dasharray="138"
            stroke-dashoffset="138"
            d="m25 2.5c12 0 22 10 22 22s-10 22-22 22-22-10-22-22 10-22 22-22z"
            fill="#f00"
            fill-opacity="0"
            stroke=${this.color}
            stroke-width="5"
          >
            <animate fill="freeze" attributeName="fill-opacity" begin="0.6s" dur="0.15s" values="0;0.3" />
            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="138;0" />
          </path>
          <path
            d="m25 25 10 10m-10-10-10-10m10 10-10 10m10-10 10-10"
            stroke-dasharray="16"
            stroke-dashoffset="16">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.75s" dur="0.2s" values="16;0" />
          </path>
        </g>
      </svg>

    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-icon-error': IconError;
  }
}
