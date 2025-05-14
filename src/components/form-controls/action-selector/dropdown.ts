import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './dropdown.scss';
import './dropdown-list-item';
import { getElementRect } from '../../../utils/get-element-rect';
import { fireEvent } from '../../../utils/fire-event';

export interface DropdownListItem {
  value: string;
  label?: string;
  text?: string;
  icon?: string;
}

export interface DropdownConfig {
  items: DropdownListItem[];
  ref: HTMLElement;
  value?: string;
}

@customElement('lc-dropdown')
class Dropdown extends LitElement {
  static styles = styles;

  @property()
  value?: string;

  @property()
  count = 5;

  @property({ attribute: 'item-height' })
  itemHeight = 72;

  @property({ attribute: 'inert', type: Boolean })
  inert = false;

  @state()
  private _allItems?: DropdownListItem[];

  @state()
  private _items?: DropdownListItem[];

  private _ref?: HTMLElement;

  private _wheelCallback?: any;

  private _isLessThanMax = false;

  setConfig(config: DropdownConfig) {
    if (!config.items?.length) return;

    this.value = config.value;
    this._ref = config.ref;
    this._allItems = config.items;
    this._items = config.items;

    this._positioning();
  }

  connectedCallback() {
    super.connectedCallback();

    this._wheelCallback = this._onWheel.bind(this);
    window.addEventListener('wheel', this._wheelCallback);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('wheel', this._wheelCallback);
    this._wheelCallback = undefined;
  }

  filter(value?: string) {
    value = value?.trim().toLowerCase() || '';

    if (!value || !this._allItems) {
      this._items = this._allItems || [];
    } else {
      this._items = this._allItems.filter(item => {
        return item.value.toLowerCase().includes(value) || (item.label && item.label.toLowerCase().includes(value));
      });
    }

    if (this._items.length < this.count || this._isLessThanMax) {
      this._isLessThanMax = this._items.length < this.count;
      this._positioning();
    }
  }

  willUpdate(_changed: PropertyValues) {
    super.willUpdate(_changed);

    if (_changed.has('_items') || _changed.has('count') || _changed.has('itemHeight')) {
      const height = this.itemHeight * Math.min(this.count, this._items?.length || 0);

      this.style.setProperty('--lc-dropdown-height', `${height}px`);
    }
  }

  render(): TemplateResult {
    if (!this._items) return html``;
    return html`
      <div class="dropdown" @click=${event => event.stopPropagation()}>
        <div class="scroller">
          <ul class="list-items">
            ${this._items.map(item => this._renderItem(item))}
          </ul>
        </div>
      </div>
    `;
  }

  private _renderItem(item: DropdownListItem) {
    return html`
      <lc-dropdown-list-item
        .value=${item.value}
        .selected=${item.value === this.value}
        .icon=${item.icon}
        .label=${item.label}
        .text=${item.text}
        @click=${event => this._onChange(event, item.value)}
      ></lc-dropdown-list-item>
    `;
  }

  private _onChange(event: Event, value: string) {
    event.stopPropagation();

    fireEvent(this, 'value-changed', { value: value });
  }

  private _onWheel() {
    let x: number | undefined;
    let y: number | undefined;

    const tryPosition = () => {
      const result = this._positioning();
      if (!result) return;

      if (x !== result.x || y !== result.y) {
        x = result.x;
        y = result.y;

        requestAnimationFrame(tryPosition);
      }
    };

    requestAnimationFrame(tryPosition);
  }

  private _positioning() {
    if (!this._ref || !this._items || !this.count) return null;

    const { x, y, width, height } = getElementRect(this._ref);
    const windowHeight = window.visualViewport?.height || window.innerHeight;
    const dropdownHeight = this.itemHeight * Math.min(this.count, this._items.length);
    const isBellow = windowHeight < (y + height + dropdownHeight);
    const top = isBellow ? y - dropdownHeight : y + height;

    this.style.setProperty('--lc-dropdown-top', `${top}px`);
    this.style.setProperty('--lc-dropdown-left', `${x}px`);
    this.style.setProperty('--lc-dropdown-width', `${width}px`);
    this.style.setProperty('--lc-dropdown-border-radius', isBellow ? '.5rem .5rem 0 0' : '0 0 .5rem .5rem');

    return { y: top, x };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-dropdown': Dropdown;
  }
}