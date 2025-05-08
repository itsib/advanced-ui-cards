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
import { EntitiesActionsCardConfigSchema, IEntitiesActionsCardConfigSchema } from './entities-actions-card-schema';
import styles from './entities-actions-card-config.scss';

interface SubElementEditorConfig {
  index?: number;
  elementConfig?:
    | LovelaceRowConfig
    | LovelaceHeaderFooterConfig
    | LovelaceCardFeatureConfig
    | LovelaceElementConfig;
  saveElementConfig?: (elementConfig: any) => void;
  context?: any;
  type: 'header' | 'footer' | 'row' | 'feature' | 'element' | 'heading-badge';
}

interface EditDetailElementEvent {
  subElementConfig: SubElementEditorConfig;
}

@customElement('lc-entities-actions-card-config')
class EntitiesActionsCardConfig extends LitElement implements LovelaceCardEditor {
  static styles = [styles, configElementStyle];

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: IEntitiesActionsCardConfigSchema;

  @state() private _configEntities?: LovelaceRowConfig[];

  @state() private _subElementEditorConfig?: SubElementEditorConfig;

  setConfig(config: IEntitiesActionsCardConfigSchema): void {
    assert(config, EntitiesActionsCardConfigSchema);
    this._config = config;
    this._configEntities = processEntities(config.entities);
  }

  protected async firstUpdated(_changedProperties: PropertyValues) {
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
        <hui-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        >
        </hui-sub-element-editor>
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
    if (!this._config || !this.hass) {
      return;
    }

    const configValue = this._subElementEditorConfig?.type;
    const value = ev.detail.config;

    if (configValue === 'row') {
      const newConfigEntities = this._configEntities!.concat();
      if (!value) {
        newConfigEntities.splice(this._subElementEditorConfig!.index!, 1);
        this._goBack();
      } else {
        newConfigEntities[this._subElementEditorConfig!.index!] = value;
      }

      this._config = { ...this._config!, entities: newConfigEntities };
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
    console.log(this._subElementEditorConfig);

    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _editDetailElement(ev: HASSDomEvent<EditDetailElementEvent>): void {
    this._subElementEditorConfig = ev.detail.subElementConfig;
    console.log(this._subElementEditorConfig);
  }

  private _handleConfigChanged(ev: any) {
    console.log(ev);
  }

  private _handleGUIModeChanged(ev: any) {
    console.log(ev);
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
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-entities-actions-card-config': EntitiesActionsCardConfig;
  }
}