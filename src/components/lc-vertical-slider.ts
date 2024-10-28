import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import styles from './lc-vertical-slider.scss';

declare global {
  interface HTMLElementTagNameMap {
    'lc-vertical-slider': LcVerticalSlider;
  }
}

export class LcVerticalSlider extends LitElement {

  value = 0;

  min = 0;

  max = 100;

  step = 1;

  disabled = false;

  debounce = 200;

  _track?: HTMLDivElement;

  _previous?: number;

  _debounced?: number;

  _debounceTimer?: ReturnType<typeof setTimeout>;

  _off?: () => void;

  static properties = {
    value: { attribute: true, type: Number },
    min: { attribute: true, type: Number },
    max: { attribute: true, type: Number },
    step: { attribute: true, type: Number },
    debounce: { attribute: true, type: Number },
    disabled: { attribute: 'disabled', reflect: true, type: Boolean },
  };

  static styles = styles;

  connectedCallback() {
    super.connectedCallback();

    if (!this._track) {
      this._track = document.createElement('div');
      this._track.classList.add('lc-vertical-slider');

      const thumb = document.createElement('div');
      thumb.classList.add('thumb');

      this._track.append(thumb);

      this.shadowRoot!.append(this._track);
    }

    const callback = this._handleMousedown.bind(this);

    this._track.addEventListener('mousedown', callback);

    this._off = () => {
      if (this._track) {
        this._track?.removeEventListener('mousedown', callback);
        this._off = undefined;
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._off?.();
  }

  shouldUpdate(changed: PropertyValues): boolean {
    if (changed.has('value')) {
      this._applyValue(this.value)
    }

    if (changed.has('min') || changed.has('max')) {
      if (this.min >= this.max) {
        console.warn(`wrong MIN MAX values`);
        this.min = this.max;
        this.max = this.step;
      }
    }

    if (changed.has('disabled')) {
      if (this.disabled) {
        this._track!.classList.add('disabled');
      } else {
        this._track!.classList.remove('disabled');
      }
    }

    if (changed.has('debounce') && this.debounce < 0) {
      throw new Error('Debounce should positive');
    }

    return false;
  }

  private _applyValue(value: number) {
    const percent = value / (this.max - this.min);

    const height = this._track!.offsetHeight;
    const thumb = this._track!.firstChild as HTMLDivElement;
    const padding = (this._track!.offsetWidth - thumb.offsetWidth) / 2;

    const max = height - (padding * 2) - thumb.offsetHeight;

    let offset = max - (max * percent);
    offset = offset < 0 ? 0 : offset;
    offset = offset > max ? max : offset;
    offset = Math.round(offset * 1000) / 1000;

    this._track!.style.setProperty('--slider-value', `${offset}px`);
  }

  private _handleMousedown(event: MouseEvent) {
    if (this.disabled) {
      return;
    }
    const thumb = this._track!.firstChild as HTMLDivElement
    const offset = event.target === this._track ? event.offsetY : thumb.offsetTop + event.offsetY;
    const startY = event.clientY;

    this._updateThumb(offset);

    const handleMousemove = (_event: MouseEvent) => {
      const move = offset + (_event.clientY - startY)

      this._updateThumb(move);
    };

    const handleMouseup = (_event: MouseEvent) => {
      window.document.removeEventListener('mouseup', handleMouseup);
      window.document.removeEventListener('mousemove', handleMousemove);

      setTimeout(() => {
        const move = offset + (_event.clientY - startY);

        this._updateThumb(move, false);
      }, 1)
    };

    window.document.addEventListener('mouseup', handleMouseup);
    window.document.addEventListener('mousemove', handleMousemove);
  }

  private _emitChange(value: number): void {
    const shadowRoot = this._track!.parentNode as ShadowRoot | null;
    if (!shadowRoot || !shadowRoot.host || this.disabled || value === this._previous) {
      return;
    }
    this._previous = value;

    const brought = (this.max - this.min) * value;
    const claimed = brought - (brought % this.step);

    const options = {
      detail: { value: claimed },
      bubbles: true,
      composed: true,
    };
    shadowRoot.host.dispatchEvent(new CustomEvent('change', options));
  }

  private _updateThumb(offset: number, shouldDebounced = true) {
    const height = this._track!.offsetHeight;

    const thumb = this._track!.firstChild as HTMLDivElement;
    const padding = (this._track!.offsetWidth - thumb.offsetWidth) / 2;

    const min = 0;
    const max = height - (padding * 2) - thumb.offsetHeight;
    let top = offset - padding - (thumb.offsetHeight / 2);
    top = top < min ? min : top;
    top = top > max ? max : top;
    top = Math.round(top * 1000) / 1000;

    this._track!.style.setProperty('--slider-value', `${top}px`);

    this._debouncedCall(1 - (top / max), shouldDebounced);
  }

  private _debouncedCall(value: number, shouldDebounced = true) {
    this._debounced = value;
    if (shouldDebounced) {
      if (this._debounceTimer == null) {
        this._debounceTimer = setTimeout(() => {
          delete this._debounceTimer;

          this._emitChange(this._debounced!);
        }, this.debounce);
      }
    } else {
      if (this._debounceTimer != null) {
        clearTimeout(this._debounceTimer);
        delete this._debounceTimer;
      }
      this._emitChange(this._debounced!);
    }
  }
}

(window as any).customElements.define('lc-vertical-slider', LcVerticalSlider);
