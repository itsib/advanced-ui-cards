import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { HomeAssistant } from 'types';
import { IButtonConfigSchema } from '../../../schemas/button-config-schema';
import { fireEvent } from '../../../utils/fire-event';
import styles from './footer-buttons-editor.scss';
import { SubElementEditorConfig } from '../sub-element-editor/sub-element-editor';

declare global {
  interface HTMLElementTagNameMap {
    'lc-footer-buttons-editor': FooterButtonsEditor;
  }

  interface HASSDomEvents {
    'edit-detail-element': {
      subElementConfig: SubElementEditorConfig<IButtonConfigSchema>;
    }
  }
}

@customElement('lc-footer-buttons-editor')
class FooterButtonsEditor extends LitElement {
  static styles = styles;

  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ attribute: false }) buttons?: IButtonConfigSchema[];

  @property() label?: string;

  render() {
    if (!this.hass) return html``;

    return html`
      <h3>
        <span>${this.hass!.localize('ui.panel.lovelace.editor.card.generic.actions')}</span>
        <span>&nbsp;</span>
        <span>(${this.hass!.localize('ui.panel.lovelace.editor.card.config.optional')})</span>
      </h3>
      
      ${this._renderButtons()}

      <lc-action-selector
        class="add-entity"
        .hass=${this.hass}
        @value-changed=${this._addButton}
      ></lc-action-selector>
    `;
  }

  private _renderButtons(): TemplateResult {
    if (!this.buttons) return html``;

    return html`
      <ha-sortable handle-selector=".handle" @item-moved=${this._rowMoved}>
        <div class="buttons">
          ${this.buttons.map((button, index) => this._renderButton(index, button))}
        </div>
      </ha-sortable>
    `;
  }

  private _renderButton(index: number, button: IButtonConfigSchema): TemplateResult {
    return html`
      <div class="button-config">
        <div class="handle">
          <ha-icon icon="mdi:drag" class="icon"></ha-icon>
        </div>

        <lc-action-selector
          class="edit-button"
          .index=${index}
          .hass=${this.hass}
          .value=${button.action}
          @value-changed=${this._changeValue}
        ></lc-action-selector>

        <lc-button-circle
          icon="mdi:close"
          .index=${index}
          .tooltip=${this.hass!.localize('ui.components.entity.entity-picker.clear')}
          class="action-button"
          @click=${this._removeRow}
          transparent
        ></lc-button-circle>

        <lc-button-circle
          icon="mdi:pencil"
          .index=${index}
          .tooltip=${this.hass!.localize('ui.components.entity.entity-picker.edit')}
          class="action-button"
          @click=${this._editRow}
          transparent
        ></lc-button-circle>
      </div>

    `;
  }

  private _addButton(event: CustomEvent) {
    const value = event.detail.value as string;
    if (value === '') {
      return;
    }

    const button = {
      action: value,
      icon: 'lc:play',
    } as IButtonConfigSchema;

    (event.target as any).value = '';
    fireEvent(this, 'buttons-changed', { buttons: [...(this.buttons || []), button] });
  }

  private _editRow(event: CustomEvent) {
    const index = (event.currentTarget as any).index;
    fireEvent(this, 'edit-detail-element', {
      subElementConfig: {
        index,
        type: 'footer-button',
        elementConfig: this.buttons![index],
      },
    });
  }

  private _removeRow(event: CustomEvent) {
    const index = (event.currentTarget as any).index;
    const buttons = this.buttons!.concat();

    buttons.splice(index, 1);

    fireEvent(this, 'buttons-changed', { buttons: buttons });
  }

  private _changeValue(event: CustomEvent) {
    const value = event.detail.value;
    const index = (event.target as any).index;
    const buttons = this.buttons!.concat();

    if (value === "" || value === undefined) {
      buttons.splice(index, 1);
    } else {
      buttons[index] = {
        ...buttons[index],
        action: value!,
      };
    }

    fireEvent(this, 'buttons-changed', { buttons });
  }

  private _rowMoved(event: CustomEvent) {
    event.stopPropagation();
    const { oldIndex, newIndex } = event.detail;

    const buttons = this.buttons!.concat();

    buttons.splice(newIndex, 0, buttons.splice(oldIndex, 1)[0]);

    fireEvent(this, 'buttons-changed', { buttons: buttons });
  }
}

