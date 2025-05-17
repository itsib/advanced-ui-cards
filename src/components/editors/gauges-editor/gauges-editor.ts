import { html, LitElement, TemplateResult } from 'lit';
import styles from './gauges-editor.scss';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'types';
import { IGaugeConfigSchema } from '../../../schemas/gauge-config-schema';


class GaugesEditor extends LitElement {
  static styles = styles;

  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ attribute: false }) gauges?: IGaugeConfigSchema[];

  render(): TemplateResult {
    if (!this.hass) return html``;

    return html`
      <h3>
        <span>${this.hass!.localize('ui.panel.lovelace.editor.card.generic.actions')}</span>
        <span>&nbsp;</span>
        <span>(${this.hass!.localize('ui.panel.lovelace.editor.card.config.optional')})</span>
      </h3>
      
      ${this._renderButtons()}

      <lc-select
        class="add-entity"
        .hass=${this.hass}
        @value-changed=${this._addButton}
      ></lc-select>
    `;
  }
}