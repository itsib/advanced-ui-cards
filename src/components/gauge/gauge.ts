import { LitElement, PropertyValues } from 'lit';
import styles from './gauge.scss';
import { customElement, property, state } from 'lit/decorators.js';
import { elasticOut } from '../../utils/timing-functions';
import { formatColors } from '../../utils/format-colors';
import { getAngle, normalize, round, toRadians } from '../../utils/math';

interface LevelItem {
  level: number;
  color: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'lc-gauge': Gauge;
  }
}

@customElement('lc-gauge')
export class Gauge extends LitElement {
  static styles = styles;
  static sizes = {
    width: 110,
    labelHeight: 14,
    scaleRadius: 47.5,
    scaleWidth: 15,
  };

  /**
   * Bottom label
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
  min: number = 0;

  /**
   * Maximum value bound
   */
  @property({ type: Number, reflect: true })
  max: number = 100;

  /**
   * The step attribute is a number that specifies the
   * granularity that the value must adhere to.
   */
  @property({ attribute: 'display-precision', type: Number, reflect: true })
  precision: number = 2;

  /**
   * The value to display
   */
  @property({ type: Number })
  value: number = 0;

  /**
   * Disable gauge
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Display scale digits
   */
  @property({ attribute: 'digits', type: Boolean, reflect: true })
  digits = false;

  /**
   * Colorized levels
   */
  @property({
    attribute: false,
    hasChanged(newVal?: LevelItem[], oldVal?: LevelItem[]) {
      if (!newVal && !oldVal) return false;

      if ((!newVal && oldVal) || (newVal && !oldVal)) return true;

      if (Array.isArray(newVal) && Array.isArray(oldVal)) {
        if (newVal.length !== oldVal.length) return true;

        return newVal.some((item: LevelItem, index) => item.level !== oldVal[index].level || item.color !== oldVal[index].color);
      }
      return true;
    },
  })
  levels?: LevelItem[];

  private _normalizedLevels?: LevelItem[];

  /**
   * SVG root element
   * @private
   */
  private _svg?: SVGSVGElement;
  /**
   * Dial plate SVG element
   * @private
   */
  private _dial?: SVGGElement;
  /**
   * Digit levels of dial plate
   * @private
   */
  private _scale?: SVGGElement;
  /**
   * Dial plate pointer SVG element
   * @private
   */
  private _pointer?: SVGGElement;
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

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this._renderRootElements();
    this._renderScaleElements();
    this._renderLabelElement();

