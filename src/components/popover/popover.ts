import { html, LitElement, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { getElementRect } from '../../utils/get-element-rect';
import styles from './popover.scss';

export type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverOptions {
  offset?: number;
  placement?: Placement;
  maxWidth?: number;
}

class Popover extends LitElement {
  static styles = styles;

  @property()
  content?: string;

  @property({ attribute: 'placement', reflect: true })
  placement: Placement;

  @property()
  arrow: number;

  @property()
  offset: number;

  @property({ attribute: 'max-width' })
  maxWidth: number;

  private _hiddenInProcess = false;

  private _reference?: HTMLElement;

  constructor() {
    super();

    this.placement = 'top';
    this.arrow = 8;
    this.offset = 2;
    this.maxWidth = 280;
  }

  hide() {
    if (this._hiddenInProcess) return;
    this._hiddenInProcess = true;

    const popup = this.shadowRoot!.firstElementChild as HTMLDivElement;
    popup.classList.add('out');
    setTimeout(() => {
      this._reference = undefined;
      this.remove()
    }, 200);
  }

  attach(element: HTMLElement, content: string, opts?: PopoverOptions) {
    this._reference = element;
    this.content = content;

    if (opts?.offset) {
      this.offset = opts.offset
    }
    if (opts?.placement) {
      this.placement = opts.placement
    }
    if (opts?.maxWidth) {
      this.maxWidth = opts.maxWidth
    }

    document.body.append(this);
  }

  connectedCallback() {
    super.connectedCallback();

    const elements = document.getElementsByTagName('lc-popover');
    for (const popover of elements) {
      if (popover !== this) {
        popover.hide();
      }
    }
  }

  protected updated() {
    this._computePosition();
  }

  protected render(): TemplateResult {
    return html`
      <div class="popover">
        <div class="text">${this.content}</div>
        <div class="arrow" />
      </div>
    `;
  }

  private _computePosition() {
    const sizeMin = (this.offset + this.arrow) * 2;

    let y: number;
    let x: number;
    let height: number = Math.ceil(this.offsetHeight) + 1;
    let width: number = Math.ceil(this.offsetWidth) + 1;
    let arrowPosition: number;
    let placement = this.placement;

    height = Math.max(height, sizeMin);
    width = Math.min(Math.max(width, sizeMin), this.maxWidth);

    const _rect = getElementRect(this._reference!);
    const rect = { ..._rect, x: _rect.x + window.scrollX, y: _rect.y + window.scrollY };
    const windowWidth = window.visualViewport?.width || window.innerWidth;
    const windowHeight = window.visualViewport?.height || window.innerHeight;
    const popover = this.shadowRoot!.firstElementChild as HTMLDivElement;
    const xMin = this.offset;
    const xMax = windowWidth - width - this.offset;
    const yMin = this.offset;
    const yMax = windowHeight - height - this.offset;

    switch (placement) {
      case 'top':
        y = Math.round(rect.y - height - this.arrow - this.offset);
        x = Math.round(rect.x + rect.width / 2 - width / 2);
        if (y < yMin) {
          y = Math.round(rect.y + rect.height + this.arrow + this.offset);
          placement = 'bottom';
        }
        x = Math.max(Math.min(x, xMax), xMin);
        break;
      case 'bottom':
        y = Math.round(rect.y + rect.height + this.arrow + this.offset);
        x = Math.round(rect.x + rect.width / 2 - width / 2);
        if (y > yMax) {
          y = Math.round(rect.y - height - this.arrow - this.offset);
          placement = 'top';
        }
        x = Math.max(Math.min(x, xMax), xMin);
        break;
      case 'left':
        y = Math.round(rect.y + rect.height / 2 - height / 2);
        x = Math.round(rect.x - width - this.arrow - this.offset);
        if (x < xMin) {
          x = Math.round(rect.x + rect.width + this.arrow + this.offset);
          placement = 'right';
        }
        y = Math.max(Math.min(y, yMax), yMin);
        break;
      case 'right':
        y = Math.round(rect.y + rect.height / 2 - height / 2);
        x = Math.round(rect.x + rect.width + this.arrow + this.offset);
        if (x > xMax) {
          x = Math.round(rect.x - width - this.arrow - this.offset);
          placement = 'left';
        }
        y = Math.max(Math.min(y, yMax), yMin);
        break;
    }

    if (placement === 'top' || placement === 'bottom') {
      arrowPosition = rect.x - x + rect.width / 2 - this.arrow;
    } else {
      arrowPosition = rect.y - y + rect.height / 2 - this.arrow;
    }

    for (const className of popover.classList.values()) {
      if (/^popover-(:?top|bottom|left|right)$/.test(className)) {
        popover.classList.remove(className);
      }
    }

    popover.classList.add(`popover-${placement}`);

    this.style.setProperty('--lc-popover-arrow-position', `${arrowPosition}px`);
    this.style.setProperty('--lc-popover-arrow-size', `${this.arrow}px`);
    this.style.setProperty('--lc-popover-offset', `${this.offset}px`);
    this.style.setProperty('--lc-popover-y', `${y}px`);
    this.style.setProperty('--lc-popover-x', `${x}px`);
    this.style.setProperty('--lc-popover-height', `${height}px`);
    this.style.setProperty('--lc-popover-width', `${width}px`);

    setTimeout(() => popover.classList.add('show', 'in'), 100);
  }
}

customElements.define('lc-popover', Popover, { extends: 'div' });

declare global {
  interface HTMLElementTagNameMap {
    'lc-popover': Popover;
  }
}