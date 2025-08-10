import { customElement, property, query, state } from 'lit/decorators.js';
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import type { HomeAssistant, IGaugeConfigSchema, IGaugeLevelConfigSchema } from 'types';
import { fireEvent } from '../../../utils/fire-event';
import { getEntitiesSelectOptions } from '../../../utils/object-to-select-option';
import { THEME_COLORS } from '../../../utils/format-colors';
import { assert } from 'superstruct';
import { type ISelectOption } from '../../select/select';
import { GaugeConfigSchema } from '../../../schemas/gauge-config-schema';
import { precisionToMinStep, round } from '../../../utils/math';
import styles from './gauge-editor.scss';

declare global {
  interface HTMLElementTagNameMap {
    'lc-gauge-editor': GaugeEditor;
  }

  interface HASSDomEvents {
    'GUImode-changed': {
      guiMode: boolean;
      guiModeAvailable: boolean;
    };
  }
}

@customElement('lc-gauge-editor')
class GaugeEditor extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  value?: IGaugeConfigSchema;

  @query('ha-yaml-editor')
  private _yamlEditor?: HTMLInputElement;

  @state()
  private _guiSupported?: boolean;

  @state()
  private _error?: string;

  @state()
  private _guiMode = true;

  @state()
  private _options: ISelectOption[] = [];

  get min(): number {
    return this.value?.min ?? 0;
  }

  get max(): number {
    return this.value?.max ?? 100;
  }

  get precision() {
    return this.value?.precision ?? 2;
  }

  get hasError(): boolean {
    return !!this._error;
  }

  get hasWarning(): boolean {
    return false;
  }

  get GUImode(): boolean {
    return this._guiMode;
  }

  set GUImode(guiMode: boolean) {
    this._guiMode = guiMode;
    this.updateComplete.then(() => {
      fireEvent(this as HTMLElement, 'GUImode-changed', {
        guiMode,
        guiModeAvailable: !(
          this.hasError ||
          this._guiSupported === false
        ),
      });
    });
  }

  toggleMode() {
    this.GUImode = !this.GUImode;
  }

  focusYamlEditor() {
    this._yamlEditor?.focus();
  }

  render(): TemplateResult {
    if (!this.hass || !this.value) return html``;

    if (!this._guiMode) {
      return this._renderYamlEditor();
    }

    return html`
      <div class="container">
        <!-- Entity -->
        <lc-select
          class="row-full"
          .value=${this.value.entity}
          .configValue=${'entity'}
          .label=${this.hass?.localize('component.advanced_ui_cards.entity_component._.editor.entity')}
          .options=${this._options}
          .getValue=${(value: string): string => {
            return this.hass!.entities[value]?.name || value;
          }}
          @value-changed=${this._valueChanged}
        ></lc-select>

        <!-- attribute -->
        ${this._renderAttributeSelect()}

        <!-- Name -->
        <ha-textfield
          class="row-cell-1.5x"
          .hass=${this.hass}
          .label="${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.name')}"
          .value=${this.value.name || ''}
          .configValue=${'name'}
          @input=${this._valueChanged}
        ></ha-textfield>

        <!-- Unit -->
        <ha-textfield
          class="row-cell-1.5x"
          .hass=${this.hass}
          .label="${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.unit')}"
          .value=${this.value.unit || ''}
          .configValue=${'unit'}
          @input=${this._valueChanged}
        ></ha-textfield>

        <!-- Min -->
        <ha-selector
          class="row-cell"
          .hass=${this.hass}
          .label=${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.min')}
          .value=${this.min}
          .required=${false}
          .configValue=${'min'}
          .selector=${{
            number: {
              max: this.max,
              step: precisionToMinStep(this.precision),
            },
          }}
          .placeholder=${'0'}
          .localize=${this.hass.localize}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Max -->
        <ha-selector
          class="row-cell"
          .hass=${this.hass}
          .label=${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.max')}
          .value=${this.max}
          .required=${false}
          .configValue=${'max'}
          .selector=${{
            number: {
              min: this.min,
              step: precisionToMinStep(this.precision),
            },
          }}
          .placeholder=${'100'}
          .localize=${this.hass.localize}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Decimals -->
        <ha-selector
          class="row-cell"
          .hass=${this.hass}
          .label=${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.precision')}
          .value=${this.precision}
          .required=${false}
          .configValue=${'precision'}
          .selector=${{
            number: {
              min: 0,
              step: 1,
            },
          }}
          .placeholder=${'2'}
          .localize=${this.hass.localize}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Enable confirmation -->
        <div class="row-full enable-digits">
          <span>${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.show_scale_digits')}</span>

          <lc-switch
            .checked=${!!this.value!.digits}
            @change=${this._toggleDigitsSwitch}
          ></lc-switch>
        </div>

        <!-- Levels Configuration -->
        ${this.value.levels?.map((level, index) => this._renderLevelConfig(level, index))}

        <mwc-button
          class="row-full add-button"
          outlined
          @click=${this._addLevel}
        >
          ＋ ${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.add_scale_color')}
        </mwc-button>
      </div>
    `;
  }

  firstUpdated(_changed: PropertyValues) {
    super.firstUpdated(_changed);

    if (!this.hass) return;
    this._options = getEntitiesSelectOptions(this.hass);
  }

  private _renderAttributeSelect(): TemplateResult {
    if (!this.value || !this.hass) return html``;

    const stateObj = this.hass.states[this.value.entity]!;
    const attributes = Object.keys(stateObj.attributes);
    const hideAttributes = Object.keys(stateObj.attributes).filter(attribute => typeof stateObj.attributes[attribute] !== 'number');

    if (attributes.length === hideAttributes.length) return html``;

    return html`
      <ha-selector
        class="row-full"
        .hass=${this.hass}
        .value=${this.value.attribute}
        .label=${this.hass?.localize('component.advanced_ui_cards.entity_component._.editor.input_attribute_label')}
        .helper=${this.hass?.localize('component.advanced_ui_cards.entity_component._.editor.input_attribute_hint')}
        .required=${false}
        .configValue=${'attribute'}
        .selector=${{
          attribute: {
            entity_id: this.value.entity,
            hide_attributes: hideAttributes,
          }
        }}
        @value-changed=${this._valueChanged}
      ></ha-selector>
    `;
  }

  private _renderLevelConfig(level: IGaugeLevelConfigSchema, index: number) {
    return html`
      ${index === 0 ? html`
        <div class="row-full">
          ${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.scale_colors_label')}
        </div>` : null}

      <ha-selector
        class="row-cell-2x level-number"
        .index=${index}
        .hass=${this.hass}
        .value=${level.level}
        .required=${true}
        .configValue=${'level'}
        .selector=${{
          number: {
            min: this.min,
            max: this.max,
            step: precisionToMinStep(this.precision),
            mode: 'slider',
            slider_ticks: false,
            unit_of_measurement: this.value?.unit,
          },
        }}
        .localize=${this.hass!.localize}
        @value-changed=${this._updateLevel}
      ></ha-selector>

      <ha-selector
        class="row-cell level-color"
        .index=${index}
        .hass=${this.hass}
        .label=${this.hass!.localize('component.advanced_ui_cards.entity_component._.editor.color')}
        .value=${level.color}
        .required=${true}
        .configValue=${'color'}
        .selector=${{ ui_color: {} }}
        .localize=${this.hass!.localize}
        @value-changed=${this._updateLevel}
      ></ha-selector>
    `;
  }

  private _renderYamlEditor() {
    return html`
      <div class="yaml-editor">
        <ha-yaml-editor
          .defaultValue=${this.value}
          autofocus
          .hass=${this.hass}
          @value-changed=${this._handleYAMLChanged}
          dir="ltr"
        ></ha-yaml-editor>

        ${this._error ? html`
          <div class="error">${this._error}</div>` : null}
      </div>
    `;
  }

  private _handleYAMLChanged(event: CustomEvent) {
    event.stopPropagation();
    const config = event.detail.value;

    if (event.detail.isValid) {
      try {
        assert(config, GaugeConfigSchema);
        this.value = config as IGaugeConfigSchema;
        this._error = undefined;

        fireEvent(this as HTMLElement, 'config-changed', { config });
      } catch (e: any) {
        this._error = `${e.message}`.trim();
      }
    } else {
      this._error = `${event.detail.errorMsg}`.trim();
    }
  }

  private _toggleDigitsSwitch(event: CustomEvent) {
    const config = { ...this.value! };
    config.digits = !!event.detail.checked;

    fireEvent(this as HTMLElement, 'config-changed', { config });
  }

  private _updateLevel(event: CustomEvent) {
    const index = (event.target as any).index;
    const configValue = (event.target as any).configValue as keyof IGaugeLevelConfigSchema;

    if (this.value?.levels?.[index]?.[configValue] === event.detail.value) return;
    const config = { ...this.value! };

    // Delete level if value empty
    if (!event.detail.value && configValue === 'color') {
      const levels: IGaugeLevelConfigSchema[] = [];
      for (let i = 0; i < config.levels!.length; i++) {
        if (i !== index) {
          levels.push({ ...config.levels![i]! });
        }
      }
      config.levels = levels;
    } else {
      config.levels = config.levels!.map(level => ({ ...level }));
      config.levels![index] = {
        ...config.levels![index],
        [configValue]: event.detail.value,
      } as IGaugeLevelConfigSchema;
    }

    fireEvent(this as HTMLElement, 'config-changed', { config });
  }

  private _addLevel() {
    const config = { ...this.value! };
    config.levels = (config.levels || [])!
      .map(level => ({ ...level }))
      .sort((l0, l1) => l0.level - l1.level);

    let level: number;
    let color: string;
    if (config.levels.length > 0) {
      const onePercent = (this.max - this.min) / 100;
      const inc = round(onePercent * 10, this.precision);
      const lastLevel = config.levels[config.levels.length - 1]!.level;

      level = Math.min(lastLevel + inc, this.max);
      color = THEME_COLORS[config.levels.length]!;
    } else {
      level = this.min;
      color = THEME_COLORS[0]!;
    }

    config.levels.push({ level, color });

    fireEvent(this as HTMLElement, 'config-changed', { config });
  }

  private _valueChanged(event: CustomEvent) {
    const configValue = (event.target as any).configValue;
    const value = ['min', 'max', 'precision', 'attribute'].includes(configValue) ? event.detail.value : (event.target as any).value;

    const config = {
      ...this.value!,
      [configValue]: value,
    };

    fireEvent(this as HTMLElement, 'config-changed', { config });
  }
}