export interface PropertyValueMap<T> extends Map<PropertyKey, unknown> {
  get<K extends keyof T>(k: K): T[K];

  set<K extends keyof T>(key: K, value: T[K]): this;

  has<K extends keyof T>(k: K): boolean;

  delete<K extends keyof T>(k: K): boolean;
}

export type ChangedProperties = { [propertyName: string]: any };

export type PropertyValues<T = any> = T extends object ? PropertyValueMap<T> : Map<PropertyKey, unknown>;

export const HTML_RESULT = 1;
export const SVG_RESULT = 2;

export type ResultType = typeof HTML_RESULT | typeof SVG_RESULT;

export type TemplateResult<T extends ResultType = ResultType> = {
  ['_$litType$']: T;
  strings: TemplateStringsArray;
  values: unknown[];
};

export type LitHtml = (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult<1>;

export type CSSResultOrNative = CSSResult | CSSStyleSheet;
export type CSSResultArray = Array<CSSResultOrNative | CSSResultArray>;

export type CSSResultGroup = CSSResultOrNative | CSSResultArray;

export interface CSSResult {
  ['_$cssResult$']: boolean;
  readonly cssText: string;

  get styleSheet(): CSSStyleSheet | undefined;

  toString(): string;
}

export type LitCss = (strings: TemplateStringsArray, ...values: (CSSResultGroup | number)[]) => CSSResult;

export declare abstract class ReactiveElement extends HTMLElement {
  static styles?: CSSResultGroup;
}

export interface LitElement extends ReactiveElement {
  new (): LitElement;
  /**
   * True if there is a pending update as a result of calling `requestUpdate()`.
   * Should only be read.
   * @category updates
   */
  isUpdatePending: boolean;
  /**
   * Is set to `true` after the first update. The element code cannot assume
   * that `renderRoot` exists before the element `hasUpdated`.
   * @category updates
   */
  hasUpdated: boolean;

  updateComplete: Promise<boolean>;

  requestUpdate(): Promise<void>;

  requestUpdate(propertyName: string, oldValue: any): Promise<void>;

  willUpdate(changedProps: PropertyValues): void;

  shouldUpdate(changedProps: PropertyValues): boolean;

  update(changedProps: PropertyValues): void;

  firstUpdated(changedProps: PropertyValues): void;

  updated(changedProps: PropertyValues): void;

  connectedCallback(): void;

  disconnectedCallback(): void;

  render(): TemplateResult;
}

export const LitElement = Object.getPrototypeOf(customElements.get('home-assistant-main')) as LitElement;

export const { html, css } = LitElement.prototype as { html: LitHtml; css: LitCss };
