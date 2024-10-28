import { WatcherMain, WatcherDialog, Watcher } from './';

export class WatcherRoot extends Watcher {

  private _watcher: { main?: WatcherMain; dialog?: WatcherDialog };

  constructor(images: { [domain: string]: string }) {
    const elements = document.body.getElementsByTagName('home-assistant') as HTMLCollection;
    const homeAssistant = elements.item(0) as HTMLElement;
    if (!homeAssistant) {
      throw new Error('No <home-assistant> element')
    }
    super(homeAssistant, images);

    this._watcher = {};
  }

  onAddElement(element: HTMLElement) {
    switch (element.nodeName) {
      case 'HOME-ASSISTANT-MAIN':
        if (this._watcher.main) this._watcher.main?.destroy();
        this._watcher.main = new WatcherMain(element, this._images);
        break;
      case 'DIALOG-ADD-INTEGRATION':
        if (this._watcher.dialog) this._watcher.dialog?.destroy();
        this._watcher.dialog = new WatcherDialog(element, this._images);
        break;
    }
  }

  onRemoveElement(element: HTMLElement) {
    switch (element.nodeName) {
      case 'DIALOG-ADD-INTEGRATION':
        this._watcher.dialog?.destroy();
        Reflect.deleteProperty(this._watcher, 'dialog');
        break;
      case 'HOME-ASSISTANT-MAIN':
        this._watcher.main?.destroy();
        Reflect.deleteProperty(this._watcher, 'main');
        break;
    }
  }
}