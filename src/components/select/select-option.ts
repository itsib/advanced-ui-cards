import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './select-option.scss';

@customElement('lc-select-option')
class SelectOption extends LitElement {
  static styles = styles;

  @property()
  value?: string;

  @property({  attribute: false })
  icon?: string | TemplateResult;

  @property({ attribute: 'selected', reflect: true, type: Boolean })
  selected = false;

  @property()
  label?: string;

  @property()
  secondLabel?: string;

  render(): TemplateResult {
    return html`
      ${this._renderIcon()}
      <div class="info">
        <div class="label">${this.label || this.value}</div>
        ${this.secondLabel ? html`<div class="text">${this.secondLabel}</div>` : null}
        </div>
      </div>
    `;
  }

  private _renderIcon() {
    if (!this.icon) return html``;

    if (typeof this.icon === 'string') {
      return html`
        <div class="icon">
          <ha-icon .icon=${this.icon}></ha-icon>
        </div>
      `;
    }

    return this.icon;
  }
}
