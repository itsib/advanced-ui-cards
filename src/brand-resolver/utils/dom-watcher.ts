import { ChangeCallbacks, ChangeDisconnect, onElementChange } from './on-element-change';
import { getElementName } from './get-element-name';
import { LogType } from '../types';

const FORMATS = {
  subscribe: 'color: #ffcc00; font-weight: 700;',
  create: 'color: #37c871; font-weight: 700;',
  remove: 'color: #c83737; font-weight: 700;',
  attribute: 'color: #37abc8; font-weight: 700;',
  default: 'color: #b3b3b3; font-weight: 400;',
};

/**
 * DOM Watcher - Tracks the appearance of HTML elements through the Shadow DOM.
 *
 *
 */
export abstract class DomWatcher {

  private readonly _debug: boolean;

  private readonly _watchers = new WeakMap<HTMLElement | ShadowRoot, ChangeDisconnect>();

  protected constructor(debug = false) {
    this._debug = debug;
  }

  protected log(type: LogType, ...objects: any[]): void {
    if (!this._debug) return;

    switch (type) {
      case 'create':
        console.log('%cNEW %c%s %O', FORMATS.create, FORMATS.default, objects[0], objects[1]);
        break;
      case 'remove':
        console.log('%cREM %c%s %O', FORMATS.remove, FORMATS.default, objects[0], objects[1]);
        break;
      case 'subscribe':
        console.log('%cSUB %c%s %O', FORMATS.subscribe, FORMATS.default, objects[0], objects[1]);
        break;
      case 'attribute':
        console.log('%cATR %c%s %O', FORMATS.attribute, FORMATS.default, objects[0], objects[1]);
        break;
    }
  }

  /**
   * Handler for the new DOM element.
   *
   * @description
   * All DOM elements are processed here, then distributed to the appropriate
   * handlers. To process a specific HTML element, you need to create an event
   * handler as in the example
   *
   * @examle
   * ```typescript
   * class MyWatcher extends DomWatcher {
   *
   *    // Handle new <img /> element in <observable-node-name />
   *    ['NEW:OBSERVABLE-NODE-NAME:IMG'](created: HTMLImgElement): void {
   *      console.log(created);
   *    }
   *
   *    // Handle all new <img /> element all observed HTML elements
   *    ['NEW:*:IMG'](created: HTMLImgElement): void {
   *      console.log(created);
   *    }
   *
   *    // Handle all new elements inside <observable-node-name />
   *    ['NEW:OBSERVABLE-NODE-NAME:*'](created: HTMLImgElement): void {
   *        console.log(created);
   *    }
   * }
   * ```
   *
   * @param observable - The observed HTML element.
   * @param created - New element in DOM
   * @private
   */
  private _onCreate(observable: HTMLElement | ShadowRoot, created: HTMLElement): void {
    const observableName = getElementName(observable);
    const createdName = getElementName(created);

    const eventNames: [string, string][] = [
      [observableName, createdName],
      [observableName, '*'],
      ['*', createdName],
    ];

    for (const [targetName, elementName] of eventNames) {
      const eventName = `NEW:${targetName}:${elementName}`;
      if (eventName in this) {
        this.log('create', eventName, created);
        this[eventName](created);
      }
    }
  }

  /**
   * Handler for the removed DOM element
   * @param observable
   * @param removed
   * @private
   */
  private _onRemove(observable: HTMLElement | ShadowRoot, removed: HTMLElement) {
    if (this._watchers.has(removed)) {
      this._watchers.get(removed)?.();
      this._watchers.delete(removed);
    }

    const observableName = getElementName(observable);
    const createdName = getElementName(removed);

    const eventNames: [string, string][] = [
      [observableName, createdName],
      [observableName, '*'],
      ['*', createdName],
    ];

    for (const [targetName, elementName] of eventNames) {
      const eventName = `REM:${targetName}:${elementName}`;
      if (eventName in this) {
        this.log('remove', eventName, removed);
        this[eventName](removed);
      }
    }
  }

  private _onAttribute(observable: HTMLElement | ShadowRoot, attributeName: string): void {
    const methodId = `ATR:${observable.nodeName}[${attributeName.toUpperCase()}]`;

    if (methodId in this) {
      this.log('attribute', methodId, observable);
      this[methodId](observable, attributeName);
    }
  }

  subscribe(observable: HTMLElement | ShadowRoot, watchAttrs = false) {
    this.log('subscribe', getElementName(observable), observable);

    const callbacks: ChangeCallbacks = {
      onAdd: this._onCreate.bind(this),
      onRemove: this._onRemove.bind(this),
      ...(watchAttrs ? { onAttribute: this._onAttribute.bind(this) } : {}),
    };

    const disconnect = onElementChange(observable, callbacks);

    this._watchers.set(observable, disconnect);
  }

  emitCreate(observable: HTMLElement | ShadowRoot, created: HTMLElement) {
    this._onCreate(observable, created);
  }
}