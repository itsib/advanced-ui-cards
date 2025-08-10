import type { PropertyValues, TemplateResult } from 'lit';
import { html, LitElement } from 'lit';
import { assert } from 'superstruct';
import type {
  EditorTarget,
  HASSDomEvent,
  HomeAssistant,
  IButtonConfigSchema,
  IEntityConfigSchema,
  IGaugeConfigSchema,
  LovelaceCardEditor,
} from 'types';
import { customElement, property, state } from 'lit/decorators.js';
import { processEntities, processGauges } from '../../utils/entities-utils';
import { fireEvent } from '../../utils/fire-event';
import { configElementStyle } from '../../utils/config-elements-style';
import { type IServiceCardConfigSchema, ServiceCardConfigSchema } from './universal-card-schema';
import type { SubElementEditorConfig } from '../../components';
import styles from './universal-card-config.scss';

interface EditDetailElementEvent {
  subElementConfig: SubElementEditorConfig;
}

@customElement('lc-universal-card-config')
class UniversalCardConfig extends LitElement implements LovelaceCardEditor {
  static styles = [styles, configElementStyle];

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: IServiceCardConfigSchema;

  @state() private _configGauges?: IGaugeConfigSchema[];

  @state() private _configEntities?: IEntityConfigSchema[];

  @state() private _configButtons?: IButtonConfigSchema[];

  @state() private _subElementEditorConfig?: SubElementEditorConfig;

  setConfig(config: IServiceCardConfigSchema): void {
    assert(config, ServiceCardConfigSchema);
    this._config = config;
    this._configGauges = processGauges(config.gauges);
    this._configEntities = processEntities(config.entities);
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

    return html`
      <div class="title-icon-fields">
        <ha-textfield
          .label=${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.title')}
          .value=${this._config.title || ''}
          .configValue=${'title'}
          @input=${this._valueChanged}
        ></ha-textfield>

        <ha-icon-picker
          .hass=${this.hass}
          .label=${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.icon')}
          .value=${this._config.icon || ''}
          .required=${false}
          .disabled=${false}
          .configValue=${'icon'}
          .placeholder=${'lc:placeholder'}
          @value-changed=${this._valueChanged}
        >
        </ha-icon-picker>
      </div>

      <!-- Enable animation -->
      <div class="row-full switch-selector">
        <span>${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.animation_switch_description')}</span>

        <lc-switch
          .checked=${!!this._config!.animation}
          @change=${this._toggleAnimation}
        ></lc-switch>
      </div>

      <lc-gauges-editor
        .hass=${this.hass}
        .gauges=${this._configGauges}
        .configValue=${'gauges'}
        @gauges-changed=${this._valueChanged}
        @edit-detail-element=${this._editDetailElement}
      ></lc-gauges-editor>

      <lc-entities-editor
        .hass=${this.hass}
        .entities=${this._configEntities}
        .configValue=${'entities'}
        @entities-changed=${this._valueChanged}
        @edit-detail-element=${this._editDetailElement}
      ></lc-entities-editor>

      <lc-footer-buttons-editor
        .hass=${this.hass}
        .buttons=${this._configButtons}
        .configValue=${'buttons'}
        @buttons-changed=${this._valueChanged}
        @edit-detail-element=${this._editDetailElement}
      ></lc-footer-buttons-editor>
    `;
  }

  private _toggleAnimation(event: CustomEvent) {
    const config = { ...this._config! };
    config.animation = !!event.detail.checked;

    fireEvent(this as HTMLElement, 'config-changed', { config });
  }

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) return;

    const target = ev.target! as EditorTarget;
    const configValue = target.configValue || this._subElementEditorConfig?.type;
    const value = target.checked !== undefined ? target.checked : target.value || (configValue && configValue in ev.detail ? ev.detail[configValue] : ev.detail.value);

    if (!configValue) {
      throw new Error('No config field provided');
    }

    if (
      (configValue === 'title' && target.value === this._config.title) ||
      (configValue === 'icon' && target.value === this._config.icon)
    ) {
      return;
    }

    const config = { ...this._config };
    if (!value) {
      Reflect.deleteProperty(config, configValue);
    } else {
      config[configValue] = value;
    }

    fireEvent(this, 'config-changed', { config });
  }

  private _handleSubElementChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) return;

    const configValue = this._subElementEditorConfig?.type;
    const value = ev.detail.config;


    switch (configValue) {
      case 'footer-button': {
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
        break;
      }
      case 'entity': {
        const index = this._subElementEditorConfig!.index!;
        const entities: IEntityConfigSchema[] = [...(this._configEntities || [])];
        if (value) {
          entities[index] = value;
        } else {
          entities.splice(index, 1);
          this._goBack();
        }
        this._config = { ...this._config!, entities };
        this._configEntities = entities;
        break;
      }
      case 'gauge': {
        const index = this._subElementEditorConfig!.index!;
        const gauges: IGaugeConfigSchema[] = [...(this._configGauges || [])];
        if (value) {
          gauges[index] = value;
        } else {
          gauges.splice(index, 1);
          this._goBack();
        }
        this._config = { ...this._config!, gauges };
        this._configGauges = gauges;
        break;
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

  private _goBack(): void {
    this._subElementEditorConfig = undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-universal-card-config': UniversalCardConfig;
  }
}