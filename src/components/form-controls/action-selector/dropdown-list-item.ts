import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './dropdown-list-item.scss';

@customElement('lc-dropdown-list-item')
class DropdownListItem extends LitElement {
  static styles = styles;

  @property()
  value?: string;

  @property({ attribute: 'selected', reflect: true, type: Boolean })
  selected = false;

  @property()
  label?: string;

  @property()
  text?: string;

  @property()
  icon?: string;

  render(): TemplateResult {
    return html`
      <div class="icon">
        <ha-icon .icon=${this.icon}></ha-icon>
      </div>
      <div class="info">
        <div class="label">${this.label || this.value}</div>
        ${this.text ? html`<div class="text">${this.text}</div>` : null}
        </div>
      </div>
    `;
  }
}
