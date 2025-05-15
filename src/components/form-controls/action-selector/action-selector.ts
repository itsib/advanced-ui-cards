import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'types';
import './action-dropdown';
import styles from './action-selector.scss';
import { fireEvent } from '../../../utils/fire-event';
import { formatActionName } from '../../../utils/format-action-name';

@customElement('lc-action-selector')
class ActionSelector extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property()
  value?: string;

  @property()
  helper?: string;

  @property({ attribute: 'disabled', type: Boolean, reflect: true })
  disabled = false;

  @property({ attribute: 'required', type: Boolean, reflect: true })
  required = false;

  @property({ attribute: 'opened', type: Boolean, reflect: true })
  opened = false;

  @state()
  private _valueFormatted: string = '';

  @state()
  private _errorMessage?: string;

  @state()
  private _search: string = '';

  @state()
  private _focused = false;

  protected willUpdate(_changed: PropertyValues) {
    super.willUpdate(_changed);

    if (_changed.has('value')) {
      this._valueFormatted = '';
      if (this.value) {
        const [domain, action] = this.value.split('.');
        const service = action && this.hass?.services?.[domain]?.[action] || undefined;
        if (service) {
          this._valueFormatted = formatActionName(domain, service, this.hass!.localize);
        }
      }
    }
  }

  render(): unknown {
    if (!this.hass) return html``;

    return html`
      <div class="action-selector" @click=${(event: Event) => event.stopPropagation()}>
        <ha-textfield
          class="input"
          .label=${this.hass.localize('ui.components.service-picker.action')}
          .value=${this._focused ? this._search : this._valueFormatted}
          .errorMessage=${this._errorMessage}
          .invalid=${!!this._errorMessage}
          .helper=${this.helper}
          helperPersistent
          @input=${this._onInput}
          @focus=${this._onFocus}
          @blur=${this._onBlur}
        >
          <slot name="icon" slot="leadingIcon"></slot>
        </ha-textfield>

        <ha-icon
          role="button"
          tabindex="-1"
          aria-expanded=${this.opened ? 'true' : 'false'}
          class="toggle-button"
          .icon=${this.opened ? 'mdi:menu-up' : 'mdi:menu-down'}
          ?disabled=${this.disabled}
        ></ha-icon>
      </div>
      <lc-action-dropdown
        .value=${this.value}
        .services=${this.hass.services}
        .opened=${this.opened}
        .search=${this._search}
        @dismiss=${() => this.opened = false}
        @value-changed=${this._onValueChanged}
      ></lc-action-dropdown>
    `;
  }

  private _onBlur(event: Event) {
    event.stopPropagation();
    this._focused = false;
  }

  private _onFocus(event: Event) {
    event.stopPropagation();
    this._focused = true;

    this.opened = true;
  }

  private _onInput(event: Event) {
    this._search = (event.target as HTMLInputElement).value;
  }

  private _onValueChanged(event: CustomEvent) {
    this.value = event.detail.value as string;
    this._search = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-action-selector': ActionSelector;
  }
}