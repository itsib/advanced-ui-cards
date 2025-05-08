import { array, boolean, object, optional, string, union } from 'superstruct';

export interface IExemptionUserSchema {
  user: string;
}

export interface IConfirmDialogSchema {
  text?: string;
  exemptions?: IExemptionUserSchema[];
}

export type IConfirmationConfigSchema = boolean | IConfirmDialogSchema;

const ExemptionSchema = object({
  user: string(),
});

const ConfirmDialogSchema = object({
  text: optional(string()),
  exemptions: optional(array(ExemptionSchema)),
});

export const ConfirmationConfigSchema = union([
  boolean(),
  ConfirmDialogSchema,
]);