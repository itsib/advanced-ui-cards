import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { HaFormSchema, HomeAssistant, LovelaceCardEditor, ValueChangeEvent } from 'types';
import styles from './area-config.scss';
import { fireEvent } from '../../utils/fire-event';
import { t } from 'i18n';
import { AreaCardConfig } from './area-card';

const SCHEMA: HaFormSchema[] = [
  {
    name: 'name',
    type: 'string',
    required: false,
  },
  {
    name: 'area',
    required: true,
    selector: {
      area: {},
    },
  },
];

export class AreaConfig extends LitElement implements LovelaceCardEditor {
  /**
   * Home assistant instance
   */
  public hass!: HomeAssistant;
  /**
   * Configuration model
   * @private
   */
  private config!: AreaCardConfig;

  static styles = styles;

  static properties = {
    hass: {},
    config: { attribute: false },
  };

  setConfig(config: AreaCardConfig): void {
    this.config = config;
  }

  shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config || !this.hass) {
      return true;
    }

    return changedProps.has('config');
  }

  render(): TemplateResult {
    if (!this.hass || !this.config) {
      return html``;
    }

    console.log(this.hass.areas);

    return html`
      <slot></slot>
      <div class="area-config">
        <ha-form
          .hass="${this.hass}"
          .data="${this.config}"
          .schema="${SCHEMA}"
          .computeLabel="${this._computeLabel}"
          .computeHelper="${this._computeHelper}"
          .localizeValue="${this._localizeValue}"
          @value-changed="${this._valueChanged}"
        >
        </ha-form>
      </div>
    `;
  }

  private _computeLabel(schema: HaFormSchema): string | undefined {
    return t(`config.${schema.name}.label`);
  }

  private _computeHelper(schema: HaFormSchema): string | undefined {
    return t(`area.config.${schema.name}.helper`);
  }

  private _localizeValue(key: string): string {
    return t(key);
  }

  private _valueChanged(event: ValueChangeEvent<AreaCardConfig>): void {
    fireEvent(this, 'config-changed', { config: event.detail.value });
  }
}

customElements.define('lc-area-config', AreaConfig);
