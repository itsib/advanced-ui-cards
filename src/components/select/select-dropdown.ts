import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { fireEvent } from '../../utils/fire-event';
import styles from './select-dropdown.scss';
import type { ISelectOption } from './select';
import './select-option';

declare global {
  interface HTMLElementTagNameMap {
    'lc-select-dropdown': SelectDropdown;
  }

  interface HTMLElementEventMap {
    'value-changed': CustomEvent;
  }
}

@customElement('lc-select-dropdown')
export class SelectDropdown extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  options: ISelectOption[] = [];

  @property()
  value?: string;

  @property({ attribute: 'inert', type: Boolean })
  inert = false;

  firstUpdated(_changed: PropertyValues) {
    super.firstUpdated(_changed);

    requestAnimationFrame(() => {
      const selected = this.shadowRoot!.querySelector('[selected]');
      if (selected && 'scrollIntoView' in selected) {
        selected.scrollIntoView(true);
      }
    });
  }

  render(): TemplateResult {
    if (!this.options) return html``;
    return html`
      <div class="dropdown" @click=${(event: Event) => event.stopPropagation()} @wheel=${(event: Event) => event.stopPropagation()}>
        <div class="scroller">
          <ul class="list-items">
            ${this.options.map(option => this._renderOption(option))}
          </ul>
        </div>
      </div>
    `;
  }

  private _renderOption(item: ISelectOption) {
    return html`
      <lc-select-option
        .value=${item.value}
        .selected=${this.value != null && item.value === this.value}
        .icon=${item.icon}
        .label=${item.label}
        .secondLabel=${item.secondLabel}
        @click=${this._onClick}
      ></lc-select-option>
    `;
  }

  private _onClick(event: CustomEvent) {
    event.stopPropagation();
    fireEvent(this, 'value-changed', { value: (event.target as any).value });
  }
}
