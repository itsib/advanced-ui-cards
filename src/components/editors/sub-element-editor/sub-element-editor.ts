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
  type: 'footer-button' | 'row';
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
    if (!this.hass) return html``;

    let title: string;
    if (this.config?.type === 'footer-button') {
      title = this.hass.localize(`component.lovelace_cards.entity_component._.button_action`);
    } else {
      title = this.hass.localize(`ui.panel.lovelace.editor.sub-element-editor.types.${this.config?.type}`);
    }

    return html`
      <div class="header">
        <div class="back-title">
          <lc-button-circle
            icon="lc:back"
            .tooltip=${this.hass!.localize('ui.common.back')}
            @click=${this._goBack}
            transparent
          ></lc-button-circle>
          <span slot="title">${title}</span>
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

  private _renderEditor() {
    const type = this.config.type;

    switch (type) {
      case 'row':
        return html`
          <hui-row-element-editor
            class="editor"
            .hass=${this.hass}
            .value=${this.config.elementConfig}
            .context=${this.config.context}
            @config-changed=${this._handleConfigChanged}
            @GUImode-changed=${this._handleGUIModeChanged}
          ></hui-row-element-editor>
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