import { html, LitElement, type TemplateResult } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import styles from './icon-success.scss'

@customElement('lc-icon-success')
export class IconSuccess extends LitElement {
  static styles = [
    LitElement.styles,
    styles,
  ];

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
            fill=${this.color}
            fill-opacity="0"
            stroke-dasharray="138"
            stroke-dashoffset="138"
            d="m2.5 25c0-12 10-22 22-22s22 10 22 22-10 22-22 22-22-10-22-22z"
          >
            <animate fill="freeze" attributeName="fill-opacity" begin="0.6s" dur="0.15s" values="0;0.2" />
            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="138;0" />
          </path>
          <path stroke-dasharray="30" stroke-dashoffset="30" d="m15 25 7.5 7.5 12-12">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.75s" dur="0.15s" values="30;0" />
          </path>
        </g>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-icon-success': IconSuccess;
  }
}
