import { customElement, property, query, state } from 'lit/decorators.js';
import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './footer-button-editor.scss';
import { HassService, HomeAssistant, Selector, TargetSelector } from 'types';
import { ButtonConfigSchema, IButtonConfigSchema } from '../../../schemas/button-config-schema';
import { fireEvent } from '../../../utils/fire-event';
import { array, assert, optional, string, union } from 'superstruct';

declare global {
  interface HTMLElementTagNameMap {
    'lc-footer-button-editor': FooterButtonEditor;
  }

  interface HASSDomEvents {
    'GUImode-changed': {
      guiMode: boolean;
      guiModeAvailable: boolean;
    };
  }
}

@customElement('lc-footer-button-editor')
class FooterButtonEditor extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  value?: IButtonConfigSchema;

  @query('ha-yaml-editor')
  private _yamlEditor?: HTMLInputElement;

  @state()
  private _actionDomain?: string;

  @state()
  private _actionName?: string;

  @state()
  private _targetSelector?: TargetSelector;

  @state()
  private _guiSupported?: boolean;

  @state()
  private _error?: string;

  @state()
  private _guiMode = true;

  private _confirmationText?: string;

  get hasError(): boolean {
    return !!this._error;
  }

  get hasWarning(): boolean {
    return false;
  }

  get GUImode(): boolean {
    return this._guiMode;
  }

  set GUImode(guiMode: boolean) {
    this._guiMode = guiMode;
    this.updateComplete.then(() => {
      fireEvent(this as HTMLElement, 'GUImode-changed', {
        guiMode,
        guiModeAvailable: !(
          this.hasError ||
          this._guiSupported === false
        ),
      });
    });
  }

  set confirmationText(text: string) {
    const value = {
      ...this.value!,
      confirmation: text ? { text } : true,
    };

    fireEvent(this as HTMLElement, 'config-changed', {
      config: value,
    });
  }

  get confirmationText() {
    if (typeof this.value?.confirmation !== 'boolean' && this.value?.confirmation?.text) {
      return this.value?.confirmation.text;
    }
    return this._confirmationText || '';
  }

  get actionId(): string | undefined {
    if (this._actionName && this._actionDomain) {
      return `${this._actionDomain}.${this._actionName}`;
    }
    return undefined;
  }

  set actionId(value: string | undefined) {
    if (value) {
      const [domain, name] = value.split('.', 2);
      this._actionDomain = domain || '';
      this._actionName = name || '';
    } else {
      this._actionDomain = undefined;
      this._actionName = undefined;
    }
  }

  get service(): HassService | undefined {
    if (!this._actionDomain || !this._actionName || !this.hass || !(this._actionDomain in this.hass.services)) return;

    return this.hass.services[this._actionDomain][this._actionName];
  }

  toggleMode() {
    this.GUImode = !this.GUImode;
  }

  focusYamlEditor() {
    this._yamlEditor?.focus();
  }

  willUpdate(_changed: PropertyValues) {
    super.willUpdate(_changed);

    if (_changed.has('value')) {
      if (this.value?.action !== this.actionId) {
        this.actionId = this.value?.action;
      }
    }
  }

  render(): TemplateResult {
    if (!this.hass || !this.value) return html``;

    if (!this._guiMode) {
      return this._renderYamlEditor();
    }

    const optional = `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.optional')})`;

    return html`
      <div class="container">
        <!-- Action Selector-->
        <lc-action-selector
          class="row-full"
          .value=${this.value?.action}
          .hass=${this.hass}
          .configValue=${'action'}
          .helper=${this.service?.description}
          @value-changed=${this._valueChanged}
        ></lc-action-selector>

        <!-- Action Target Selector -->
        ${this._renderServiceTargetSelector()}

        <!-- Action Data Field -->
        ${this._renderServiceDataFields()}

        <hr />

        <!-- Tooltip -->
        <ha-textfield
          class="input"
          .label="${this.hass.localize('component.lovelace_cards.entity_component._.button_tooltip')} ${optional}"
          .value=${this.value?.tooltip || ''}
          .configValue=${'tooltip'}
          @input=${this._valueChanged}
        >
          <slot name="icon" slot="leadingIcon"></slot>
        </ha-textfield>

        <!-- Icon -->
        <ha-icon-picker
          .hass=${this.hass}
          .label="${this.hass.localize('ui.panel.lovelace.editor.card.generic.icon')} ${optional}"
          .value=${this.value.icon}
          .required=${false}
          .disabled=${false}
          .configValue=${'icon'}
          .placeholder=${'lc:placeholder'}
          @value-changed=${this._valueChanged}
        >
        </ha-icon-picker>

        <!-- Enable confirmation -->
        <div class="row-full enable-confirm">
          <span>${this.hass.localize('component.lovelace_cards.entity_component._.show_confirmation_dialog')}</span>

          <lc-switch
            .checked=${!!this.value!.confirmation}
            @change=${this._toggleConfirmSwitch}
          ></lc-switch>
        </div>

        <!-- Confirmation text -->
        <ha-textfield
          class="row-full"
          .label="${this.hass.localize('component.lovelace_cards.entity_component._.confirm_text')} ${optional}"
          .value=${this.confirmationText}
          .configValue=${'confirmation'}
          .disabled=${!this.value?.confirmation}
          @input=${this._valueChanged}
        >
          <slot name="icon" slot="leadingIcon"></slot>
        </ha-textfield>

        <div class="row-full">
          ${this.hass.localize('component.lovelace_cards.entity_component._.button_color')} ${optional}
        </div>

        <!-- Select color -->
        <lc-color-selector
          class="row-full"
          .hass=${this.hass}
          .value=${this.value.color}
          .configValue=${'color'}
          @value-changed=${this._valueChanged}
        ></lc-color-selector>
      </div>
    `;
  }

  private _renderServiceTargetSelector(): TemplateResult | null {
    const service = this.service;
    if (!service || !this.hass) return html``;

    const targets = service.target ? Object.keys(service.target) : [];
    if (!targets.length) return html``;

    return html`
      <div class="row-full">
        <ha-selector
          .label=${this.hass!.localize('component.lovelace_cards.entity_component._.choose_action_target')}
          .hass=${this.hass}
          .selector=${{ target: { ...service.target } }}
          @value-changed=${this._valueChanged}
          .configValue=${'target'}
          .value=${this.value?.target}
        ></ha-selector>
      </div>
    `;
  }

  private _renderServiceDataFields(): TemplateResult | null {
    const service = this.service;
    if (!service || !this.hass) return html``;

    const fieldsIds = service.fields ? Object.keys(service.fields) : [];
    if (!fieldsIds.length) return html``;

    return html`${
      fieldsIds.map(fieldId => {
        const fields = service.fields[fieldId];
        if (!fields.required) return html``;

        return html`
          <div class="row-full">
            <ha-selector
              .label=${fields.name}
              .helper=${fields.description}
              .hass=${this.hass}
              .selector=${fields.selector}
              @value-changed=${this._valueChanged}
              .configValue=${'data'}
              .dataField=${fieldId}
              .value=${this.value?.data?.[fieldId] || ''}
            ></ha-selector>
          </div>
        `;
      })
    }`;
  }

  private _renderYamlEditor() {
    return html`
      <div class="yaml-editor">
        <ha-yaml-editor
          .defaultValue=${this.value}
          autofocus
          .hass=${this.hass}
          @value-changed=${this._handleYAMLChanged}
          dir="ltr"
        ></ha-yaml-editor>

        ${this._error ? html`
          <div class="error">${this._error}</div>` : null}
      </div>
    `;
  }

  private _handleYAMLChanged(event: CustomEvent) {
    event.stopPropagation();
    const config = event.detail.value;

    if (event.detail.isValid) {
      try {
        assert(config, ButtonConfigSchema);
        this.value = config as IButtonConfigSchema;
        this._error = undefined;

        fireEvent(this as HTMLElement, 'config-changed', { config });
      } catch (e) {
        this._error = `${e.message}`.trim();
      }
    } else {
      this._error = `${event.detail.errorMsg}`.trim();
    }
  }

  private _toggleConfirmSwitch(event: CustomEvent) {
    const config = { ...this.value! };
    const checked = !!event.detail.checked;
    if (checked) {
      if (this._confirmationText) {
        config.confirmation = { text: this._confirmationText };
        this._confirmationText = '';
      } else {
        config.confirmation = true;
      }
    } else {
      if (typeof config!.confirmation !== 'boolean' && config!.confirmation?.text) {
        this._confirmationText = config!.confirmation.text;
      }

      config!.confirmation = false;
    }

    fireEvent(this as HTMLElement, 'config-changed', { config });
  }

  private _valueChanged(event: CustomEvent) {
    const configValue = (event.target as any).configValue;
    const value = (event.target as any).value;
    const config = { ...this.value! };

    if (configValue === 'action') {
      const [domain, name] = value.split('.', 2);
      const service = this.hass!.services[domain]?.[name];
      this._error = undefined;
      if (!service) {
        this._error = this.hass!.localize('ui.errors.config.configuration_error');
        return;
      }

      if (service.target && Object.keys(service.target).length) {
        config.target = {
          entity_id: [],
          device_id: [],
          area_id: [],
          floor_id: [],
          label_id: [],
        };
      } else {
        Reflect.deleteProperty(config, 'target');
      }

      if (service.fields && Object.keys(service.fields).length) {
        config.data = {};
      } else {
        Reflect.deleteProperty(config, 'data');
      }

      config.action = value;
    } else if (configValue === 'confirmation') {
      config.confirmation = value ? { text: value } : true;
    } else if (configValue === 'target') {
      const updated = event.detail.value;
      config.target = {
        entity_id: updated.entity_id.length ? Array.from(new Set(updated.entity_id)) : [],
        device_id: updated.device_id.length ? Array.from(new Set(updated.device_id)) : [],
        area_id: updated.area_id.length ? Array.from(new Set(updated.area_id)) : [],
        floor_id: updated.floor_id.length ? Array.from(new Set(updated.floor_id)) : [],
        label_id: updated.label_id.length ? Array.from(new Set(updated.label_id)) : [],
      };
    } else if (configValue === 'data') {
      const dataField = (event.target as any).dataField;

      config.data = { ...(this.value?.data || {}) };
      config.data[dataField] = event.detail.value;
    } else {
      config[configValue] = value;
    }

    fireEvent(this as HTMLElement, 'config-changed', { config });
  }
}