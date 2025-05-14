import { customElement, property, query, state } from 'lit/decorators.js';
import { html, LitElement, TemplateResult } from 'lit';
import styles from './footer-button-editor.scss';
import { HomeAssistant } from 'types';
import { ButtonConfigSchema, IButtonConfigSchema } from '../../../schemas/button-config-schema';
import { fireEvent } from '../../../utils/fire-event';
import { assert } from 'superstruct';

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

const COLORS = ['primary', 'accent', 'danger', 'warning', 'success', 'info'];

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
  private _guiSupported?: boolean;

  @state()
  private _error?: string;

  @state()
  private _guiMode = true;

  private _confirmationText?: string;

  private _debounceTimer?: ReturnType<typeof setTimeout>;

  get hasError(): boolean {
    return !!this._error;
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

  toggleMode() {
    this.GUImode = !this.GUImode;
  }

  focusYamlEditor() {
    this._yamlEditor?.focus();
  }

  render(): TemplateResult {
    if (!this.hass || !this.value) return html``;

    if (!this._guiMode) {
      return this._renderYamlEditor();
    }

    const optional = `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.optional')})`;

    return html`
      <div class="container">
        <lc-action-selector
          class="row-full"
          .value=${this.value?.action}
          .hass=${this.hass}
          .configValue=${'action'}
          @value-changed=${this._valueChanged}
        ></lc-action-selector>

        <ha-textfield
          class="input"
          .label=${this.hass.localize('ui.components.label-picker.label')}
          .value=${this.value?.tooltip || ''}
          .configValue=${'tooltip'}
          @input=${this._valueChanged}
        >
          <slot name="icon" slot="leadingIcon"></slot>
        </ha-textfield>

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

        <div class="row-full enable-confirm">
          <span>${this.hass.localize('component.lovelace_cards.entity_component._.show_confirmation_dialog')}</span>

          <lc-switch
            .checked=${!!this.value!.confirmation}
            @change=${this._toggleConfirmSwitch}
          ></lc-switch>
        </div>

        <ha-textfield
          class="row-full"
          .label=${this.hass.localize('component.lovelace_cards.entity_component._.confirm_text')}
          .value=${this.confirmationText}
          .configValue=${'confirmation'}
          .disabled=${this.value?.confirmation === false}
          @input=${this._valueChanged}
        >
          <slot name="icon" slot="leadingIcon"></slot>
        </ha-textfield>

        <div class="row-full">${this.hass.localize('component.lovelace_cards.entity_component._.button_color')}</div>

        ${COLORS.map(color => html`
          <lc-radio 
            id=${`color-${color}`} 
            name="color" 
            .label=${this.hass!.localize(`component.lovelace_cards.entity_component._.color_${color}`)}
            .value=${color} 
            .checked=${this.value?.color === color}
            @change=${this._namedColorChanged}
          ></lc-radio>
        `)}
      </div>
    `;
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
    const value = (event.target as any).value;
    const configValue = (event.target as any).configValue;
    const config = { ...this.value! };

    if (configValue === 'confirmation') {
      config.confirmation = value ? { text: value } : true;
    } else {
      config[configValue] = value;
    }

    fireEvent(this as HTMLElement, 'config-changed', { config });
  }

  private _namedColorChanged(event: CustomEvent) {
    const config = { ...this.value!, color: event.detail.value };

    fireEvent(this as HTMLElement, 'config-changed', { config });
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
}