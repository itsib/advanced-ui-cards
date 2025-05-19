import { forwardHaptic } from './haptic';
import { fireEvent } from './fire-event';
import { ActionConfig, ConfirmationRestrictionConfig, HomeAssistant } from 'types';
import { domainToName } from './localization';
import { mainWindow } from './get-main-window';
import { toggleEntity } from './entities-utils';
import { showToast } from './show-toast';

export interface ActionConfigParams {
  entity?: string;
  camera_image?: string;
  image_entity?: string;
  hold_action?: ActionConfig;
  tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export function isShowConfirmation(confirmation?: ConfirmationRestrictionConfig | boolean, userId?: string): boolean {
  if (!confirmation) return false;

  if (confirmation === true) return true;

  return !confirmation.exemptions || !confirmation.exemptions.some((e) => e.user === userId);
}

export async function handleAction(node: HTMLElement, hass: HomeAssistant, config: ActionConfigParams, action: string): Promise<void> {
  let actionConfig: ActionConfig | undefined;

  if (action === 'double_tap' && config.double_tap_action) {
    actionConfig = config.double_tap_action;
  } else if (action === 'hold' && config.hold_action) {
    actionConfig = config.hold_action;
  } else if (action === 'tap' && config.tap_action) {
    actionConfig = config.tap_action;
  }

  if (!actionConfig) {
    actionConfig = {
      action: 'more-info',
    };
  }

  // Show confirmation dialog
  if (isShowConfirmation(actionConfig?.confirmation, hass!.user?.id)) {
    forwardHaptic('warning');

    let serviceName = '';
    if (actionConfig.action === 'call-service' || actionConfig.action === 'perform-action') {
      const [domain, service] = (actionConfig.perform_action || actionConfig.service)!.split('.', 2);

      const serviceDomains = hass.services;

      if (domain in serviceDomains && service in serviceDomains[domain]) {
        await hass.loadBackendTranslation('title');
        const localize = await hass.loadBackendTranslation('entity');

        serviceName += domainToName(localize, domain);
        serviceName += ': ';
        serviceName += localize(`component.${domain}.services.${serviceName}.name`) || serviceDomains[domain][service].name || service;
      }
    }

    const utils = await mainWindow.loadCardHelpers();

    const text = actionConfig.confirmation!.text || hass.localize('ui.panel.lovelace.cards.actions.action_confirmation', {
      action: (serviceName || hass.localize(`ui.panel.lovelace.editor.action-editor.actions.${actionConfig.action}`) || actionConfig.action),
    });

    if (!(await utils.showConfirmationDialog(node, { text }))) {
      return;
    }
  }

  switch (actionConfig.action) {
    case 'more-info': {
      const entityId = actionConfig.entity || config.entity || config.camera_image || config.image_entity;

      if (entityId) {
        fireEvent(node, 'hass-more-info', { entityId });
      } else {
        showToast(node, { message: hass.localize('ui.panel.lovelace.cards.actions.no_entity_more_info') });
        forwardHaptic('failure');
      }
      break;
    }
    case 'url': {
      if (actionConfig.url_path) {
        window.open(actionConfig.url_path);
      } else {
        showToast(node, {
          message: hass.localize('ui.panel.lovelace.cards.actions.no_url'),
        });
        forwardHaptic('failure');
      }
      break;
    }
    case 'toggle': {
      if (config.entity) {
        toggleEntity(hass, config.entity!);
        forwardHaptic('light');
      } else {
        showToast(node, {
          message: hass.localize(
            'ui.panel.lovelace.cards.actions.no_entity_toggle',
          ),
        });
        forwardHaptic('failure');
      }
      break;
    }
    case 'perform-action':
    case 'call-service': {
      if (!actionConfig.perform_action && !actionConfig.service) {
        showToast(node, { message: hass.localize('ui.panel.lovelace.cards.actions.no_action') });
        forwardHaptic('failure');
        return;
      }
      const [domain, service] = (actionConfig.perform_action || actionConfig.service)!.split('.', 2);

      hass.callService(
        domain,
        service,
        actionConfig.data ?? actionConfig.service_data,
        actionConfig.target,
      );
      forwardHaptic('light');
      break;
    }
    case 'fire-dom-event': {
      fireEvent(node, 'll-custom', actionConfig);
    }
  }
}
