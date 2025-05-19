import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { HASSDomEvent, HomeAssistant } from 'types';
import { fireEvent } from '../../../utils/fire-event';
import styles from './sub-element-editor.scss';

export interface SubElementEditorConfig<T = any> {
  index?: number;
  elementConfig?: T;
  saveElementConfig?: (elementConfig: any) => void;
  context?: any;
  type: 'footer-button' | 'entity' | 'gauge';
}

export interface GUIModeChangedEvent {
  guiMode: boolean;
  guiModeAvailable: boolean;
}

interface HuiElementEditor extends Element {
  toggleMode: () => void;
}

@customElement('lc-sub-element-editor')
export class HuiSubElementEditor extends LitElement {
  static styles = styles;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public config!: SubElementEditorConfig;

  @state() private _guiModeAvailable = true;

  @state() private _guiMode = true;

  @query('.editor') private _editorElement?: HuiElementEditor;

  render(): TemplateResult {
    return html`
      ${this._renderHeader()}
      ${this._renderEditor()}
    `;
  }

  private _renderHeader() {
    if (!this.hass || !this.config) return html``;

    return html`
      <div class="header">
        <div class="back-title">
          <lc-button-circle
            icon="lc:back"
            .tooltip=${this.hass!.localize('ui.common.back')}
            @click=${this._goBack}
            transparent
          ></lc-button-circle>
          ${this._renderTitle()}
        </div>
        <lc-button-circle
          type="button"
          role="button"
          class="gui-mode-button"
          @click=${this._toggleMode}
          .icon=${this._guiMode ? 'mdi:code-braces' : 'mdi:list-box-outline'}
          .disabled=${!this._guiModeAvailable}
          .tooltip=${this.hass!.localize(
            this._guiMode
              ? 'ui.panel.lovelace.editor.edit_card.show_code_editor'
              : 'ui.panel.lovelace.editor.edit_card.show_visual_editor',
          )}
          transparent
        ></lc-button-circle>
      </div>`;
  }

  private _renderTitle() {
    if (!this.hass) return html``;

    let title: string;
    const translateKey = this.config.type.replace(/-/g, '_');
    switch (this.config.type) {
      case 'gauge':
         title = this.hass.localize(`component.advanced_ui_cards.entity_component._.editor.gauge_config_caption`);
        break;
      case 'footer-button':
        title = this.hass.localize(`component.advanced_ui_cards.entity_component._.editor.button_config_caption`);
        break;
      case 'entity':
        const entityType = 'type' in this.config.elementConfig ? this.config.elementConfig.type : 'entity';
        title = this.hass.localize(`component.advanced_ui_cards.entity_component._.editor.entity_config_caption`, {
          entityType: this.hass.localize(`component.advanced_ui_cards.entity_component._.editor.entity_type_${entityType}`),
        });
        break;
      default:
        title = this.hass.localize(`component.advanced_ui_cards.entity_component._.editor.${translateKey}`);
        break;
    }

    return html`<span slot="title">${title}</span>`;
  }

  private _renderEditor() {
    const type = this.config.type;

    switch (type) {
      case 'gauge':
        return html`
          <lc-gauge-editor
            class="editor"
            .hass=${this.hass}
            .value=${this.config.elementConfig}
            .context=${this.config.context}
            @config-changed=${this._handleConfigChanged}
            @GUImode-changed=${this._handleGUIModeChanged}
          ></lc-gauge-editor>
        `;
      case 'entity':
        return html`
          <lc-entity-editor
            class="editor"
            .hass=${this.hass}
            .value=${this.config.elementConfig}
            .context=${this.config.context}
            @config-changed=${this._handleConfigChanged}
            @GUImode-changed=${this._handleGUIModeChanged}
          ></lc-entity-editor>
        `;
      case 'footer-button':
        return html`
          <lc-footer-button-editor
            class="editor"
            .hass=${this.hass}
            .value=${this.config.elementConfig}
            .context=${this.config.context}
            @config-changed=${this._handleConfigChanged}
            @GUImode-changed=${this._handleGUIModeChanged}
          ></lc-footer-button-editor>
        `;
      default:
        return html``;
    }
  }

  private _goBack(): void {
    fireEvent(this, 'go-back');
  }

  private _toggleMode(): void {
    this._editorElement?.toggleMode();
  }

  private _handleGUIModeChanged(ev: HASSDomEvent<GUIModeChangedEvent>): void {
    ev.stopPropagation();
    this._guiMode = ev.detail.guiMode;
    this._guiModeAvailable = ev.detail.guiModeAvailable;
  }

  private _handleConfigChanged(ev: CustomEvent): void {
    this.config.elementConfig = ev.detail.config;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-sub-element-editor': HuiSubElementEditor;
  }

  interface HASSDomEvents {
    'go-back': {};
  }
}