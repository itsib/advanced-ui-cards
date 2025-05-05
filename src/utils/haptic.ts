import { fireEvent } from './fire-event';

export function forwardHaptic(hapticType: HapticType) {
  fireEvent(window, 'haptic', hapticType);
}