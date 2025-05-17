import { array, boolean, object, optional, string, union } from 'superstruct';

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