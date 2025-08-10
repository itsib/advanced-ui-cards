import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant, IGaugeConfigSchema } from 'types';
import { getGaugesSelectOptions } from '../../../utils/object-to-select-option';
import type { ISelectOption } from '../../select/select';
import { fireEvent } from '../../../utils/fire-event';
import styles from './gauges-editor.scss';

declare global {
  interface HTMLElementTagNameMap {
    'lc-gauges-editor': GaugesEditor;
  }

  interface HASSDomEvents {
    'gauges-changed': {
      gauges: IGaugeConfigSchema[];
    };
  }
}

@customElement('lc-gauges-editor')
class GaugesEditor extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property()
  max = 3;

  @property({ attribute: false })
  gauges?: IGaugeConfigSchema[];

  @state()
  options: ISelectOption[] = [];

  firstUpdated(_changed: PropertyValues) {
    super.firstUpdated(_changed);
    if (!this.hass) return;

    this.options = getGaugesSelectOptions(this.hass);
  }

  render(): TemplateResult {
    if (!this.hass) return html``;

    return html`
      <h3>
        <span>${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.gauges')}</span>
      </h3>
      ${this._renderRows()}
      ${this.gauges && this.gauges.length >= 2 ? null : html`
        <lc-select
          class="add-gauge"
          .label=${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.choose_entity')}
          .hass=${this.hass}
          .options=${this.options}
          @value-changed=${this._addGauge}
        ></lc-select>
      `}
    `;
  }

  private _renderRows(): TemplateResult {
    if (!this.gauges || !this.gauges.length) return html``;

    return html`
      <ha-sortable handle-selector=".handle" @item-moved=${this._rowMoved}>
        <div class="gauges">
          ${this.gauges.map((entity, index) => {
            return html`
              <div class="gauge-config">
                <div class="handle">
                  <ha-icon icon="mdi:drag" class="icon"></ha-icon>
                </div>

                ${this._renderGauge(index, entity)}

                <lc-button-circle
                  icon="mdi:close"
                  .index=${index}
                  .tooltip=${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.remove_gauge')}
                  class="action-button"
                  @click=${this._removeGauge}
                  transparent
                ></lc-button-circle>

                <lc-button-circle
                  icon="mdi:pencil"
                  .index=${index}
                  .tooltip=${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.configure_gauge')}
                  class="action-button"
                  @click=${this._editGauge}
                  transparent
                ></lc-button-circle>
              </div>
            `;
          })}
        </div>
      </ha-sortable>
    `;
  }

  private _renderGauge(index: number, gauge: IGaugeConfigSchema) {
    return html`
      <lc-select
        class="edit-gauge"
        .index=${index}
        .label=${this.hass?.localize('component.advanced_ui_cards.entity_component._.editor.entity')}
        .options=${this.options}
        .value=${gauge.entity}
        .getValue=${(value: string): string => {
          return this.hass!.entities[value]?.name || value;
        }}
        @value-changed=${this._changeValue}
      ></lc-select>
    `;
  }

  private _addGauge(event: CustomEvent) {
    const value = event.detail.value as string;
    if (value === '' || !(value in this.hass!.states)) {
      return;
    }

    const gauge: IGaugeConfigSchema = {
      entity: value,
    };

    (event.target as any).value = '';
    fireEvent(this, 'gauges-changed', { gauges: [...(this.gauges || []), gauge] });
  }

  private _editGauge(event: CustomEvent) {
    const index = (event.currentTarget as any).index;
    fireEvent(this, 'edit-detail-element', {
      subElementConfig: {
        index,
        type: 'gauge',
        elementConfig: this.gauges![index],
      },
    });
  }

  private _removeGauge(event: CustomEvent) {
    const index = (event.currentTarget as any).index;
    const gauges = this.gauges!.concat();

    gauges.splice(index, 1);

    fireEvent(this, 'gauges-changed', { gauges: gauges });
  }

  private _changeValue(event: CustomEvent) {
    const value = event.detail.value;
    const index = (event.target as any).index;
    const gauges = this.gauges!.concat();

    if (value === '' || value === undefined) {
      gauges.splice(index, 1);
    } else {
      gauges[index] = {
        ...gauges[index],
        entity: value!,
      } as any;
    }

    fireEvent(this, 'gauges-changed', { gauges });
  }

  private _rowMoved(event: CustomEvent) {
    event.stopPropagation();
    const { oldIndex, newIndex } = event.detail;

    const gauges = this.gauges!.concat() as IGaugeConfigSchema[];

    gauges.splice(newIndex, 0, gauges.splice(oldIndex, 1)[0]!);

    fireEvent(this, 'gauges-changed', { gauges: gauges });
  }
}