import { html, LitElement, TemplateResult } from 'lit';
import styles from './area-card.scss';
import { HomeAssistant, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'types';
import { t } from 'i18n';

declare global {
  interface HTMLElementTagNameMap {
    'dc-area-card': AreaCard;
  }
}

export interface AreaCardConfig extends LovelaceCardConfig {
  name: string;
  area: string;
}

export class AreaCard extends LitElement implements LovelaceCard {
  /**
   * Home assistant instance
   */
  hass!: HomeAssistant;
  /**
   * Configuration model
   * @private
   */
  private _config!: AreaCardConfig;

  static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./area-config');
    return document.createElement('dc-area-config') as LovelaceCardEditor;
  }

  static async getStubConfig(hass: HomeAssistant): Promise<AreaCardConfig> {
    const area = Object.values(hass.areas)[0];
    return {
      type: 'custom:dc-area-card',
      name: '',
      area: area?.area_id ?? '',
    };
  }

  static styles = styles;

  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  setConfig(config: AreaCardConfig): void {
    this._config = config;
  }

  render(): TemplateResult {
    return html`
      <ha-card class="area-card">
        <div class="content">
          <h5>Area Card</h5>
        </div>
      </ha-card>
    `;
  }

  getCardSize(): number {
    return 3;
  }
}

(window as any).customElements.define('dc-area-card', AreaCard);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'dc-area-card',
  name: t('area.name'),
  preview: false,
  description: t('area.description'),
});
