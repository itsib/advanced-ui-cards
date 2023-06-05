"""Config flow to configure the Yandex Media PLayer."""
from __future__ import annotations

from homeassistant import config_entries
from homeassistant.config_entries import ConfigFlow

from .const import NAME, DOMAIN


@config_entries.HANDLERS.register(DOMAIN)
class YandexMediaPlayerConfigFlow(ConfigFlow):
    async def async_step_user(self, user_input=None):
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(title=NAME, data={})

    async_step_import = async_step_user


