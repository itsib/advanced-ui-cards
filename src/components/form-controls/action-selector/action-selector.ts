import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'types';
import './dropdown';
import styles from './action-selector.scss';
import { DropdownListItem } from './dropdown';
import { getServiceIcon } from '../../../utils/get-service-icon';
import { fireEvent } from '../../../utils/fire-event';

@customElement('lc-action-selector')
class ActionSelector extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property()
  value?: string;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  required = false;

  @property({ type: Boolean, reflect: true })
  opened = false;

  @query('.input')
  private _textfield?: HTMLInputElement;

  @state()
  private _name?: string;

  private _dropdown?: HTMLElementTagNameMap['lc-dropdown'];

  protected willUpdate(_changed: PropertyValues) {
    super.willUpdate(_changed);

    if (_changed.has('value')) {
      if (this.value) {
        const [domain, action] = this.value.split('.');
        const service = action && this.hass?.services?.[domain]?.[action] || undefined;
        this._name = service?.name || this.value || '';
      } else {
        this._name = '';
      }
    }
  }

  render(): unknown {
    if (!this.hass) return html``;

    return html`
      <div class="action-selector" @click=${this._openDropdown}>
        <ha-textfield
          class="input"
          .label=${this.hass.localize('ui.components.service-picker.action')}
          .value=${this._name || this.value || ''}
          .configValue=${'title'}
          @input=${this._valueChanged}
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
    `;
  }

  private _openDropdown(event: Event) {
    event.stopPropagation();
    if (this.opened || !this.hass) return;

    this.opened = true;
    this._textfield?.focus();

    const items: DropdownListItem[] = [];
    const domains = Object.keys(this.hass.services);
    for (const domain of domains) {
      const services = this.hass.services[domain];
      const servicesNames = Object.keys(services);

      for (const serviceName of servicesNames) {
        const serviceId = `${domain}.${serviceName}`;
        items.push({
          value: serviceId,
          label: services[serviceName].name,
          text: serviceId,
          icon: getServiceIcon(serviceId),
        });
      }
    }

    const close = () => {
      this.opened = false;
      this._dropdown?.remove();

      window.removeEventListener('click', close);
    };

    this._dropdown = document.createElement('lc-dropdown')!;
    this._dropdown.setConfig({
      items: items,
      ref: this,
      value: this.value,
    });
    this._dropdown.addEventListener('value-changed', (event: any) => {
      this.value = event.detail.value as string;
      close();
      fireEvent(this, 'value-changed', { value: event.detail.value as string });
    });
    document.body.append(this._dropdown);

    requestAnimationFrame(() => {
      window.addEventListener('click', close);
    });
  }

  private _valueChanged() {
    if (!this._dropdown || !this._textfield) return;

    this._dropdown.filter(this._textfield.value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-action-selector': ActionSelector;
  }
}