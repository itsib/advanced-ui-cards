import { HassService } from 'types';

const CODE_COMPONENTS = {
  homeassistant: 'Home Assistant Core Integration',
}

export function formatActionName(domain: string, service: HassService, localize: (key: string) => string) {
  const serviceName = service.name;
  let componentName: string;
  if (domain in CODE_COMPONENTS) {
    componentName = CODE_COMPONENTS[domain];
  } else {
    componentName = localize(`component.${domain}.entity_component._.name`);
  }
  if (!componentName) {
    componentName = domain.split(/[-_]/g).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return `${componentName}: ${serviceName}`;
}