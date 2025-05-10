import { html, LitElement, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { compareRects } from '../../utils/comparators';
import styles from './popover.scss';

export type Placement = 'top' | 'bottom' | 'left' | 'right';

class Popover extends LitElement {
  static styles = styles;

  @property()
  text?: string;

  @property()
  placement: Placement;

  _rect?: Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>;

  @property({ hasChanged: compareRects })
  set rect(_rect: Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>) {
    this._rect = {
      x: _rect.x + window.scrollX,
      y: _rect.y + window.scrollY,
      width: _rect.width,
      height: _rect.height,
    };
  };

  get rect(): Pick<DOMRect, 'x' | 'y' | 'width' | 'height'> | undefined {
    return this._rect;
  }


  @property()
  arrow: number;

  @property()
  offset: number;

  @property({ attribute: 'max-width' })
  maxWidth: number;

  _hiddenInProcess = false;

  constructor() {
    super();

    this.placement = 'bottom';
    this._rect = { x: 0, y: 0, width: 40, height: 40 };
    this.arrow = 8;
    this.offset = 0;
    this.maxWidth = 280;
  }

  hide() {
    if (this._hiddenInProcess) return;
    this._hiddenInProcess = true;

    const popup = this.shadowRoot!.firstElementChild as HTMLDivElement;
    popup.classList.add('out');
    setTimeout(() => this.remove(), 200);
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
        <div class="text">${this.text}</div>
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

    const rect = this.rect!;
    const popover = this.shadowRoot!.firstElementChild as HTMLDivElement;
    const xMin = this.offset;
    const xMax = window.innerWidth - width - this.offset;
    const yMin = this.offset;
    const yMax = window.innerHeight - height - this.offset;

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