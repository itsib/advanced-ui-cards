import { html, TemplateResult } from 'lit';
import type { HomeAssistant, ElementConstructor, LovelaceConstructor } from 'types';
import { property } from 'lit/decorators.js';
import styles from './circle-button.scss';

export type ButtonVariant = 'default' | 'success' | 'info' | 'warning' | 'error' | string;

export type ButtonStatus = 'loading' | 'success' | 'error';

export interface ICircleButton {
  hass: HomeAssistant;
  icon?: string;
  color?: ButtonVariant;
  tooltip?: string;
  status?: ButtonStatus;
  disabled?: boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-circle-button': ICircleButton;
  }
}

function createComponent<T extends ElementConstructor>(Base: T) {
  class LCCircleButton extends Base {
    @property({ attribute: true })
    icon: string;

    @property({ attribute: 'color', reflect: true, type: String })
    set color(value: ButtonVariant) {
      switch (value) {
        case 'default':
          this.style.setProperty('--lc-button-color', 'currentColor');
          break;
        case 'success':
          this.style.setProperty('--lc-button-color', 'var(--success-color)');
          break;
        case 'info':
          this.style.setProperty('--lc-button-color', 'var(--info-color)');
          break;
        case 'warning':
          this.style.setProperty('--lc-button-color', 'var(--warning-color)');
          break;
        case 'error':
          this.style.setProperty('--lc-button-color', 'var(--error-color)');
          break;
        default:
          this.style.setProperty('--lc-button-color', value);
          break;
      }
    }

    @property({ attribute: true })
    tooltip?: string;

    @property({ attribute: 'status', reflect: true, type: String })
    status?: ButtonStatus;

    @property({ attribute: 'disabled', reflect: true, type: Boolean })
    disabled: boolean;

    private _popover?: HTMLElement & Record<string, any>;

    private _popoverOff = false;

    static styles = styles;

    constructor(...rest: any[]) {
      super(...rest);

      this.disabled = false;
      this.icon = 'mdi:gesture-tap-button';
    }

    render(): TemplateResult {
      return html`
        <mwc-icon-button
          type="button"
          role="button"
          class="lc-circle-button-icon"
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
      if (this._popoverOff) return;

      const rect = this.getClientRects().item(0);
      if (!rect || this.status) return;

      this._popover = document.createElement('lc-popover');
      this._popover.text = this.tooltip;
      this._popover.rect = rect;
      this._popover.placement = 'top';
      this._popover.offset = 2;

      document.body.append(this._popover);
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

  return LCCircleButton;
}

(async () => {
  await customElements.whenDefined('ha-icon');
  const source = await customElements.whenDefined('mwc-icon-button') as LovelaceConstructor;

  customElements.define('lc-circle-button', createComponent(source), { extends: 'button' });
})();
