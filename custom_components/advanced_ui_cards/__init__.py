"""The UI Lovelace integration."""
from __future__ import annotations

import logging

from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, BASE_URL, NAME, DEFAULT_CONFIG

LOGGER = logging.getLogger(__name__)

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Setup integration."""

    hass.data[DOMAIN] = {}
    if DOMAIN not in config:
        return True

    # Replacer config
    data = DEFAULT_CONFIG if config[DOMAIN] is None else config[DOMAIN]
    hass.data[DOMAIN] = data
    LOGGER.info("async_setup: \n%s", data)

    # Async init entry
    hass.async_create_task(
        hass.config_entries.flow.async_init(
            DOMAIN,
            context={"source": SOURCE_IMPORT},
            data=data,
        )
    )
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from a config entry."""

    LOGGER.info("Register paths: %s", f"{BASE_URL}")
    LOGGER.info("Register paths: %s", f"{BASE_URL}/brand-resolver.js")
    LOGGER.info("Register paths: %s", f"{BASE_URL}/advanced-ui-cards.js")

    integration_dir = hass.config.path(f"custom_components/{DOMAIN}")
    await hass.http.async_register_static_paths([
        StaticPathConfig(f"{BASE_URL}", f"{integration_dir}/lovelace", cache_headers=False),
        StaticPathConfig(f"{BASE_URL}/brand-resolver.js", f"{integration_dir}/lovelace/brand-resolver.js", cache_headers=False),
        StaticPathConfig(f"{BASE_URL}/advanced-ui-cards.js", f"{integration_dir}/lovelace/advanced-ui-cards.js", cache_headers=False),
    ])

    add_extra_js_url(hass, f"{BASE_URL}/brand-resolver.js", es5=False)
    add_extra_js_url(hass, f"{BASE_URL}/advanced-ui-cards.js", es5=False)

    data: dict = {'name': NAME}
    if DOMAIN in hass.data:
        data.update(hass.data[DOMAIN])

    hass.data[DOMAIN] = data
    await hass.config_entries.async_forward_entry_setups(entry, [])

    LOGGER.info(f"Finish setup {DOMAIN}")
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    remove_extra_js_url(hass, f"{BASE_URL}/brand-resolver.js", es5=False)
    remove_extra_js_url(hass, f"{BASE_URL}/advanced-ui-cards.js", es5=False)

    unload_ok = await hass.config_entries.async_unload_platforms(entry, [])
    if unload_ok:
        hass.data.pop(DOMAIN)

    return unload_ok
