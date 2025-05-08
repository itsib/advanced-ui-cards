import { LitElement, PropertyValues } from 'lit';
import styles from './gauge.scss';
import { customElement, property } from 'lit/decorators.js';
import { elasticOut } from '../../utils/timing-functions';

function round(value: number, decimals = 2): number {
  const mul = 10 ** decimals;
  return Math.round(value * mul) / mul;
}

function normalize(value: number, min: number, max: number, step = 0.1): [number, number, number] {
  min = isNaN(min) ? 0 : min;
  max = isNaN(max) ? 100 : max;

  if (min > max) {
    throw new Error('MIN_MAX');
  }

  value = value == null || isNaN(value) ? 0 : value;
  value = Math.max(value, min);
  value = Math.min(value, max);

  const decimals = `${step}`.split('.')[1]?.length || 0;

  const remains = value % step;
  const half = step / 2;
  const rounded = value - remains;
  const nextTick = rounded + step;

  if (half < remains && nextTick <= max) {
    value = parseFloat(nextTick.toFixed(decimals));
  } else {
    value = parseFloat(rounded.toFixed(decimals));
  }

  return [value, min, max];
}

function getAngle(value: number, min: number, max: number): number {
  const percent = (value - min) / (max - min) * 100;

  return (percent * 180) / 100;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
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
  @property({ type: Number, reflect: true })
  step = 0.1;
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
      this._levels = levels.map(item => {
        let { color = 'var(--primary-color)', level = 0 } = item || {};

        switch (color) {
          case 'primary':
            color = 'var(--primary-color)';
            break;
          case 'accent':
            color = 'var(--accent-color)';
            break;
          case 'error':
          case 'err':
            color = 'var(--error-color)';
            break;
          case 'warning':
          case 'warn':
            color = 'var(--warning-color)';
            break;
          case 'success':
            color = 'var(--success-color)';
            break;
          case 'info':
            color = 'var(--info-color)';
            break;
        }

        return { level, color };
      });

      this._levels.sort((a, b) => a.level - b.level);

      if (this._levels[0].level !== this.min) {
        this._levels = [{ level: this.min, color: 'var(--info-color)' }, ...this._levels];
      }
    }
  }

  get levels(): ({ level: number; color: string }[] | undefined) {
    if (!this._levels || this._levels.length === 0) {
      return undefined;
    }

    return this._levels;
  }

  private _levels?: { level: number; color: string }[];

  private _svg?: SVGSVGElement;

  private _scale?: SVGGElement;

  private _needle?: SVGGElement;
  /**
   * Text value
   * @private
   */
  private _text?: SVGTextElement;
  /**
   * Label <text /> element
   * @private
   */
  private _label?: SVGTextElement;
  /**
   * Needle shadow
   * @private
   */
  private _shadow?: SVGFEDropShadowElement;
  /**
   * Request animation frame to cancel
   * @private
   */
  private _rafID?: ReturnType<typeof requestAnimationFrame> | null;
  /**
   * Current angle in degree
   * @private
   */
  private _angleDeg = 0;

  connectedCallback() {
    super.connectedCallback();

    this._renderRootElements();
    this._renderDynamicElements();

    this._syncValue();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._rafID != null) {
      cancelAnimationFrame(this._rafID);
      this._rafID = null;
    }

    this._svg?.remove();
    this._svg = undefined;
    this._scale = undefined;
  }

  updated(_changed: PropertyValues) {
    super.updated(_changed);

    if (_changed.has('levels') || _changed.has('min') || _changed.has('max')) {
      this._renderDynamicElements();
    }

    if (_changed.has('value') || _changed.has('min') || _changed.has('max')) {
      this._syncValue();
    }

    if (_changed.has('disabled')) {
      this._svg?.classList?.[this.disabled ? 'add' : 'remove']?.('disabled');
    }
  }

  private _syncValue() {
    if (this._rafID != null) {
      cancelAnimationFrame(this._rafID);
      this._rafID = null;
    }

    const [value, min, max] = normalize(this.value, this.min, this.max, this.step);

    this._text!.innerHTML = `${value}${this.unit || ''}`;

    const oldAngle = this._angleDeg;
    const newAngle = getAngle(value, min, max);
    const diffAngle = newAngle - oldAngle;
    const duration = 500;
    const timingFunction = elasticOut.amplitude(0.5).period(0.4);
    let start: number | null = null;

    const setAngle = (angle: number) => {
      const angleRad = toRadians(angle - 90);

      this.style.setProperty('--gauge-needle-position', `${angle}deg`);
      this._shadow!.setAttribute('dx', round(Math.cos(angleRad), 4).toString());
      this._shadow!.setAttribute('dy', round(Math.sin(angleRad), 4).toString());
    };

    const animate = (time: number) => {
      if (!start) {
        start = time;
        this._rafID = requestAnimationFrame(animate);
        return;
      }

      if (start + duration > time) {
        const progress = timingFunction((time - start) / duration);
        this._angleDeg = Math.min(180, Math.max(0, oldAngle + diffAngle * progress));
        setAngle(this._angleDeg);

        this._rafID = requestAnimationFrame(animate);
      }
    };

    this._rafID = requestAnimationFrame(animate);
  }

  private _renderRootElements(): void {
    const insetShadowFilterId = 'filter-' + Math.random().toString().split('.')[1];
    const dropShadowFilterId = 'filter-' + Math.random().toString().split('.')[1];

    this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._svg.classList.add('lc-gauge');
    this._svg.setAttribute('viewBox', '-50 -50 100 60');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.append(this._renderInsetShadow(insetShadowFilterId));
    defs.append(this._renderDropShadow(dropShadowFilterId));
    this._svg.append(defs);

    this._scale = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this._scale.classList.add('scale');
    this._scale.setAttribute('filter', `url(#${insetShadowFilterId})`);
    this._svg.append(this._scale);

    this._needle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this._needle.classList.add('needle');
    this._needle.setAttribute('filter', `url(#${dropShadowFilterId})`);
    this._svg.append(this._needle);

    this._text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this._text.classList.add('value');
    this._text.setAttribute('text-anchor', 'middle');
    this._text.setAttribute('x', '0');
    this._text.setAttribute('y', '-2');
    this._svg.append(this._text);

    this._label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this._label.classList.add('label');
    this._label.setAttribute('text-anchor', 'middle');
    this._label.setAttribute('x', '0px');
    this._label.setAttribute('y', '9px');
    this._svg.append(this._label);

    this.shadowRoot?.append(this._svg);
  }

  private _renderDynamicElements(): void {
    if (!this._scale || !this._needle || !this._label) return;

    for (let i = 0; i < this._scale.childNodes.length; i++) {
      this._scale.childNodes.item(i).remove();
    }
    this._needle.childNodes.item(0)?.remove();

    // Render scale
    if (this.levels) {
      for (let i = 0; i < this.levels.length; i++) {
        const level = this.levels[i];
        const nextLevel = this.levels[i + 1];


        const beginAngle = toRadians(getAngle(...normalize(level.level, this.min, this.max)));
        const beginAngleCos = Math.cos(beginAngle);
        const beginAngleSin = Math.sin(beginAngle);

        const endAngle = toRadians(getAngle(...normalize(nextLevel?.level ?? this.max, this.min, this.max)));
        const endAngleCos = Math.cos(endAngle);
        const endAngleSin = Math.sin(endAngle);

        let d = '';
        d += `M ${round(0 - 47.5 * beginAngleCos)} ${round(0 - 47.5 * beginAngleSin)} `;
        d += `A 47.5 47.5 0 0 1 ${round(0 - 47.5 * endAngleCos)} ${round(0 - 47.5 * endAngleSin)} `;
        d += `L ${round(0 - 32.5 * endAngleCos)} ${round(0 - 32.5 * endAngleSin)} `;
        d += `A 32.5 32.5 0 0 0 ${round(0 - 32.5 * beginAngleCos)} ${round(0 - 32.5 * beginAngleSin)} `;
        d += 'z';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', level.color);
        this._scale!.append(path);
      }
    } else {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M -47.5 0 A 47.5 47.5 0 0 1 47.5 0 L 32.5 0 A 32.5 32.5 0 1 0 -32.5 0 z');
      path.setAttribute('fill', 'var(--info-color)');
      this._scale.append(path);
    }

    // Render needle
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M -25 -2 L -47.5 0 L -25 2 z');
    path.setAttribute('fill', 'rgb(200, 200, 200)');
    this._needle.append(path);

    this._label!.innerHTML = 'CPU in use';
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