    this._updateValueWithAnimation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._rafID != null) {
      cancelAnimationFrame(this._rafID);
      this._rafID = null;
    }

    this._svg?.remove();
    this._svg = undefined;
    this._dial = undefined;
  }

  willUpdate(_changed: PropertyValues) {
    super.willUpdate(_changed);

    if (_changed.has('value') || _changed.has('min') || _changed.has('max') || _changed.has('precision')) {
      [this.value, this.min, this.max] = normalize(this.value, this.min, this.max, this.precision);
    }

    if (_changed.has('levels')) {
      if (!this.levels || !Array.isArray(this.levels) || this.levels.length === 0) {
        this._normalizedLevels = undefined;
      } else {
        this._normalizedLevels = this.levels
          .map(item => ({ level: item?.level ?? 0, color: item?.color || 'disabled' }))
          .sort((a, b) => a.level - b.level);

        if (this._normalizedLevels[0].level !== this.min) {
          this._normalizedLevels = [{ level: this.min, color: 'disabled' }, ...this._normalizedLevels];
        }
      }
    }
  }

  updated(_changed: PropertyValues) {
    super.updated(_changed);

    if (_changed.has('_levels') || _changed.has('isDigitScale') || _changed.has('min') || _changed.has('max')) {
      this._renderScaleElements();
    }

    if (_changed.has('value') || _changed.has('min') || _changed.has('max') || _changed.has('precision') || _changed.has('unit')) {
      this._updateValueWithAnimation();
    }

    if (_changed.has('disabled')) {
      this._svg?.classList?.[this.disabled ? 'add' : 'remove']?.('disabled');
    }

    if (_changed.has('label')) {
      this._renderLabelElement();
    }
  }

  private _updateValueWithAnimation() {
    if (this._rafID != null) {
      cancelAnimationFrame(this._rafID);
      this._rafID = null;
    }

    const unit = this.unit || '';
    const value = `${this.value}`;
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan.innerHTML = `&#8201;${unit}`;
    tspan.style.fontSize = '10px';

    this._text!.style.fontSize = `14px`;
    this._text!.style.letterSpacing = `-0.5px`;
    this._text!.innerHTML = value;
    this._text!.append(tspan);

    requestAnimationFrame(() => {
      const max = 42;
      const length = this._text!.getComputedTextLength();
      if (length > max) {
        this._text!.setAttribute('transform', `scale(${max / length})`);
      }
    });

    const oldAngle = this._angleDeg;
    const newAngle = getAngle(this.value, this.min, this.max);
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
    const insetShadowFilterId = 'inset-filter';
    const dropShadowFilterId = 'drop-shadow-filter';

    this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._svg.classList.add('lc-gauge');
    const width = Gauge.sizes.width;
    const height = Gauge.sizes.width / 2 + Gauge.sizes.labelHeight;
    const start = width / 2 * -1;
    this._svg.setAttribute('viewBox', `${start} ${start} ${width} ${height}`);

    // Scale filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.append(this._renderInsetShadow(insetShadowFilterId));
    defs.append(this._renderDropShadow(dropShadowFilterId));
    this._svg.append(defs);

    // Dial plate pointer container
    this._dial = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this._dial.classList.add('dial-plate');
    this._dial.setAttribute('filter', `url(#${insetShadowFilterId})`);
    this._svg.append(this._dial);

    this._scale = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this._scale.classList.add('scale');
    this._svg.append(this._scale);

    // Create pointer element
    this._pointer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this._pointer.classList.add('pointer');
    this._pointer.setAttribute('filter', `url(#${dropShadowFilterId})`);
    this._svg.append(this._pointer);

    const needlePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const tip = Gauge.sizes.scaleRadius;
    const base = Gauge.sizes.scaleRadius - Gauge.sizes.scaleWidth - Gauge.sizes.scaleWidth / 2;
    needlePath.setAttribute('d', `M -${base} -2 L -${tip} 0 L -${base} 2 z`);
    this._pointer.append(needlePath);

    // Text value
    this._text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this._text.classList.add('value');
    this._text.setAttribute('text-anchor', 'middle');
    this._text.setAttribute('x', '0');
    this._text.setAttribute('y', '-2');
    this._svg.append(this._text);

    // label
    this._label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this._label.classList.add('label');
    this._label.setAttribute('text-anchor', 'middle');
    this._label.setAttribute('x', '0px');
    this._label.setAttribute('y', '9px');
    this._svg.append(this._label);

    this.shadowRoot?.append(this._svg);
  }

  private _renderScaleElements(): void {
    if (!this._dial || !this._scale) return;

    for (let i = 0; i < this._dial.childNodes.length; i++) {
      this._dial.childNodes.item(i).remove();
    }

    for (let i = 0; i < this._scale.childNodes.length; i++) {
      this._scale.childNodes.item(i).remove();
    }

    const rExt = Gauge.sizes.scaleRadius;
    const rInt = Gauge.sizes.scaleRadius - Gauge.sizes.scaleWidth;

    const renderNumber = (value: number, angle: number, anchor: 'start' | 'end' | 'middle') => {
      if (!this.digits) return;

      const angleRad = toRadians(angle);
      const x = round(0 - (rExt + 2) * Math.cos(angleRad));
      const y = round(0 - (rExt + 2) * Math.sin(angleRad));

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x.toString());
      text.setAttribute('y', y.toString());
      text.setAttribute('text-anchor', anchor);
      text.setAttribute('transform', `rotate(${angle - 90},${x},${y})`);
      text.innerHTML = value.toString();

      this._scale!.append(text);
    };

    if (this._normalizedLevels) {
      for (let i = 0; i < this._normalizedLevels.length; i++) {
        const level = this._normalizedLevels[i].level;
        const nextLevel = this._normalizedLevels[i + 1]?.level ?? this.max;
        const color = formatColors(this._normalizedLevels[i].color);

        const beginAngleDeg = getAngle(...normalize(level, this.min, this.max));
        const beginAngle = toRadians(beginAngleDeg);
        const beginAngleCos = Math.cos(beginAngle);
        const beginAngleSin = Math.sin(beginAngle);

        const endAngle = toRadians(getAngle(...normalize(nextLevel, this.min, this.max)));
        const endAngleCos = Math.cos(endAngle);
        const endAngleSin = Math.sin(endAngle);

        let d = '';
        d += `M ${round(0 - rExt * beginAngleCos)} ${round(0 - rExt * beginAngleSin)} `;
        d += `A ${rExt} ${rExt} 0 0 1 ${round(0 - rExt * endAngleCos)} ${round(0 - rExt * endAngleSin)} `;
        d += `L ${round(0 - rInt * endAngleCos)} ${round(0 - rInt * endAngleSin)} `;
        d += `A ${rInt} ${rInt} 0 0 0 ${round(0 - rInt * beginAngleCos)} ${round(0 - rInt * beginAngleSin)} `;
        d += 'z';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', color);
        this._dial!.append(path);

        renderNumber(level, beginAngleDeg, i === 0 ? 'start' : 'middle');
      }
    } else {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M -${rExt} 0 A ${rExt} ${rExt} 0 0 1 ${rExt} 0 L ${rInt} 0 A ${rInt} ${rInt} 0 1 0 -${rInt} 0 z`);
      path.setAttribute('fill', 'var(--primary-color)');
      this._dial.append(path);

      renderNumber(this.min ?? 0, 0, 'start');
    }

    renderNumber(this.max ?? 100, 180, 'end');
  }

  private _renderLabelElement(): void {
    if (!this._label) return;

    this._label.innerHTML = this.label || '';
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
    feGaussianBlur.setAttribute('stdDeviation', '1.5');
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
    feFlood.setAttribute('flood-opacity', '.9');
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