import type { IntegrationManifest, LocalizeFunc } from 'types';

export function domainToName(localize: LocalizeFunc, domain: string, manifest?: IntegrationManifest) {
  return localize(`component.${domain}.title`) || manifest?.name || domain;
}