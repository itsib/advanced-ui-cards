/** Icon to use when no icon specified for service. */
export const DEFAULT_SERVICE_ICON = 'mdi:room-service';

/** Icon to use when no icon specified for domain. */
export const DEFAULT_DOMAIN_ICON = 'mdi:bookmark';

/** Fallback icons for each domain */
export const DOMAIN_ICONS = {
  air_quality: 'mdi:air-filter',
  alert: 'mdi:alert',
  automation: 'mdi:robot',
  calendar: 'mdi:calendar',
  climate: 'mdi:thermostat',
  configurator: 'mdi:cog',
  conversation: 'mdi:forum-outline',
  counter: 'mdi:counter',
  date: 'mdi:calendar',
  datetime: 'mdi:calendar-clock',
  demo: 'mdi:home-assistant',
  device_tracker: 'mdi:account',
  google_assistant: 'mdi:google-assistant',
  group: 'mdi:google-circles-communities',
  homeassistant: 'mdi:home-assistant',
  homekit: 'mdi:home-automation',
  image_processing: 'mdi:image-filter-frames',
  image: 'mdi:image',
  input_boolean: 'mdi:toggle-switch',
  input_button: 'mdi:button-pointer',
  input_datetime: 'mdi:calendar-clock',
  input_number: 'mdi:ray-vertex',
  input_select: 'mdi:format-list-bulleted',
  input_text: 'mdi:form-textbox',
  lawn_mower: 'mdi:robot-mower',
  light: 'mdi:lightbulb',
  notify: 'mdi:comment-alert',
  number: 'mdi:ray-vertex',
  persistent_notification: 'mdi:bell',
  person: 'mdi:account',
  plant: 'mdi:flower',
  proximity: 'mdi:apple-safari',
  remote: 'mdi:remote',
  scene: 'mdi:palette',
  schedule: 'mdi:calendar-clock',
  script: 'mdi:script-text',
  select: 'mdi:format-list-bulleted',
  sensor: 'mdi:eye',
  simple_alarm: 'mdi:bell',
  siren: 'mdi:bullhorn',
  stt: 'mdi:microphone-message',
  sun: 'mdi:white-balance-sunny',
  text: 'mdi:form-textbox',
  time: 'mdi:clock',
  timer: 'mdi:timer-outline',
  todo: 'mdi:clipboard-list',
  tts: 'mdi:speaker-message',
  vacuum: 'mdi:robot-vacuum',
  wake_word: 'mdi:chat-sleep',
  weather: 'mdi:weather-partly-cloudy',
  zone: 'mdi:map-marker-radius',
};

export function getServiceIcon(service: string): string {
  const [domain, serviceName] = service.split('.', 2);

  if (serviceName === 'pause') {
    return 'mdi:pause';
  }
  if (serviceName === 'reload') {
    return 'mdi:reload';
  }

  const iconName = DOMAIN_ICONS[domain];
  // if (iconName && /_off$/.test(serviceName)) {
  //   return iconName + '_off';
  // }
  return iconName || DEFAULT_SERVICE_ICON;
}