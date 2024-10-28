import { type Watcher, WatcherRoot } from './watchers';

declare global {
  interface Window {
    brandResolver?: Watcher;
  }
}

(async () => {
  if (window.brandResolver) return;

  window.brandResolver = new WatcherRoot({
    ['lovelace_cards']: '/lovelace_cards_files/lovelace-cards.svg',
    ['yandex_player']: '/lovelace_cards_files/yandex-music.svg',
  });
})();