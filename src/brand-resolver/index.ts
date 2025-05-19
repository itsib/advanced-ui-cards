import { waitSelector } from './utils';
import { BrandResolver } from './brand-resolver';

declare global {
  interface Window {
    domWatcher?: Promise<BrandResolver>;
  }
}

if (!window.domWatcher) {
  window.domWatcher = new Promise(resolve => {
    const elements = document.body.getElementsByTagName('home-assistant') as HTMLCollection;
    const homeAssistant = elements.item(0) as HTMLElement;
    if (!homeAssistant) {
      throw new Error('No <home-assistant> element');
    }

    waitSelector<HTMLElement>(homeAssistant, ':shadow home-assistant-main', main => {
      const hass = (main as any).hass;
      if (!hass) {
        throw new Error('Home Assistant not found');
      }

      const watcher = new BrandResolver({
        hass,
        root: homeAssistant.shadowRoot!,
        images: {
          ['advanced_ui_cards']: '/lovelace_cards_files/logo.svg',
          ['yandex_player']: '/lovelace_cards_files/yandex-music.svg',
          ['sun']: '/lovelace_cards_files/sun-logo.svg',
        },
      });

      resolve(watcher);
    });
  });
}

