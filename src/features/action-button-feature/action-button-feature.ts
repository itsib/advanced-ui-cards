import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HassEntity, HomeAssistant } from 'types';
import { computeDomain } from '../../utils/entities-utils';
import styles from './action-button-feature.scss';

export interface CircleButtonFeatureConfig {
  type: string;
  label?: string;
  icon?: string;
  color?: string;
}

function isSupported(stateObj: { entity_id: string }) {
  const domain = computeDomain(stateObj.entity_id);
  return domain === 'button' || domain === 'input_button';
}

@customElement('lc-action-button-feature')
class ActionButtonFeature extends LitElement {
  static styles = styles;

  static getStubConfig(): CircleButtonFeatureConfig {
    return {
      type: 'custom:lc-circle-button-feature',
      label: 'Circle Button Feature',
      icon: 'mdi:gesture-tap-button',
      color: 'success',
    };
  }

  @property({ attribute: true })
  hass?: HomeAssistant;

  @property({ attribute: true })
  stateObj?: HassEntity;

  @state()
  private _config?: CircleButtonFeatureConfig;

  setConfig(config?: CircleButtonFeatureConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }

    this._config = config;
  }

  render() {
    if (!this._config || !this.hass || !this.stateObj || !isSupported(this.stateObj)) {
      return null;
    }

    return html`
      <lc-circle-button class="button" .icon=${this._config.icon} .tooltip=${this._config.label} .color=${this._config.color} @click=${this._press} />
    `;
  }

  private _press(event: Event) {
    event.stopPropagation();
    this.hass!.callService('input_button', 'press', {
      entity_id: this.stateObj!.entity_id,
    });
  }
}

(window as any).customCardFeatures = (window as any).customCardFeatures || [];
(window as any).customCardFeatures.push({
  type: 'lc-action-button-feature',
  name: 'Circle Button',
  supported: isSupported,
  configurable: true,
});