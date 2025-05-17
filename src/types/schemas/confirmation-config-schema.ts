export interface IExemptionUserSchema {
  user: string;
}

export interface IConfirmDialogSchema {
  text?: string;
  exemptions?: IExemptionUserSchema[];
}

export type IConfirmationConfigSchema = boolean | IConfirmDialogSchema;