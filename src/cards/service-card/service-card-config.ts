import type { PropertyValues, TemplateResult } from 'lit';
import { html, LitElement } from 'lit';
import { assert } from 'superstruct';
import {
  EditorTarget,
  HASSDomEvent,
  HomeAssistant,
  LovelaceCardEditor,
  LovelaceCardFeatureConfig,
  LovelaceElementConfig,
  LovelaceHeaderFooterConfig,
  LovelaceRowConfig,
} from 'types';
import { customElement, property, state } from 'lit/decorators.js';
import { processEntities } from '../../utils/entities-utils';
import { fireEvent } from '../../utils/fire-event';
import { configElementStyle } from '../../utils/config-elements-style';
import {
  ServiceCardConfigSchema,
  IServiceCardConfigSchema,
  type IGaugeConfigSchema,
} from './service-card-schema';
import styles from './service-card-config.scss';
import { IButtonConfigSchema } from '../../schemas/button-config-schema';
import { SubElementEditorConfig } from '../../components';

interface EditDetailElementEvent {
  subElementConfig: SubElementEditorConfig;
}

@customElement('lc-service-card-config')
class ServiceCardConfig extends LitElement implements LovelaceCardEditor {
  static styles = [styles, configElementStyle];

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: IServiceCardConfigSchema;

  @state() private _configEntities?: IGaugeConfigSchema[];

  @state() private _configButtons?: IButtonConfigSchema[];

  @state() private _subElementEditorConfig?: SubElementEditorConfig;

  setConfig(config: IServiceCardConfigSchema): void {
    assert(config, ServiceCardConfigSchema);
    this._config = config;
    this._configEntities = processEntities(config.entities, { domains: ['sensor'] });
    this._configButtons = config.buttons;
  }

  async firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    const utils = await window.parent.loadCardHelpers();

    utils.importMoreInfoControl;
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    if (this._subElementEditorConfig) {
      return html`
        <lc-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        >
        </lc-sub-element-editor>
      `;
    }

    const optional = `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.optional')})`;

    return html`
      <div class="card-config">
        <ha-textfield
          .label="${this.hass.localize('ui.panel.lovelace.editor.card.generic.title')} ${optional}"
          .value=${this._title}
          .configValue=${'title'}
          @input=${this._valueChanged}
        ></ha-textfield>
        <ha-theme-picker
          .hass=${this.hass}
          .value=${this._theme}
          .label=${`${this.hass!.localize('ui.panel.lovelace.editor.card.generic.theme')} ${optional}`}
          .configValue=${'theme'}
          @value-changed=${this._valueChanged}
        ></ha-theme-picker>
      </div>
      <hui-entities-card-row-editor
        .hass=${this.hass}
        .entities=${this._configEntities}
        @entities-changed=${this._valueChanged}
        @edit-detail-element=${this._editDetailElement}
      ></hui-entities-card-row-editor>

      <lc-footer-buttons-editor
        .hass=${this.hass}
        .buttons=${this._configButtons}
        @buttons-changed=${this._handleButtonsChanged}
        @edit-detail-element=${this._editDetailElement}
      ></lc-footer-buttons-editor>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target! as EditorTarget;
    const configValue = target.configValue || this._subElementEditorConfig?.type;
    const value = target.checked !== undefined ? target.checked : target.value || ev.detail.config || ev.detail.value;

    if (
      (configValue === 'title' && target.value === this._title) ||
      (configValue === 'theme' && target.value === this._theme)
    ) {
      return;
    }

    if (configValue === 'row' || (ev.detail && ev.detail.entities)) {
      const newConfigEntities = ev.detail.entities || this._configEntities!.concat();

      if (configValue === 'row') {
        if (!value) {
          newConfigEntities.splice(this._subElementEditorConfig!.index!, 1);
          this._goBack();
        } else {
          newConfigEntities[this._subElementEditorConfig!.index!] = value;
        }

        this._subElementEditorConfig!.elementConfig = value;
      }

      this._config = {
        ...this._config!,
        entities: newConfigEntities,
      };

      this._configEntities = processEntities(this._config!.entities, { domains: ['counter', 'input_number', 'number', 'sensor'] });
    } else if (configValue) {
      if (value === '') {
        this._config = { ...this._config };
        delete this._config[configValue!];
      } else {
        this._config = {
          ...this._config,
          [configValue]: value,
        };
      }
    }

    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _handleSubElementChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const configValue = this._subElementEditorConfig?.type;
    const value = ev.detail.config;

     // Buttons
    if (configValue === 'footer-button') {
      const index = this._subElementEditorConfig!.index!;
      const buttons: IButtonConfigSchema[] = [...(this._configButtons || [])];
      if (value) {
        buttons[index] = value;
      } else {
        buttons.splice(index, 1);
        this._goBack();
      }
      this._config = { ...this._config!, buttons };
      this._configButtons = buttons;
    }
    else if (configValue === 'row') {
      const index = this._subElementEditorConfig!.index!;
      const entities = this._configEntities!.concat();
      if (value) {
        entities[index] = value;
      } else {
        entities.splice(index, 1);
        this._goBack();
      }
      this._config = { ...this._config!, entities: entities };
      this._configEntities = processEntities(this._config!.entities, { domains: ['counter', 'input_number', 'number', 'sensor'] });
    } else if (configValue) {
      if (value === '') {
        this._config = { ...this._config };
        delete this._config[configValue!];
      } else {
        this._config = {
          ...this._config,
          [configValue]: value,
        };
      }
    }

    this._subElementEditorConfig = {
      ...this._subElementEditorConfig!,
      elementConfig: value,
    };

    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _editDetailElement(ev: HASSDomEvent<EditDetailElementEvent>): void {
    this._subElementEditorConfig = ev.detail.subElementConfig;
  }

  private _handleButtonsChanged(ev: CustomEvent) {
    const buttons = ev.detail.buttons;

    this._configButtons = buttons;
    this._config = {
      ...this._config!,
      buttons: buttons as IButtonConfigSchema[],
    }

    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _goBack(): void {
    this._subElementEditorConfig = undefined;
  }

  get _title(): string {
    return this._config!.title || '';
  }

  get _theme(): string {
    return this._config!.theme || '';
  }

  get _icon(): string {
    return this._config!.icon || '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-service-card-config': ServiceCardConfig;
  }
}