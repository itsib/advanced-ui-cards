import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { HassServices } from 'types';
import { customElement, property, state } from 'lit/decorators.js';
import './dropdown-list-item';
import { getElementRect } from '../../../utils/get-element-rect';
import { fireEvent } from '../../../utils/fire-event';
import { getServiceIcon } from '../../../utils/get-service-icon';
import styles from './action-dropdown.scss';

export interface DropdownListItem {
  index: number;
  value: string;
  label?: string;
  text?: string;
  icon?: string;
}

const LIST_ITEM_HEIGHT = 72;
const LIST_MAX_DISPLAY = 5;

declare global {
  interface HTMLElementTagNameMap {
    'lc-action-dropdown': ActionDropdown;
    'lc-action-dropdown-content': ActionDropdownContent;
  }

  interface HTMLElementEventMap {
    'value-changed': CustomEvent;
    'dismiss': CustomEvent,
  }
}

@customElement('lc-action-dropdown')
class ActionDropdown extends LitElement {
  @property()
  value?: string;

  @property()
  search?: string;

  @property({ attribute: false })
  services?: HassServices;

  @property({ attribute: 'opened', reflect: true, type: Boolean })
  opened = false;

  @state()
  private _domains: string[] = [];

  @state()
  private _items: DropdownListItem[] = [];

  @state()
  private _idToIndex: { [serviceId: string]: number } = {};

  private _content?: ActionDropdownContent;

  private _callbacks: Record<string, any> = {};

  willUpdate(_changed: PropertyValues) {
    super.willUpdate(_changed);
    if (_changed.has('services')) {
      this._recomputeListItems();

      if (this._content) {
        this._content.items = this._items;
      }
    }

    if (_changed.has('search') && this._content) {
      const search = this.search?.trim().toLowerCase() || '';
      if (search) {
        this._content.items = this._items.filter(item => {
          return item.value.toLowerCase().includes(search) || (item.label && item.label.toLowerCase().includes(search));
        });
      } else {
        this._content.items = this._items;
      }
      this._positioning();
    }
  }

  updated(_changed: PropertyValues) {
    super.updated(_changed);

    if (_changed.has('opened')) {
      if (this.opened) {
        this._showDropdown();
      } else {
        this._hideDropdown();
      }
    }
  }

  private _showDropdown() {
    this._content = document.createElement('lc-action-dropdown-content');
    this._content!.items = this._items;
    this._content!.activeIndex = this.value ? this._idToIndex[this.value] : null;
    this._content!.addEventListener('value-changed', this._onChange.bind(this));
    document.body.append(this._content);

    this._callbacks['wheel'] = this._onWheel.bind(this);
    window.addEventListener('wheel', this._callbacks['wheel']);

    requestAnimationFrame(() => {
      this._callbacks['window-click'] = () => fireEvent(this, 'dismiss');
      window.addEventListener('click', this._callbacks['window-click']);

      this._positioning();
    });
  }

  private _hideDropdown() {
    window.removeEventListener('wheel', this._callbacks['wheel']);
    Reflect.deleteProperty(this._callbacks, 'wheel');

    window.removeEventListener('click', this._callbacks['window-click']);
    Reflect.deleteProperty(this._callbacks, 'window-click');

    this._content?.remove();
    this._content = undefined;
  }

  private _onChange(event: CustomEvent) {
    event.stopPropagation();

    fireEvent(this, 'dismiss');
    fireEvent(this, 'value-changed', { value: event.detail.value });
  }

  private _onWheel() {
    let left: number | undefined;
    let top: number | undefined;

    const tryPosition = () => {
      const result = this._positioning();
      if (!result) return;

      if (left !== result.left || top !== result.top) {
        left = result.left;
        top = result.top;

        requestAnimationFrame(tryPosition);
      }
    };

    requestAnimationFrame(tryPosition);
  }

  private _recomputeListItems() {
    this._domains = this.services ? Object.keys(this.services) : [];
    const items: DropdownListItem[] = [];
    const idToIndex: { [serviceId: string]: number } = {};

    let index = 0;
    for (let i = 0; i < this._domains.length; i++) {
      const domain = this._domains[i];
      const services = this.services![domain];
      const servicesNames = Object.keys(services);

      for (let j = 0; j < servicesNames.length; j++) {
        const serviceName = servicesNames[j];
        const serviceId = `${domain}.${serviceName}`;
        items.push({
          index: index,
          value: serviceId,
          label: services[serviceName].name,
          text: serviceId,
          icon: getServiceIcon(serviceId),
        });
        idToIndex[serviceId] = index;

        index++;
      }
    }

    this._items = items;
    this._idToIndex = idToIndex;
  }

  private _positioning(): { top: number; left: number; width: number; isBellow: boolean } {
    if (!this._content) {
      throw new Error('');
    }

    const { x, y, width, height } = getElementRect(this.previousElementSibling as HTMLElement);
    const windowHeight = window.visualViewport?.height || window.innerHeight;
    const dropdownHeight = LIST_ITEM_HEIGHT * Math.min(LIST_MAX_DISPLAY, this._content.items.length);
    const isBellow = windowHeight < (y + height + dropdownHeight);
    const top = isBellow ? y - dropdownHeight : y + height;

    this._content.style.setProperty('--lc-dropdown-top', `${top}px`);
    this._content.style.setProperty('--lc-dropdown-left', `${x}px`);
    this._content.style.setProperty('--lc-dropdown-width', `${width}px`);
    this._content.style.setProperty('--lc-dropdown-height', `${dropdownHeight}px`);
    this._content.style.setProperty('--lc-dropdown-border-radius', isBellow ? '.5rem .5rem 0 0' : '0 0 .5rem .5rem');

    return {
      top: top,
      left: x,
      width: width,
      isBellow: isBellow,
    };
  }
}

@customElement('lc-action-dropdown-content')
class ActionDropdownContent extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  items: DropdownListItem[] = [];

  @property()
  activeIndex: number | null = null;

  @property({ attribute: 'inert', type: Boolean })
  inert = false;

  firstUpdated(_changed: PropertyValues) {
    super.updated(_changed);

    if (this.activeIndex != null) {

      const scroller = this.renderRoot.firstElementChild?.firstElementChild as HTMLElement;
      if (scroller) {
        ((_scroller: HTMLElement, _scrollTo: number) => {
          requestAnimationFrame(() => _scroller.scrollTo(0, _scrollTo));
        })(scroller, this.activeIndex * LIST_ITEM_HEIGHT);
      }
    }
  }

  render(): TemplateResult {
    if (!this.items) return html``;
    return html`
      <div class="dropdown" @click=${(event: Event) => event.stopPropagation()} @wheel=${(event: Event) => event.stopPropagation()}>
        <div class="scroller">
          <ul class="list-items">
            ${this.items.map(item => this._renderItem(item))}
          </ul>
        </div>
      </div>
    `;
  }

  private _renderItem(item: DropdownListItem) {
    return html`
      <lc-dropdown-list-item
        .value=${item.value}
        .selected=${this.activeIndex != null && item.index === this.activeIndex}
        .icon=${item.icon}
        .label=${item.label}
        .text=${item.text}
        @click=${this._onClick}
      ></lc-dropdown-list-item>
    `;
  }

  private _onClick(event: CustomEvent) {
    event.stopPropagation();
    console.log((event.target as any).value);
    fireEvent(this, 'value-changed', { value: (event.target as any).value }, { bubbles: true });
  }
}
