import { LitElement, PropertyValues } from 'lit';
import styles from './gauge.scss';
import { customElement, property } from 'lit/decorators.js';

function round(value: number, decimals = 2): number {
  const mul = 10 ** decimals;
  return Math.round(value * mul) / mul;
}

function normalize(value: number, min: number, max: number): [number, number, number] {
  min = isNaN(min) ? 0 : min;
  max = isNaN(max) || max < min ? 100 : max;
  value = value == null || isNaN(value) ? 0 : value;
  value = value > max ? max : value < min ? min : value;

  return [value, min, max];
}

function getPercent(value: number, min: number, max: number): number {
  [value, min, max] = normalize(value, min, max);

  return round((value - min) / (max - min) * 100);
}

function getAngle(value: number, min: number, max: number): number {
  const percent = getPercent(value, min, max);

  return (percent * 180) / 100;
}

@customElement('lc-gauge')
export class Gauge extends LitElement {
  static styles = styles;
  /**
   * Gauge label (bottom)
   */
  @property({ type: String })
  label = '';
  /**
   * Unit of measurement
   */
  @property({ type: String })
  unit = '';
  /**
   * Minimum value bound
   */
  @property({ type: Number, reflect: true })
  min = 0;
  /**
   * Maximum value bound
   */
  @property({ type: Number, reflect: true })
  max = 100;
  /**
   * Displayed value
   */
  @property({ type: Number })
  value = 0;
  /**
   * Disable gauge
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Colorized levels
   */
  @property({ attribute: false })
  set levels(levels: { level: number; color: string }[] | undefined) {
    if (!levels) {
      this._levels = undefined;

    } else {
      this._levels = levels
        .map(({ level, color }) => ({ level, color }))
        .sort((a, b) => a.level - b.level);
    }
  }

  get levels(): ({ level: number; color: string }[] | undefined) {
    if (!this._levels || this._levels.length === 0) {
      return undefined;
    }

    if (this._levels[0].level !== this.min) {
      this._levels = [{ level: this.min, color: 'var(--info-color)' }, ...this._levels];
    }

    return this._levels;
  }

  private _levels?: { level: number; color: string }[];

  private _canvas?: HTMLCanvasElement;

  private _svg?: SVGSVGElement;

  private _scale?: SVGGElement;

  private _needle?: SVGGElement;

  private _text?: SVGTextElement;

  private _shadow?: SVGFEDropShadowElement;

  private _rafID?: ReturnType<typeof requestAnimationFrame> | null;

  connectedCallback() {
    super.connectedCallback();

    const insetShadowFilterId = 'filter-' + Math.random().toString().split('.')[1];
    const dropShadowFilterId = 'filter-' + Math.random().toString().split('.')[1];

    this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._svg.classList.add('gauge');
    this._svg.setAttribute('viewBox', '-50 -50 100 60');
    this._svg.setAttribute('width', '250');
    this._svg.setAttribute('height', '125');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.append(this._renderInsetShadow(insetShadowFilterId));
    defs.append(this._renderDropShadow(dropShadowFilterId));
    this._svg.append(defs);

    this._scale = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this._scale.setAttribute('stroke-linejoin', 'round');
    this._scale.setAttribute('stroke-width', '0');
    this._scale.setAttribute('stroke', 'rgb(0, 0, 0)');
    this._scale.setAttribute('filter', `url(#${insetShadowFilterId})`);
    this._svg.append(this._scale);

    this._needle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this._needle.classList.add('needle');
    this._needle.setAttribute('style', `transform: rotate(var(--gauge-needle-position))`);
    this._needle.setAttribute('filter', `url(#${dropShadowFilterId})`);
    this._svg.append(this._needle);

    this._text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this._text.setAttribute('text-anchor', 'middle');
    this._text.setAttribute('x', '0');
    this._text.setAttribute('y', '-2');
    this._text.setAttribute('font-weight', '400');
    this._text.setAttribute('font-family', 'Roboto, Noto, sans-serif');
    this._text.setAttribute('font-size', '14px');
    this._text.setAttribute('fill', 'var(--text-primary-color)');
    this._svg.append(this._text);

    this.shadowRoot?.append(this._svg);

    this._renderScale();
    this._renderNeedle();
    this._renderTextValue();

    this.applyValue();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._svg?.remove();
    this._svg = undefined;
    this._scale = undefined;
  }

  updated(_changed: PropertyValues) {
    super.updated(_changed);

    if (_changed.has('levels') || _changed.has('min') || _changed.has('max')) {
      this._renderScale();
    }

    if (_changed.has('value') || _changed.has('min') || _changed.has('max')) {
      this.applyValue();
      this._renderTextValue();
    }
  }

