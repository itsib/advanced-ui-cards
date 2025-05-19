import { customElement, property, query, state } from 'lit/decorators.js';
import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { HomeAssistant, IEntityBaseConfigSchema, IEntityConfigSchema } from 'types';
import { fireEvent } from '../../../utils/fire-event';
import { entitiesToSelectOption } from '../../../utils/object-to-select-option';
import { assert } from 'superstruct';
import { EntityConfigSchema } from '../../../schemas/entity-config-schema';
import { computeDomain } from '../../../utils/entities-utils';
import styles from './entity-editor.scss';
import { ISelectOption } from '../../select/select';

declare global {
  interface HTMLElementTagNameMap {
    'lc-entity-editor': EntityEditor;
  }

  interface HASSDomEvents {
    'GUImode-changed': {
      guiMode: boolean;
      guiModeAvailable: boolean;
    };
  }
}

@customElement('lc-entity-editor')
class EntityEditor extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  value?: IEntityConfigSchema;

  @query('ha-yaml-editor')
  private _yamlEditor?: HTMLInputElement;

  @state()
  private _guiSupported?: boolean;

  @state()
  private _error?: string;

  @state()
  private _guiMode = true;

  @state()
  private _options: ISelectOption[] = [];

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

    return html`
      <div class="container">
        ${'type' in this.value ? this._renderEntityWidthType(this.value) : this._renderBaseEntity(this.value)}
      </div>
    `;
  }

  firstUpdated(_changed: PropertyValues) {
    super.firstUpdated(_changed);

    if (!this.hass) return;
    this._options = entitiesToSelectOption(this.hass);
  }

  private _renderEntityWidthType(_entity: IEntityConfigSchema) {
    return html``;
  }

  private _renderBaseEntity(entity: IEntityBaseConfigSchema) {
    if (!this.hass) return html``;

    const domain = computeDomain(entity.entity);
    const secondaryInfoValues = [
      'none',
      'entity-id',
      'last-changed',
      'last-updated',
      ...(['automation', 'script'].includes(domain) ? ['last-triggered'] : []),
      ...(domain === 'cover' ? ['position', 'tilt-position'] : []),
      ...(domain === 'light' ? ['brightness'] : []),
    ];

    return html`
      <lc-select
        class="row-full"
        .label="${this.hass?.localize('component.lovelace_cards.entity_component._.editor.entity')} *"
        .value=${entity.entity}
        .options=${this._options}
        .configValue=${'entity'}
        .getValue=${(value: string): string => {
          return this.hass!.entities[value]?.name || value;
        }}
        @value-changed=${this._valueChanged}
      ></lc-select>

      <!-- Name -->
      <ha-textfield
        class="input"
        .label="${this.hass.localize('component.lovelace_cards.entity_component._.editor.name')}"
        .value=${entity.name || ''}
        .configValue=${'name'}
        @input=${this._valueChanged}
      >
        <slot name="icon" slot="leadingIcon"></slot>
      </ha-textfield>

      <!-- Icon -->
      <ha-selector
        .hass=${this.hass}
        .label="${this.hass.localize('component.lovelace_cards.entity_component._.editor.icon')}"
        .value=${entity.icon}
        .required=${false}
        .disabled=${false}
        .configValue=${'icon'}
        .selector=${{ icon: {} }}
        .context=${{ icon_entity: entity.entity }}
        @value-changed=${this._valueChanged}
      ></ha-selector>


      <div class="row-full">
        <ha-selector
          .hass=${this.hass}
          .label=${this.hass.localize('component.lovelace_cards.entity_component._.editor.secondary_information')}
          .selector=${{
            select: {
              mode: 'list',
              translation_key: 'editor.secondary_info',
              options: secondaryInfoValues,
            },
          }}
          .configValue=${'secondary_info'}
          .value=${entity.secondary_info || 'none'}
          .localizeValue=${(value: string) => {
            return this.hass!.localize(`component.lovelace_cards.entity_component._.${value}`);
          }}
          @value-changed=${this._valueChanged}
        ></ha-selector>
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

  private _handleYAMLChanged(event: CustomEvent) {
    event.stopPropagation();
    const config = event.detail.value;

    if (event.detail.isValid) {
      try {
        assert(config, EntityConfigSchema);
        this.value = config as IEntityConfigSchema;
        this._error = undefined;

        fireEvent(this as HTMLElement, 'config-changed', { config });
      } catch (e) {
        this._error = `${e.message}`.trim();
      }
    } else {
      this._error = `${event.detail.errorMsg}`.trim();
    }
  }

  private _valueChanged(event: CustomEvent) {
    const configValue = (event.target as any).configValue;
    const value = ['icon', 'secondary_info'].includes(configValue) ? event.detail.value : (event.target as any).value;

    const config = {
      ...this.value!,
      [configValue]: value,
    };

    if (configValue === 'secondary_info' && value === 'none') {
      Reflect.deleteProperty(config, 'secondary_info');
    }

    fireEvent(this as HTMLElement, 'config-changed', { config });
  }
}