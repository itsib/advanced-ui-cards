import { html, LitElement, type TemplateResult } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('lc-icon-spinner')
export class IconSpinner extends LitElement {
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
      <svg role="progressbar" aria-label="Loading" width=${this.size} height=${this.size} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke=${this.color} stroke-linecap="round" stroke-width="5">
          <circle cx="25" cy="25" r="22" opacity="0.3" />
          <g>
            <circle cx="25" cy="25" r="22"  stroke-dasharray="0 138" stroke-dashoffset="0">
              <animate attributeName="stroke-dasharray" dur="1.5s" calcMode="linear" values="0 1400;38 1400;100 1400;100 1400" keyTimes="0;0.33;0.66;1" repeatCount="indefinite" />
              <animate attributeName="stroke-dashoffset" dur="1.5s" calcMode="linear" values="0;-38;-100;-139" keyTimes="0;0.33;0.66;1" repeatCount="indefinite" />
            </circle>
            <animateTransform attributeName="transform" type="rotate" dur="1.5s" values="0 25 25;360 25 25" repeatCount="indefinite" />
          </g>
        </g>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-icon-spinner': IconSpinner;
  }
}
