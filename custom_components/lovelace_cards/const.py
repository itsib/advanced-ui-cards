"""Constants of the Lovelace Cards UI """
from typing import Final

DOMAIN: Final = "lovelace_cards"
NAME: Final = "UI Lovelace"

BASE_URL = "/lovelace_cards_files"

CONF_REPLACER: Final = "replacer"
CONF_BRAND: Final = "brand"
CONF_IMAGE: Final = "image"

DEFAULT_REPLACER_CONFIG: Final[list[dict]] = [
    {CONF_BRAND: "lovelace_cards", CONF_IMAGE: "/brands/lovelace-cards.svg"},
]

DEFAULT_CONFIG: Final[dict] = {CONF_REPLACER: DEFAULT_REPLACER_CONFIG}
