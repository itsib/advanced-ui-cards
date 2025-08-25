import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant, LovelaceCardFeatureContext, LovelaceCardFeatureEditor } from 'types';
import { configElementStyle } from '../../utils/config-elements-style';
import { type ILightButtonFeatureConfigSchema, LightButtonFeatureConfigSchema } from './light-button-feature-schema';
import { assert } from 'superstruct';
import { isSupported } from './is-support';
import { fireEvent } from '../../utils/fire-event';
import styles from './light-button-feature-config.scss';

@customElement('lc-light-button-feature-config')
export class LightButtonFeatureConfig extends LitElement implements LovelaceCardFeatureEditor {
  static styles = [styles, configElementStyle];

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  context?: LovelaceCardFeatureContext;

  @state()
  private _config?: ILightButtonFeatureConfigSchema;

  @state()
  private _tab: 1 | 2 = 1;

  setConfig(config: ILightButtonFeatureConfigSchema) {
    assert(config, LightButtonFeatureConfigSchema);

    this._config = config;
  }

  render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }
    
    const iconValue = this._tab === 1 ? this._config.iconOn : this._config.iconOff;
    const iconLabel = this._tab === 1 ? this.hass.localize('component.advanced_ui_cards.entity_component._.editor.state_on_icon') : this.hass.localize('component.advanced_ui_cards.entity_component._.editor.state_off_icon');
    
    return html`
      <div class="container">
        <ha-textfield
          .label=${this.hass.localize('component.advanced_ui_cards.entity_component._.editor.title')}
          .value=${this._config.title || ''}
          .configValue=${'title'}
          class="row-full"
          @input=${(event: CustomEvent) => this._valueChanged(event, 'title')}
        ></ha-textfield>

        <sl-tab-group placement="top" activation="manual" @sl-tab-show=${this._tabShow}>
          <sl-tab slot="nav" panel="1" active>State On</sl-tab>
          <sl-tab slot="nav" panel="2">State Off</sl-tab>
        </sl-tab-group>

        <ha-selector
          id="light-button-icon"
          .hass=${this.hass}
          .value=${iconValue}
          .label=${iconLabel}
          .selector=${{ icon: {} }}
          .localize=${this.hass.localize}
          @value-changed=${(event: CustomEvent) => this._valueChanged(event, this._tab === 1 ? 'iconOn' : 'iconOff')}
        >
        </ha-selector>
      </div>
    `;
  }
  
  private _tabShow(event: CustomEvent) {
    this._tab = parseInt(event.detail.name) as 1 | 2;
  }

  private _valueChanged(event: CustomEvent, field: keyof ILightButtonFeatureConfigSchema) {
    event.stopPropagation();

    if (!this._config || !this.hass) return;

    const value = (event.detail && typeof event.detail === 'object' && event.detail.value) || (event.target as any).value;

    if (this._config[field] === value) {
      return;
    }

    const config = { ...this._config };
    if (value) {
      config[field] = value;
    } else {
      Reflect.deleteProperty(config, field);
    }

    fireEvent(this, 'config-changed', { config });
  }
}

window.customCardFeatures = window.customCardFeatures || [];
window.customCardFeatures.push({
  type: 'lc-light-button-feature',
  name: 'Light Button',
  supported: isSupported,
  configurable: true,
});