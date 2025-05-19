import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant, IButtonConfigSchema } from 'types';
import { ButtonStatus } from '../button-circle/button-circle';
import { forwardHaptic } from '../../utils/haptic';
import { isShowConfirmation } from '../../utils/handle-action';
import { domainToName } from '../../utils/licalization';
import { mainWindow } from '../../utils/get-main-window';
import style from './footer-buttons.scss';

@customElement('lc-footer-buttons')
class FooterButtons extends LitElement {
  static styles = style;

  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ attribute: false }) buttons?: IButtonConfigSchema[];

  @state() private _statuses: (ButtonStatus | undefined)[] = [];

  private _animationTimer: (ReturnType<typeof setTimeout> | undefined)[] = [];

  protected render(): unknown {
    if (!this.buttons?.length) {
      return html``;
    }

    return html`
      <div class="footer">
        <hr class="divider" role="separator" />

        <div class="buttons">
          ${this.buttons.map((config, index) => this._renderButton(index, config))}
        </div>
      </div>
    `;
  }

  private _renderButton(index: number, config?: IButtonConfigSchema | null): TemplateResult {
    if (!config) {
      return html``;
    }

    return html`
      <div class="btn-wrap">
        <lc-button-circle
          data-index=${index}
          color=${config.color}
          icon=${config.icon}
          tooltip=${config.tooltip}
          .status=${this._statuses[index]}
          @click=${this._onClick}
        ></lc-button-circle>
      </div>
    `;
  }

  private async _onClick(event: Event) {
    event.stopPropagation();
    const element = event.target as HTMLElement;
    const index = parseInt(element.dataset.index!);

    if (this._animationTimer[index]) {
      clearTimeout(this._animationTimer[index]);
      this._animationTimer[index] = undefined;
    }

    if (this._statuses[index] === 'loading') {
       return;
    }

    this._setButtonStatus(index, 'loading');

    const config = this.buttons![index];
    if (await this._isConfirmed(config)) {
      this._setButtonStatus(index, undefined);
      return;
    }

    const [domain, service] = config.action.split('.', 2);

    const begin = Date.now();

    try {
      await this.hass!.callService(domain, service, config.data, config.target);

      const delay = Date.now() - begin;
      if (delay > 600) {
        this._setCallResult(index, 'success')();
      } else {
        this._animationTimer[index] = setTimeout(this._setCallResult(index, 'success'), 600 - delay);
      }
    } catch {
      this._setCallResult(index, 'error')();
    }
  }

  private async _isConfirmed(config: IButtonConfigSchema): Promise<boolean> {
    if (!isShowConfirmation(config.confirmation, this.hass!.user?.id)) return false;

    forwardHaptic('warning');

    let text = '';
    if (typeof config.confirmation !== 'boolean' && config.confirmation.text) {
      text = config.confirmation.text;
    } else {
      const [domain, service] = config.action!.split('.', 2);
      const serviceDomains = this.hass!.services;


      let serviceName = '';
      if (domain in serviceDomains && service in serviceDomains[domain]) {
        await this.hass!.loadBackendTranslation('title');
        const localize = await this.hass!.loadBackendTranslation('entity');

        serviceName += domainToName(localize, domain);
        serviceName += ': ';
        serviceName += localize(`component.${domain}.services.${serviceName}.name`) || serviceDomains[domain][service].name || service;
      }

      text = this.hass!.localize('ui.panel.lovelace.cards.actions.action_confirmation', {
        action: (serviceName || this.hass!.localize(`ui.panel.lovelace.editor.action-editor.actions.${config.action}`) || config.action),
      });
    }

    const utils = await mainWindow.loadCardHelpers();
    return !(await utils.showConfirmationDialog(this, { text, title: config.tooltip }));
  }

  private _setButtonStatus(index: number, status: ButtonStatus | undefined) {
    this._statuses[index] = status;
    this._statuses = [...this._statuses];
  }

  private _setCallResult(index: number, status: Extract<ButtonStatus, 'success' | 'error'>) {
    return () => {
      forwardHaptic('light');
      this._setButtonStatus(index, status);

      this._animationTimer[index] = setTimeout(() => {
        this._setButtonStatus(index, undefined);
      }, 2500);
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-footer-buttons': FooterButtons;
  }
}