import type { TemplateResult } from 'lit';
import {
  LovelaceBadgeConfig,
  LovelaceCardConfig,
  LovelaceElementConfig,
  LovelaceHeaderFooterConfig,
  LovelaceRowConfig,
} from './ha-ui';

interface BaseDialogBoxParams {
  confirmText?: string;
  text?: string | TemplateResult;
  title?: string;
  warning?: boolean;
}

export interface AlertDialogParams extends BaseDialogBoxParams {
  confirm?: () => void;
}

export interface ConfirmationDialogParams extends BaseDialogBoxParams {
  dismissText?: string;
  confirm?: () => void;
  cancel?: () => void;
  destructive?: boolean;
}

export interface PromptDialogParams extends BaseDialogBoxParams {
  inputLabel?: string;
  dismissText?: string;
  inputType?: string;
  defaultValue?: string;
  placeholder?: string;
  confirm?: (out?: string) => void;
  cancel?: () => void;
  inputMin?: number | string;
  inputMax?: number | string;
}

export interface EnterCodeDialogParams {
  codeFormat: "text" | "number";
  codePattern?: string;
  submitText?: string;
  cancelText?: string;
  title?: string;
  submit?: (code?: string) => void;
  cancel?: () => void;
}

export interface DialogBoxParams extends ConfirmationDialogParams, PromptDialogParams {
  confirm?: (out?: string) => void;
  confirmation?: boolean;
  prompt?: boolean;
}

export interface CustomCardHelpers {
  importMoreInfoControl: (type: string) => void;
  createBadgeElement: (config: LovelaceBadgeConfig) => any;
  createCardElement: (config: LovelaceCardConfig) => any;
  createHeaderFooterElement: (config: LovelaceHeaderFooterConfig) => any;
  createHuiElement: (config: LovelaceElementConfig) => any;
  createRowElement: (config: LovelaceRowConfig) => HTMLElement;
  showConfirmationDialog: (element: HTMLElement, dialogParams: ConfirmationDialogParams) => Promise<boolean>;
  showAlertDialog: (element: HTMLElement, dialogParams: AlertDialogParams) => Promise<unknown>;
  showEnterCodeDialog: (element: HTMLElement, dialogParams: EnterCodeDialogParams) => Promise<unknown>;
  showPromptDialog: (element: HTMLElement, dialogParams: PromptDialogParams) => Promise<unknown>;
}