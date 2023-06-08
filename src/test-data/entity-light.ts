import { HassEntity, HassEntityState } from 'types';

export const ENTITY_LIGHT: HassEntity = {
  area_id: 'gostinaia',
  entity_id: 'light.room_light',
  device_id: '8321c25913f9190c5f6f9bc87485263b',
  platform: 'mqtt',
};

export const ENTITY_LIGHT_STATE: HassEntityState = {
  entity_id: 'light.room_light',
  state: 'off',
  attributes: {
    min_color_temp_kelvin: 2702,
    max_color_temp_kelvin: 6535,
    min_mireds: 153,
    max_mireds: 370,
    supported_color_modes: ['color_temp'],
    color_mode: 'color_temp',
    brightness: 255,
    color_temp_kelvin: 6535,
    color_temp: 153,
    hs_color: [54.768, 1.6],
    rgb_color: [255, 254, 250],
    xy_color: [0.326, 0.333],
    friendly_name: 'Room Light',
    supported_features: 40,
  },
  context: {
    id: '01H2AZVF421ZN12KSMAWJQ3CY8',
    parent_id: null,
    user_id: '59a8c2221cae43adb33c28cf6b0c2622',
  },
  last_changed: '2023-06-07T12:17:17.074Z',
  last_updated: '2023-06-07T13:13:34.170Z',
};
