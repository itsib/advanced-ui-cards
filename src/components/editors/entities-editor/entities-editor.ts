import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant, IEntityConfigSchema } from 'types';
import { ISelectOption } from '../../select/select';
import { fireEvent } from '../../../utils/fire-event';
import { getEntitiesSelectOptions } from '../../../utils/object-to-select-option';
import styles from './entities-editor.scss';

declare global {
  interface HTMLElementTagNameMap {
    'lc-entities-editor': EntitiesEditor;
  }

  interface HASSDomEvents {
    'entities-changed': {
      entities: IEntityConfigSchema[];
    };
  }
}

@customElement('lc-entities-editor')
export class EntitiesEditor extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  entities?: IEntityConfigSchema[];

  @state()
  options: ISelectOption[] = [];

  firstUpdated(_changed: PropertyValues) {
    super.firstUpdated(_changed);
     if (!this.hass) return;

     this.options = getEntitiesSelectOptions(this.hass);
  }

  render() {
    if (!this.entities || !this.hass) return html``;

    return html`
      <h3>
        <span>${this.hass!.localize('component.lovelace_cards.entity_component._.editor.entities')}</span>
      </h3>

      ${this._renderRowsConfigs()}

      <lc-select
        class="add-entity"
        .label=${this.hass!.localize('component.lovelace_cards.entity_component._.editor.choose_entity')}
        .options=${this.options}
        @value-changed=${this._addEntity}
      ></lc-select>
    `;
  }

  private _renderRowsConfigs(): TemplateResult {
    if (!this.entities) return html``;

    return html`
      <ha-sortable handle-selector=".handle" @item-moved=${this._rowMoved}>
        <div class="entities">
          ${this.entities.map((entity, index) => this._renderRowConfig(index, entity))}
        </div>
      </ha-sortable>
    `;
  }

  private _renderRowConfig(index: number, entity: IEntityConfigSchema): TemplateResult {
    return html`
      <div class="entity-config">
        <div class="handle">
          <ha-icon icon="mdi:drag" class="icon"></ha-icon>
        </div>

        ${this._renderEntity(index, entity)}

        <lc-button-circle
          icon="mdi:close"
          .index=${index}
          .tooltip=${this.hass!.localize('component.lovelace_cards.entity_component._.editor.remove_entity')}
          class="action-button"
          @click=${this._removeRow}
          transparent
        ></lc-button-circle>

        <lc-button-circle
          icon="mdi:pencil"
          .index=${index}
          .tooltip=${this.hass!.localize('component.lovelace_cards.entity_component._.editor.configure_entity')}
          class="action-button"
          @click=${this._editRow}
          transparent
        ></lc-button-circle>
      </div>

    `;
  }

  private _renderEntity(index: number, entity: IEntityConfigSchema): TemplateResult {
    if (!('type' in entity)) {
      return html`
        <lc-select
          class="edit-entity"
          .index=${index}
          .label=${this.hass?.localize('component.lovelace_cards.entity_component._.editor.entity')}
          .options=${this.options}
          .value=${entity.entity}
          .getValue=${(value: string): string => {
            return this.hass!.entities[value]?.name || value;
          }}
          @value-changed=${this._changeValue}
        ></lc-select>
      `;
    }
    if (entity.type === 'divider') {
      return html`
        <div class="divider-entity">
          <div class="label">${this.hass?.localize('component.lovelace_cards.entity_component._.editor.divider')}</div>
          <hr class="divider" />
        </div>
      `;
    }

    return html``;
  }

  private _addEntity(event: CustomEvent) {
    const value = event.detail.value as string;
    if (value === '') {
      return;
    }

    const entity = { entity: value } as IEntityConfigSchema;

    (event.target as any).value = '';
    fireEvent(this, 'entities-changed', { entities: [...(this.entities || []), entity] });
  }

  private _editRow(event: CustomEvent) {
    const index = (event.currentTarget as any).index;
    fireEvent(this, 'edit-detail-element', {
      subElementConfig: {
        index,
        type: 'entity',
        elementConfig: this.entities![index],
      },
    });
  }

  private _removeRow(event: CustomEvent) {
    const index = (event.currentTarget as any).index;
    const entities = this.entities!.concat();

    entities.splice(index, 1);

    fireEvent(this, 'entities-changed', { entities: entities });
  }

  private _changeValue(event: CustomEvent) {
    const value = event.detail.value;
    const index = (event.target as any).index;
    const entities = this.entities!.concat();

    if (value === '' || value === undefined) {
      entities.splice(index, 1);
    } else {
      entities[index] = {
        ...entities[index],
        entity: value!,
      } as any;
    }

    fireEvent(this, 'entities-changed', { entities });
  }

  private _rowMoved(event: CustomEvent) {
    event.stopPropagation();
    const { oldIndex, newIndex } = event.detail;

    const entities = this.entities!.concat();

    entities.splice(newIndex, 0, entities.splice(oldIndex, 1)[0]);

    fireEvent(this, 'entities-changed', { entities: entities });
  }
}