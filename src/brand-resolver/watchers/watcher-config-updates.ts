import { WatcherBase } from './watcher-base';

export class WatcherConfigUpdates extends WatcherBase {

  async onAddElement(_element: HTMLElement) {
    console.log('WatcherConfigUpdates %o', _element);
  }

  async onRemoveElement(_element: HTMLElement) {
    console.log('WatcherConfigUpdates %o', _element);
  }

}