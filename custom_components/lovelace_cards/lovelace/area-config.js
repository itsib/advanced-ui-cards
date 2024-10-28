import { c as css, L as LitElement, h as html, t, f as fireEvent } from "./index.js";
const styles = css``;
const SCHEMA = [
  {
    name: "name",
    type: "string",
    required: false
  },
  {
    name: "area",
    required: true,
    selector: {
      area: {}
    }
  }
];
const _AreaConfig = class _AreaConfig extends LitElement {
  setConfig(config) {
    this.config = config;
  }
  shouldUpdate(changedProps) {
    if (!this.config || !this.hass) {
      return true;
    }
    return changedProps.has("config");
  }
  render() {
    if (!this.hass || !this.config) {
      return html``;
    }
    console.log(this.hass.areas);
    return html`
      <slot></slot>
      <div class="area-config">
        <ha-form
          .hass="${this.hass}"
          .data="${this.config}"
          .schema="${SCHEMA}"
          .computeLabel="${this._computeLabel}"
          .computeHelper="${this._computeHelper}"
          .localizeValue="${this._localizeValue}"
          @value-changed="${this._valueChanged}"
        >
        </ha-form>
      </div>
    `;
  }
  _computeLabel(schema) {
    return t(`config.${schema.name}.label`);
  }
  _computeHelper(schema) {
    return t(`area.config.${schema.name}.helper`);
  }
  _localizeValue(key) {
    return t(key);
  }
  _valueChanged(event) {
    fireEvent(this, "config-changed", { config: event.detail.value });
  }
};
_AreaConfig.styles = styles;
_AreaConfig.properties = {
  hass: {},
  config: { attribute: false }
};
let AreaConfig = _AreaConfig;
customElements.define("lc-area-config", AreaConfig);
export {
  AreaConfig
};
