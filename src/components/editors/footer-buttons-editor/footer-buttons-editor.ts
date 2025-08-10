import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant, IButtonConfigSchema, IEntityConfigSchema } from 'types';
import { fireEvent } from '../../../utils/fire-event';
import type { SubElementEditorConfig } from '../sub-element-editor/sub-element-editor';
import { formatActionName } from '../../../utils/format-action-name';
import { getServicesSelectOptions } from '../../../utils/object-to-select-option';
import styles from './footer-buttons-editor.scss';
import type { ISelectOption } from '../../select/select';

declare global {
  interface HTMLElementTagNameMap {
    'lc-footer-buttons-editor': FooterButtonsEditor;
  }

  interface HASSDomEvents {
    'edit-detail-element': {
      subElementConfig: SubElementEditorConfig<IButtonConfigSchema | IEntityConfigSchema>;
    };
  }
}

@customElement('lc-footer-buttons-editor')
class FooterButtonsEditor extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  buttons?: IButtonConfigSchema[];

  @state()
  options: ISelectOption[] = [];

  firstUpdated(_changed: PropertyValues) {
    super.firstUpdated(_changed);

    if (!this.hass) return;
    this.options = getServicesSelectOptions(this.hass);
  }

  render() {
    if (!this.hass) return html``;

    return html`
      <h3>
        <span>${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.buttons')}</span>
      </h3>

      ${this._renderButtonsConfigs()}

      <lc-select
        class="add-button"
        .label=${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.choose_action')}
        .options=${this.options}
        @value-changed=${this._addButton}
      ></lc-select>
    `;
  }

  private _renderButtonsConfigs(): TemplateResult {
    if (!this.buttons) return html``;

    return html`
      <ha-sortable handle-selector=".handle" @item-moved=${this._rowMoved}>
        <div class="buttons">
          ${this.buttons.map((button, index) => this._renderButtonConfig(index, button))}
        </div>
      </ha-sortable>
    `;
  }

  private _renderButtonConfig(index: number, button: IButtonConfigSchema): TemplateResult {
    return html`
      <div class="button-config">
        <div class="handle">
          <ha-icon icon="mdi:drag" class="icon"></ha-icon>
        </div>

        <lc-select
          class="edit-button"
          .index=${index}
          .label=${this.hass?.localize('component.advanced_ui_cards.entity_component._.editor.button')}
          .getValue=${(value: string) => {
            const [domain, action] = value.split('.') as [string, string];
            const service = action && this.hass?.services?.[domain]?.[action] || undefined;
            return service ? formatActionName(domain, service, this.hass!.localize) : value;
          }}
          .options=${this.options}
          .value=${button.action}
          @value-changed=${this._changeValue}
        ></lc-select>

        <lc-button-circle
          icon="mdi:close"
          .index=${index}
          .tooltip=${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.remove_button')}
          class="action-button"
          @click=${this._removeRow}
          transparent
        ></lc-button-circle>

        <lc-button-circle
          icon="mdi:pencil"
          .index=${index}
          .tooltip=${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.configure_button')}
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
    const index = (event.target as any).index as number;
    const buttons = this.buttons!.concat();

    if (value === '' || value === undefined) {
      buttons.splice(index, 1);
    } else {
      buttons[index] = {
        ...buttons[index],
        action: value!,
      } as any;
    }

    fireEvent(this, 'buttons-changed', { buttons });
  }

  private _rowMoved(event: CustomEvent) {
    event.stopPropagation();
    const { oldIndex, newIndex } = event.detail;

    const buttons = this.buttons!.concat();

    buttons.splice(newIndex, 0, buttons.splice(oldIndex, 1)[0]!);

    fireEvent(this, 'buttons-changed', { buttons: buttons });
  }
}
