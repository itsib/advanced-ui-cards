import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './area-card-conditioner.scss';
import { HomeAssistant } from 'types';

declare global {
  interface HTMLElementTagNameMap {
    'lc-area-card-conditioner': AreaCardConditioner;
  }
}

export class AreaCardConditioner extends LitElement {
  /**
   * Home assistant instance
   */
  hass?: HomeAssistant;
  /**
   * Sensor entity ID
   */
  entity?: string;

  static properties = {
    hass: { attribute: true },
    entity: { attribute: true, type: String },
  };

  static styles = styles;

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    // if (changed.has('entity') || changed.has('hass')) {
    //
    // }
  }

  render(): TemplateResult {
    return html``;
  }
}

(window as any).customElements.define('lc-area-card-conditioner', AreaCardConditioner);
