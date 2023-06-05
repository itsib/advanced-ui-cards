import { c as css, L as LitElement, h as html, t } from './dashboard-cards-cc817bf3.js';

var styles = css``;

/**
 * Dispatches a custom event with an optional detail value.
 *
 * @param node
 * @param {string} type Name of event type.
 * @param {*=} detail Detail value containing event-specific
 *   payload.
 * @param options
 *           cancelable: (boolean|undefined),
 *           composed: (boolean|undefined) }=}
 *  options Object specifying options.  These may include:
 *  `bubbles` (boolean, defaults to `true`),
 *  `cancelable` (boolean, defaults to false), and
 *  `node` on which to fire the event (HTMLElement, defaults to `this`).
 * @return {Event} The new event that was fired.
 */
function fireEvent(node, type, detail, options) {
    options = options || {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed,
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
}

const SCHEMA = [
    {
        name: 'name',
        type: 'string',
        required: false,
    },
    {
        name: 'area',
        required: true,
        selector: {
            area: {},
        },
    },
];
class AreaConfig extends LitElement {
    setConfig(config) {
        this.config = config;
    }
    shouldUpdate(changedProps) {
        if (!this.config || !this.hass) {
            return true;
        }
        return changedProps.has('config');
    }
    render() {
        if (!this.hass || !this.config) {
            return html ``;
        }
        console.log(this.hass.areas);
        return html `
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
        fireEvent(this, 'config-changed', { config: event.detail.value });
    }
}
AreaConfig.styles = styles;
AreaConfig.properties = {
    hass: {},
    config: { attribute: false },
};
customElements.define('dc-area-config', AreaConfig);

export { AreaConfig };
