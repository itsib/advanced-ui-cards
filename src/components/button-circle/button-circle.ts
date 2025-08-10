import { html, type TemplateResult } from 'lit';
import type { HomeAssistant, ElementConstructor, LovelaceConstructor } from 'types';
import { property } from 'lit/decorators.js';
import { formatColors } from '../../utils/format-colors';
import styles from './button-circle.scss';

export type ButtonVariant = 'default' | 'success' | 'info' | 'warning' | 'error' | string;

export type ButtonStatus = 'loading' | 'success' | 'error';

export interface IButtonCircle {
  hass: HomeAssistant;
  icon?: string;
  color?: ButtonVariant;
  tooltip?: string;
  status?: ButtonStatus;
  disabled?: boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-button-circle': IButtonCircle;
  }
}

function createComponent<T extends ElementConstructor>(Base: T) {
  class ButtonCircle extends Base {
    static styles = styles;

    @property({ attribute: true })
    icon = 'mdi:gesture-tap-button';

    @property({ attribute: 'color', reflect: true, type: String })
    set color(value: ButtonVariant) {
      this.style.setProperty('--lc-button-color', formatColors(value, 'currentColor'));
    }

    @property({ attribute: true })
    tooltip?: string;

    @property({ attribute: 'status', reflect: true, type: String })
    status?: ButtonStatus;

    @property({ attribute: 'disabled', reflect: true, type: Boolean })
    disabled = false;

    @property({ attribute: 'transparent', reflect: true, type: Boolean })
    set transparent(value: boolean) {
      this.style.setProperty('--lc-button-bg-opacity', value ? '0' : '0.15');
    };

    private _popover?: HTMLElement & Record<string, any>;

    private _popoverOff = false;

    constructor(...rest: any[]) {
      super(...rest);
    }

    render(): TemplateResult {
      return html`
        <mwc-icon-button
          type="button"
          role="button"
          class="lc-button-circle-icon"
          .disabled=${this.disabled}
          @mouseenter="${this._onMouseenter}"
          @mouseleave="${this._onMouseLeave}"
          @click=${this._onClick}
        >
          ${this._renderIcon()}
        </mwc-icon-button>
      `;
    }

    private _renderIcon(): TemplateResult {
      if (this.disabled || !this.status) {
        return html`<ha-icon icon=${this.icon} class="icon"></ha-icon>`;
      }

      switch (this.status) {
        case 'loading':
          return html`<lc-icon-spinner color="var(--lc-button-color)"></lc-icon-spinner>`;
        case 'success':
          return html`<lc-icon-success color="var(--lc-button-color)"></lc-icon-success>`;
        case 'error':
          return html`<lc-icon-error color="var(--lc-button-color)"></lc-icon-error>`;
      }
    }

    private _removePopover() {
      if (this._popover) {
        this._popover.hide();
        this._popover = undefined;
      }
    }

    private _onClick() {
      this._popoverOff = true;
      this._removePopover();
    }

    /**
     * Show tooltip popover
     * @private
     */
    private _onMouseenter() {
      if (this._popoverOff || !this.tooltip || this.status) return;

      this._popover = document.createElement('lc-popover');
      this._popover.attach(this, this.tooltip);
    }

    /**
     * Hide tooltip popover
     * @private
     */
    private _onMouseLeave() {
      this._removePopover();
      this._popoverOff = false;
    }
  }

  return ButtonCircle;
}

(async () => {
  await customElements.whenDefined('ha-icon');
  const source = await customElements.whenDefined('mwc-icon-button') as LovelaceConstructor;

  customElements.define('lc-button-circle', createComponent(source), { extends: 'button' });
})();
