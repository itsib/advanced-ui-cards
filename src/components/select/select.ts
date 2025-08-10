import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { getElementRect } from '../../utils/get-element-rect';
import { SelectDropdown } from './select-dropdown';
import { fireEvent } from '../../utils/fire-event';
import styles from './select.scss';
import './select-dropdown';

const LIST_ITEM_HEIGHT = 72;
const LIST_MAX_DISPLAY = 5;

export interface ISelectOption {
  value: string;
  icon?: string | TemplateResult;
  label?: string;
  secondLabel?: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-select': Select;
  }
}

@customElement('lc-select')
class Select extends LitElement {
  static styles = styles;

  @property()
  label?: string;

  @property({ attribute: 'value', reflect: true, type: String })
  value?: string;

  @property()
  options?: ISelectOption[];

  @property()
  helper?: string;

  @property({ attribute: 'error-message', type: String })
  errorMessage?: string;

  @property({ attribute: 'disabled', type: Boolean, reflect: true })
  disabled = false;

  @property({ attribute: 'opened', type: Boolean, reflect: true })
  opened = false;

  @property({ attribute: false })
  getValue?: (_value: string) => string;

  @state()
  private _search: string = '';

  @state()
  private _focused = false;

  @query('.input')
  private _input?: HTMLInputElement;

  private _dropdown?: SelectDropdown;

  private _callbacks: Record<string, (...rest: any[]) => void> = {};

  willUpdate(_changed: PropertyValues) {
    super.willUpdate(_changed);

    if (_changed.has('required') || _changed.has('value')) {

    }

    if (_changed.has('_search') && this._dropdown && this.options) {
      const search = this._search?.trim().toLowerCase() || '';
      if (search) {
        this._dropdown.options = this.options.filter(item => {
          return item.value.toLowerCase().includes(search) || (item.label && item.label.toLowerCase().includes(search));
        });
      } else {
        this._dropdown.options = this.options;
      }
      this._positioning();
    }
  }

  render(): unknown {
    if (!this.options) return html``;

    return html`
      <div class="select" @click=${(event: Event) => event.stopPropagation()}>
        <ha-textfield
          class="input"
          .label=${this.label}
          .value=${this._focused ? this._search : this._getSelectedValue()}
          .errorMessage=${this.errorMessage}
          .invalid=${!!this.errorMessage}
          .helper=${this.helper}
          helperPersistent
          @input=${this._onInput}
          @focus=${this._onFocus}
          @blur=${this._onBlur}
        ></ha-textfield>

        <ha-icon
          role="button"
          tabindex="-1"
          aria-expanded=${this.opened ? 'true' : 'false'}
          class="toggle-button"
          .icon=${this.opened ? 'mdi:menu-up' : 'mdi:menu-down'}
          ?disabled=${this.disabled}
        ></ha-icon>
      </div>
    `;
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
    if (this._dropdown) {
      this._hideDropdown();
    }

    this._dropdown = document.createElement('lc-select-dropdown')!;
    this._dropdown!.options = this.options!;
    this._dropdown!.value = this.value;
    this._dropdown!.addEventListener('value-changed', this._onValueChanged.bind(this));
    document.body.append(this._dropdown);

    this._callbacks['wheel'] = this._onWheel.bind(this);
    window.addEventListener('wheel', this._callbacks['wheel']);

    requestAnimationFrame(() => {
      this._callbacks['window-click'] = () => this.opened = false;
      window.addEventListener('click', this._callbacks['window-click']);

      this._positioning();
    });
  }

  private _hideDropdown() {
    window.removeEventListener('wheel', this._callbacks['wheel'] as any);
    Reflect.deleteProperty(this._callbacks, 'wheel');

    window.removeEventListener('click', this._callbacks['window-click'] as any);
    Reflect.deleteProperty(this._callbacks, 'window-click');

    this._dropdown?.remove();
    this._dropdown = undefined;
  }

  private _positioning(): { top: number; left: number; width: number; isBellow: boolean } {
    if (!this._dropdown) {
      throw new Error('');
    }

    const { x, y, width, height } = getElementRect(this as HTMLElement);
    const windowHeight = window.visualViewport?.height || window.innerHeight;
    const dropdownHeight = LIST_ITEM_HEIGHT * Math.min(LIST_MAX_DISPLAY, this._dropdown.options.length);
    const isBellow = windowHeight < (y + height + dropdownHeight);
    const top = isBellow ? y - dropdownHeight : y + height;

    this._dropdown.style.setProperty('--lc-dropdown-top', `${top}px`);
    this._dropdown.style.setProperty('--lc-dropdown-left', `${x}px`);
    this._dropdown.style.setProperty('--lc-dropdown-width', `${width}px`);
    this._dropdown.style.setProperty('--lc-dropdown-height', `${dropdownHeight}px`);
    this._dropdown.style.setProperty('--lc-dropdown-border-radius', isBellow ? '.5rem .5rem 0 0' : '0 0 .5rem .5rem');

    return {
      top: top,
      left: x,
      width: width,
      isBellow: isBellow,
    };
  }

  private _onBlur(event: Event) {
    event.stopPropagation();
    this._focused = false;
  }

  private _onFocus(event: Event) {
    event.stopPropagation();

    this._search = this._getSelectedValue();
    this._focused = true;

    this.opened = true;

    requestAnimationFrame(() => {
      this._input?.setSelectionRange(0, this._search.length, 'forward');
    });
  }

  private _onInput(event: Event) {
    this._search = (event.target as HTMLInputElement).value;
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

  private _getSelectedValue(): string {
    if (!this.value) return '';

    return this.getValue ? this.getValue(this.value) : this.value;
  }

  private _onValueChanged(event: CustomEvent) {
    this.value = event.detail.value as string;
    this._search = '';
    this.opened = false

    fireEvent(this, 'value-changed', { value: this.value });
  }
}