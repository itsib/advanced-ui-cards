import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant, IButtonConfigSchema } from 'types';
import { ButtonStatus } from '../button-circle/button-circle';
import { isShowConfirmation } from '../../utils/handle-action';
import { forwardHaptic } from '../../utils/haptic';
import { domainToName } from '../../utils/localization';
import { mainWindow } from '../../utils/get-main-window';
import style from './call-action-button.scss';

@customElement('lc-call-action-button')
class CallActionButton extends LitElement {
  static styles = style;

  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  config?: IButtonConfigSchema;

  @property()
  animation = false;

  @state()
  private _status?: ButtonStatus;

  private _timeoutId?: ReturnType<typeof setTimeout>;

  render(): TemplateResult | null {
    if (!this.hass || !this.config) return null;

    return html`
      <lc-button-circle
        color=${this.config.color}
        icon=${this.config.icon}
        tooltip=${this.config.tooltip}
        .status=${this._status}
        @click=${this.animation ? this._onClickAnimated : this._onClick}
      ></lc-button-circle>
    `;
  }

  private async _onClick(event: Event) {
    event.stopPropagation();

    if (await this._isConfirmed()) {
      return;
    }

    const [domain, service] = this.config!.action.split('.', 2);

    await this.hass!.callService(domain, service, this.config!.data, this.config!.target);
  }

  private async _onClickAnimated(event: Event) {
    event.stopPropagation();

    if (this._status === 'loading') return;

    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = undefined;
    }

    this._status = 'loading';

    if (await this._isConfirmed()) {
      this._status = undefined;
      return;
    }

    const [domain, service] = this.config!.action.split('.', 2);

    const begin = Date.now();

    const handleCallResult = (status: Extract<ButtonStatus, 'success' | 'error'>) => {
      forwardHaptic('light');

      this._status = status;

      this._timeoutId = setTimeout(() => {
        this._status = undefined;
      }, 2500);
    };

    try {
      await this.hass!.callService(domain, service, this.config!.data, this.config!.target);

      const delay = Date.now() - begin;
      if (delay > 600) {
        handleCallResult('success');
      } else {
        this._timeoutId = setTimeout(() => handleCallResult('success'), 600 - delay);
      }
    } catch {
      handleCallResult('error');
    }
  }

  private async _isConfirmed(): Promise<boolean> {
    if (!isShowConfirmation(this.config!.confirmation, this.hass!.user?.id)) return false;

    forwardHaptic('warning');

    let text = '';
    if (typeof this.config!.confirmation !== 'boolean' && this.config!.confirmation.text) {
      text = this.config!.confirmation.text;
    } else {
      const [domain, service] = this.config!.action!.split('.', 2);
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
        action: (serviceName || this.hass!.localize(`ui.panel.lovelace.editor.action-editor.actions.${this.config!.action}`) || this.config!.action),
      });
    }

    const utils = await mainWindow.loadCardHelpers();
    return !(await utils.showConfirmationDialog(this, { text, title: this.config!.tooltip }));
  }
}