import { HomeAssistant } from 'types';

export async function getHassioFeatures(): Promise<string[] | null> {
  const { conn } = await window.hassConnection;
  if (!('_srv' in conn)) {
    return null;
  }
  const subscribe = conn['_srv']?.['subscribe'] as any;
  if (typeof subscribe !== 'function') {
    return null;
  }
  await new Promise((resolve: any) => subscribe(resolve));

  const hass = document.body.querySelector('home-assistant')?.['__hass'] as HomeAssistant | undefined;
  if (!hass || !hass.services || !hass.services.hassio) {
    return null;
  }
  return Object.keys(hass.services.hassio);
}
