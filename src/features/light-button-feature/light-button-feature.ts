import { html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HassEntity, HomeAssistant, LovelaceCardFeature, LovelaceCardFeatureContext } from 'types';
import styles from './light-button-feature.scss';
import type { ILightButtonFeatureConfigSchema } from './light-button-feature-schema';
import { isSupported } from './is-support';
import { Color } from '../../utils/color';

@customElement('lc-light-button-feature')
class LightButtonFeature extends LitElement implements LovelaceCardFeature {
  static styles = styles;
  
  static getConfigElement() {
    return document.createElement('lc-light-button-feature-config');
  }
  
  static getStubConfig(hass: HomeAssistant, context: LovelaceCardFeatureContext): ILightButtonFeatureConfigSchema {
    return {
      type: 'custom:lc-light-button-feature',
      title: (context.entity_id && hass.entities[context.entity_id]?.name) || 'Light',
      iconOn: 'mdi:lightbulb-on',
      iconOff: 'mdi:lightbulb-off-outline',
    };
  }
  
  @property({ attribute: false })
  hass?: HomeAssistant;
  
  @property({ attribute: false })
  context?: LovelaceCardFeatureContext;
  
  @state()
  private _config?: ILightButtonFeatureConfigSchema;
  
  private get _stateObj() {
    if (!this.hass || !this.context || !this.context.entity_id) {
      return undefined;
    }
    return this.hass.states[this.context.entity_id!] as HassEntity | undefined;
  }
  
  setConfig(config?: ILightButtonFeatureConfigSchema): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    
    this._config = config;
  }
  
  render() {
    if (!this._config || !this.hass || !this.context || !this._stateObj || !isSupported(this._stateObj)) {
      return null;
    }
    const isOn = this._stateObj.state === 'on';
    
    requestAnimationFrame(() => {
    
      
    });
    
    return html`
      <button
        type="button"
        class=${isOn ? 'active' : ''}
        @click=${this._onClick}
        @transitionrun=${this._syncColors}
        @transitionend=${this._syncColors}
      >
        <ha-icon icon=${isOn ? this._config.iconOn : this._config.iconOff} class="icon"></ha-icon>
        <span>${this._config.title}</span>
      </button>
    `;
  }
  
  firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this._syncColors();
  }
  
  private _onClick(event: Event) {
    event.stopPropagation();
    
    if (!this._stateObj) return;
    
    if (this._stateObj.state === 'on') {
      this.hass!.callService('light', 'turn_off', {
        entity_id: this._stateObj.entity_id,
      });
    } else {
      this.hass!.callService('light', 'turn_on', {
        entity_id: this._stateObj.entity_id,
      });
    }
  }
  
  private _syncColors() {
    const button = this.shadowRoot?.firstElementChild as HTMLButtonElement;
    if (!button) return;
    
    const rgbString = window.getComputedStyle(button).backgroundColor;
    
    this.style.setProperty('--feature-text', Color.from(rgbString).getForeground().toString('rgb'));
  }
}
