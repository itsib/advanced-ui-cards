import { HomeAssistant } from 'types';
import { ISelectOption } from '../components';
import { getServiceIcon } from './get-service-icon';
import { html } from 'lit';
import { computeDomain } from './entities-utils';

export function serviceToSelectOption(hass: HomeAssistant): ISelectOption[] {
  const domains = Object.keys(hass.services);
  const options: ISelectOption[] = [];
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    const services = hass.services[domain];
    const servicesNames = Object.keys(services);

    for (let j = 0; j < servicesNames.length; j++) {
      const serviceName = servicesNames[j];
      const serviceId = `${domain}.${serviceName}`;
      options.push({
        value: serviceId,
        label: services[serviceName].name,
        secondLabel: serviceId,
        icon: getServiceIcon(serviceId),
      });
    }
  }

  return options;
}

export function entitiesToSelectOption(hass: HomeAssistant): ISelectOption[] {
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

export function gaugesToSelectOption(hass: HomeAssistant): ISelectOption[] {
  const options: ISelectOption[] = [];
  for (const [entityId, entity] of Object.entries(hass.entities)) {
    const domain = computeDomain(entityId);
    if (domain !== 'counter' && domain !== 'sensor' && domain !== 'input_number' && domain !== 'number') {
      continue;
    }
    const stateObj = hass.states[entityId];
    if (isNaN(Number(stateObj.state))) continue;


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
    })
  }

  return options;
}