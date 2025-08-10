import type { HomeAssistant } from 'types';
import type { ISelectOption } from '../components';
import { getServiceIcon } from './get-service-icon';
import { computeDomain } from './entities-utils';
import { html } from 'lit';

export function getServicesSelectOptions(hass: HomeAssistant): ISelectOption[] {
  const domains = Object.keys(hass.services);
  const options: ISelectOption[] = [];
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i]!;
    const services = hass.services[domain]!;
    const servicesNames = Object.keys(services);

    for (let j = 0; j < servicesNames.length; j++) {
      const serviceName = servicesNames[j]!;
      const serviceId = `${domain}.${serviceName}`;
      options.push({
        value: serviceId,
        label: services[serviceName]!.name,
        secondLabel: serviceId,
        icon: getServiceIcon(serviceId),
      });
    }
  }

  return options;
}

export function getEntitiesSelectOptions(hass: HomeAssistant): ISelectOption[] {
  const options: ISelectOption[] = [];
  for (const [entityId, entity] of Object.entries(hass.entities)) {
    const stateObj = hass.states[entityId];

    options.push({
      value: entityId,
      label: entity.name,
      secondLabel: entityId,
      icon: html`
        <ha-state-icon
          .hass=${hass}
          .stateObj=${stateObj}
        ></ha-state-icon>
      `,
    });
  }

  return options;
}

export function getGaugesSelectOptions(hass: HomeAssistant): ISelectOption[] {
  const options: ISelectOption[] = [];
  for (const [entityId, entity] of Object.entries(hass.entities)) {
    const domain = computeDomain(entityId);

    let allowed = domain === 'counter' || domain === 'sensor' || domain === 'input_number' || domain === 'number';
    if (allowed) {
      const state = hass.states[entityId]!.state;
      allowed = !isNaN(Number(state));
    }

    if (!allowed) {
      const attValues = Object.values(hass.states[entityId]!.attributes);
      allowed = attValues.some(value => typeof value === 'number');
    }

    if (allowed) {
      options.push({
        value: entityId,
        label: entity.name,
        secondLabel: entityId,
        icon: html`
          <ha-state-icon
            .hass=${hass}
            .stateObj=${hass.states[entityId]}
          ></ha-state-icon>
        `,
      });
    }
  }

  return options;
}