  applyValue() {
    if (this._rafID != null) {
      cancelAnimationFrame(this._rafID);
      this._rafID = null;
    }

    const [value, min, max] = normalize(this.value, this.min, this.max);
    const angle = getAngle(value, min, max);
    const angleRad = ((angle - 90) * Math.PI) / 180;

    this.style.setProperty('--gauge-needle-position', `${angle}deg`);
    this._shadow!.setAttribute('dx', `${round(Math.cos(angleRad), 4)}`);
    this._shadow!.setAttribute('dy', `${round(Math.sin(angleRad), 4)}`);

    this._text!.innerHTML = `${value}${this.unit}`;

    const oldAngle = parseFloat(this.style.getPropertyValue('--gauge-needle-position').replace('deg', ''));
    const newAngle = getAngle(value, min, max);

    const diffAngle = newAngle - oldAngle;
    const duration = Math.abs(diffAngle) * 100;
    let start: number | null = null;
    const animate = (time: number) => {
      if (!start) {
        start = time;
        this._rafID = requestAnimationFrame(animate);
        return;
      }

      const progress = (time - start) / duration;
    }
  }

  private _render(): void {

  }

  private _renderNeedle(): void {
    if (!this._needle) return;

    for (let i = 0; i < this._needle.childNodes.length; i++) {
      this._needle.childNodes.item(i).remove();
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M -25 -2 L -47.5 0 L -25 2 z');
    path.setAttribute('fill', 'rgb(200, 200, 200)');
    this._needle.append(path);
  }

  private _renderScale(): void {
    if (!this._scale) return;

    for (let i = 0; i < this._scale.childNodes.length; i++) {
      this._scale.childNodes.item(i).remove();
    }

    if (this.levels) {
      for (let i = 0; i < this.levels.length; i++) {
        const { level, color } = this.levels[i];
        const beginAngle = getAngle(level, this.min, this.max);
        const beginAngleCos = Math.cos((beginAngle * Math.PI) / 180);
        const beginAngleSin = Math.sin((beginAngle * Math.PI) / 180);

        const endAngle = this.levels[i + 1] ? getAngle(this.levels[i + 1].level, this.min, this.max) : 180;
        const endAngleCos = Math.cos((endAngle * Math.PI) / 180);
        const endAngleSin = Math.sin((endAngle * Math.PI) / 180);

        let d = 'M ';
        d += round(0 - 47.5 * beginAngleCos);
        d += ' ';
        d += round(0 - 47.5 * beginAngleSin);
        d += ' A 47.5 47.5 0 0 1 ';
        d += round(0 - 47.5 * endAngleCos);
        d += ' ';
        d += round(0 - 47.5 * endAngleSin);
        d += ' L ';
        d += round(0 - 32.5 * endAngleCos);
        d += ' ';
        d += round(0 - 32.5 * endAngleSin);
        d += ' A 32.5 32.5 0 0 0 ';
        d += round(0 - 32.5 * beginAngleCos);
        d += ' ';
        d += round(0 - 32.5 * beginAngleSin);
        d += ' z';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', color);
        this._scale!.append(path);
      }
    } else {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M -47.5 0 A 47.5 47.5 0 0 1 47.5 0 L 32.5 0 A 32.5 32.5 0 1 0 -32.5 0 z');
      path.setAttribute('fill', 'var(--info-color)');
      this._scale.append(path);
    }
  }

  private _renderTextValue(): void {

  }

  private _renderInsetShadow(filterId: string): SVGFilterElement {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.id = filterId;

    // Shadow offset
    const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    feOffset.setAttribute('in', 'SourceGraphic');
    feOffset.setAttribute('dx', '0');
    feOffset.setAttribute('dy', '0');
    filter.append(feOffset);

    // Shadow blur
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '1');
    feGaussianBlur.setAttribute('result', 'offset-blur');
    filter.append(feGaussianBlur);

    // Invert drop shadow to make an inset shadow
    const feCompositeOut = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feCompositeOut.setAttribute('operator', 'out');
    feCompositeOut.setAttribute('in', 'SourceGraphic');
    feCompositeOut.setAttribute('in2', 'offset-blur');
    feCompositeOut.setAttribute('result', 'inverse');
    filter.append(feCompositeOut);

    // Cut color inside shadow
    const feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
    feFlood.setAttribute('flood-color', 'rgb(0, 0, 0)');
    feFlood.setAttribute('flood-opacity', '.95');
    filter.append(feFlood);

    const feCompositeIn = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feCompositeIn.setAttribute('operator', 'in');
    feCompositeIn.setAttribute('in', 'color');
    feCompositeIn.setAttribute('in2', 'inverse');
    feCompositeIn.setAttribute('result', 'shadow');
    filter.append(feCompositeIn);

    // Placing shadow over element
    const feCompositeOver = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feCompositeOver.setAttribute('operator', 'over');
    feCompositeOver.setAttribute('in', 'shadow');
    feCompositeOver.setAttribute('in2', 'SourceGraphic');
    filter.append(feCompositeOver);

    return filter;
  }

  private _renderDropShadow(filterId: string): SVGFilterElement {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.id = filterId;

    this._shadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    this._shadow.classList.add('needle-shadow');
    this._shadow.setAttribute('dx', '0');
    this._shadow.setAttribute('dy', '0');
    this._shadow.setAttribute('stdDeviation', '0');
    this._shadow.setAttribute('flood-color', 'rgb(0, 0, 0)');
    this._shadow.setAttribute('flood-opacity', '0.3');
    filter.append(this._shadow);

    return filter;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-gauge': Gauge;
  }
}