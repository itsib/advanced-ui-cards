import type { PropertyValues, TemplateResult } from 'lit';
import { html, LitElement } from 'lit';
import { assert } from 'superstruct';
import {
  EditorTarget,
  HASSDomEvent,
  HomeAssistant,
  IButtonConfigSchema,
  IEntityConfigSchema,
  IGaugeConfigSchema,
  LovelaceCardEditor,
} from 'types';
import { customElement, property, state } from 'lit/decorators.js';
import { processEntities } from '../../utils/entities-utils';
import { fireEvent } from '../../utils/fire-event';
import { configElementStyle } from '../../utils/config-elements-style';
import { IServiceCardConfigSchema, ServiceCardConfigSchema } from './universal-card-schema';
import { SubElementEditorConfig } from '../../components';
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
    this._configGauges = config.gauges ? processEntities(config.gauges, { domains: ['sensor'] }) : [];
    this._configEntities = config.entities ? processEntities(config.entities) : [];
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
          .label=${this.hass.localize('component.lovelace_cards.entity_component._.editor.title')}
          .value=${this._config.title || ''}
          .configValue=${'title'}
          @input=${this._valueChanged}
        ></ha-textfield>
        
         <ha-icon-picker
          .hass=${this.hass}
          .label=${this.hass.localize('component.lovelace_cards.entity_component._.editor.icon')}
          .value=${this._config.icon || ''}
          .required=${false}
          .disabled=${false}
          .configValue=${'icon'}
          .placeholder=${'lc:placeholder'}
          @value-changed=${this._valueChanged}
        >
        </ha-icon-picker>
      </div>
      
      <lc-entities-editor
        .hass=${this.hass}
        .entities=${this._configEntities}
        @entities-changed=${this._valueChanged}
        @edit-detail-element=${this._editDetailElement}
      ></lc-entities-editor>

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
      (configValue === 'title' && target.value === this._config.title) ||
      (configValue === 'icon' && target.value === this._config.icon)
    ) {
      return;
    }

    if (configValue === 'row' || configValue === 'base-entity' || (ev.detail && ev.detail.entities)) {
      const newConfigEntities = ev.detail.entities || this._configEntities!.concat();

      if (configValue === 'row' || configValue === 'base-entity') {
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

      this._configEntities = processEntities(this._config!.entities);
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
    if (!this._config || !this.hass) return;

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
    } else if (configValue === 'entity') {
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
    } else if (configValue === 'row') {
      const index = this._subElementEditorConfig!.index!;
      const entities = this._configEntities!.concat();
      if (value) {
        entities[index] = value;
      } else {
        entities.splice(index, 1);
        this._goBack();
      }
      this._config = { ...this._config!, entities: entities };
      this._configEntities = processEntities(this._config!.entities);
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
    };

    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _handleEntitiesChanged(ev: CustomEvent) {
    const entities = ev.detail.entities;

    this._configEntities = entities;
    this._config = {
      ...this._config!,
      entities: entities as IEntityConfigSchema[],
    };

    fireEvent(this, 'config-changed', { config: this._config });
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