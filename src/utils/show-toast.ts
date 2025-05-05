import { fireEvent } from './fire-event';

export interface ToastActionParams {
  action: () => void;
  text: string;
}

export interface ShowToastParams {
  /**
   * Unique ID for the toast.
   * If a new toast is shown with the same ID as the previous toast, it will be replaced to avoid flickering.
   */
  id?: string;
  message: string;
  action?: ToastActionParams;
  duration?: number;
  dismissable?: boolean;
}

export function showToast(el: HTMLElement, params: ShowToastParams) {
  fireEvent(el, "hass-notification", params);
}