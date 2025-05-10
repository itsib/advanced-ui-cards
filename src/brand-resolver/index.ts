import { waitSelector, DomWatcher } from './utils';

declare global {
  interface Window {
    brandResolver?: DomWatcher;
  }
}

(async () => {
  if (window.brandResolver) return;

  const elements = document.body.getElementsByTagName('home-assistant') as HTMLCollection;
  const homeAssistant = elements.item(0) as HTMLElement;
  if (!homeAssistant) {
    throw new Error('No <home-assistant> element');
  }

  const root = await waitSelector(homeAssistant, ':shadow');

  window.brandResolver = new DomWatcher({
    root: root!,
    debug: true,
    images: {
      ['lovelace_cards']: '/lovelace_cards_files/lovelace-cards.svg',
      ['yandex_player']: '/lovelace_cards_files/yandex-music.svg',
      ['homeconnect_ws']: '/lovelace_cards_files/yandex-music.svg',
    },
  });
})();