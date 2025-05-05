import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { EntityConfig, HomeAssistant, LovelaceCard, LovelaceCardEditor, LovelaceRowConfig } from 'types';
import { IButtonConfig, IEntitiesActionsCardConfig } from './entities-actions-card-schema';
import { mainWindow } from '../../utils/get-main-window';
import { findEntities, processConfigEntities } from '../../utils/entities-utils';
import { isShowConfirmation } from '../../utils/handle-action';
import { forwardHaptic } from '../../utils/haptic';
import { ButtonStatus } from '../../components';
import { domainToName } from '../../utils/licalization';
import styles from './entities-actions-card.scss';

@customElement('lc-entities-actions-card')
class EntitiesActionsCard extends LitElement implements LovelaceCard {
  static async getConfigElement(): Promise<LovelaceCardEditor> {
    const source = await customElements.whenDefined('hui-entities-card') as any;
    await source.getConfigElement();

    return document.createElement('lc-entities-actions-card-config') as LovelaceCardEditor;
  }

  static getStubConfig(hass: HomeAssistant, entities: string[], entitiesFallback: string[]) {
    const maxEntities = 3;
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFallback,
      ['light', 'switch', 'sensor'],
    );

    return {
      entities: foundEntities,
    };
  }

  static styles = styles;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: IEntitiesActionsCardConfig;

  @state() private _buttons: (ButtonStatus | undefined)[] = [];

  private _configEntities?: LovelaceRowConfig[];

  private _createRowElement?: any;

  async setConfig(config: IEntitiesActionsCardConfig) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error('Entities must be specified');
    }

    const entities = processConfigEntities(config.entities);
    const utils = await mainWindow.loadCardHelpers();

    this._config = config;
    this._configEntities = entities;
    this._createRowElement = utils.createRowElement;
  }

  getCardSize(): number {
    if (!this._config) {
      return 0;
    }

    return (this._config.title ? 2 : 0) + (this._config.entities.length || 1);
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }
    return html`
      <ha-card>
        ${this._renderHeader()}
        ${this._renderEntities()}
        ${this._renderFooter()}
      </ha-card>
    `;
  }

  private _renderHeader(): TemplateResult {
    if (!this._config?.title && !this._config?.icon) {
      return html``;
    }
    const icon = this._config.icon ? html`
      <ha-icon class="icon" .icon=${this._config.icon}></ha-icon>` : '';
    return html`
      <h1 class="card-header">
        <div class="name">
          ${icon}
          ${this._config.title}
        </div>
      </h1>
    `;
  }

  private _renderEntities() {
    if (!this._configEntities) {
      return html``;
    }
    const entities = this._configEntities.map((entityConf) => this._renderEntity(entityConf));

    return html`
      <div id="states" class="card-content">${entities}</div>`;
  }

  private _renderEntity(entityConf: LovelaceRowConfig): TemplateResult {
    let config: EntityConfig;

    // Conditional entity state
    if ((!('type' in entityConf) || entityConf.type === 'conditional') && 'state_color' in this._config!) {
      config = { state_color: this._config.state_color, ...(entityConf as EntityConfig) } as EntityConfig;
    }
    // Entity is action
    else if (entityConf.type === 'perform-action') {
      config = { ...entityConf, type: 'call-service' } as EntityConfig;
    }
    // Simple entity
    else {
      config = { ...entityConf } as EntityConfig;
    }

    const element = this._createRowElement(config);
    if (this.hass) {
      element.hass = this.hass;
    }

    return html`
      <div>${element}</div>`;
  }

  private _renderFooter(): TemplateResult {
    if (!this._config?.buttons?.length) {
      return html``;
    }

    return html`
      <div class="header-footer footer">
        <hr class="divider" role="separator" />

        <div class="buttons">
          ${this._config.buttons.map((config, index) => this._renderButton(index, config))}
        </div>
      </div>
    `;
  }

  private _renderButton(index: number, config?: IButtonConfig | null): TemplateResult {
    if (!config) {
      return html``;
    }

    return html`
      <div class="btn-wrap">
        <lc-circle-button
          data-index=${index}
          color=${config.color}
          icon=${config.icon}
          tooltip=${config.tooltip}
          .status=${this._buttons[index]}
          @click=${this._onFooterButtonClick}
        ></lc-circle-button>
      </div>
    `;
  }

  private _setButtonStatus(index: number, status: ButtonStatus | undefined) {
    this._buttons[index] = status;
    this._buttons = [...this._buttons];
  }

  private _setCallResult(index: number, status: Extract<ButtonStatus, 'success' | 'error'>) {
    return () => {
      forwardHaptic('light');
      this._setButtonStatus(index, status);

      setTimeout(() => {
        this._setButtonStatus(index, undefined);
      }, 2500);
    };
  }

  private async _onFooterButtonClick(event: Event) {
    event.stopPropagation();
    const element = event.target as HTMLElement;
    const index = parseInt(element.dataset.index!);

    if (this._buttons[index] === 'loading') return;

    this._setButtonStatus(index, 'loading');

    const config = this._config!.buttons![index];
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
        setTimeout(this._setCallResult(index, 'success'), 600 - delay);
      }
    } catch {
      this._setCallResult(index, 'error')();
    }
  }

  private async _isConfirmed(config: IButtonConfig): Promise<boolean> {
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
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'entities-actions-card',
  name: 'Entities With Actions Card',
  preview: true,
  description: 'This map allows you to group entities and actions that are triggered by buttons in the footer.',
  documentationURL: 'https://github.com/itsib/lovelace-cards/blob/main/README.md',
});