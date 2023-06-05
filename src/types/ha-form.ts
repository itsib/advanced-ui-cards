export type HaFormSchema =
  | HaFormGridSchema
  | HaFormBooleanSchema
  | HaFormSelectSchema
  | HaFormSelectorSelect
  | HaFormConstantSchema
  | HaFormSelectorSwitch
  | HaFormStringSchema
  | HaFormSelectorDevice
  | HaFormSelectorArea
  | HaFormSelectorEntity;

export interface HaFormBaseSchema<T> {
  name: string;
  // This value is applied if no data is submitted for this field
  default?: T;
  required?: boolean;
  disabled?: boolean;
  description?: {
    suffix?: string;
    // This value will be set initially when form is loaded
    suggested_value?: T;
  };
  context?: Record<string, string>;
}

export interface HaFormGridSchema extends Omit<HaFormBaseSchema<HaFormBaseSchema<any>>, 'name'> {
  type: 'grid';
  name?: string;
  column_min_width?: string;
  schema: readonly HaFormSchema[];
}

export interface HaFormSelectSchema extends HaFormBaseSchema<string> {
  type: 'select';
  options: ReadonlyArray<readonly [string, string]>;
}

export interface HaFormBooleanSchema extends HaFormBaseSchema<boolean> {
  type: 'boolean';
}

export interface HaFormSelectorSelect extends HaFormBaseSchema<string> {
  type?: never;
  selector: {
    select: {
      multiple?: boolean;
      custom_value?: boolean;
      mode?: 'list' | 'dropdown';
      options: {
        value: string;
        label: string;
        disabled?: boolean;
      }[];
      translation_key?: string;
    };
  };
}

export interface HaFormSelectorSwitch extends HaFormBaseSchema<boolean> {
  type?: never;
  selector: {
    boolean: {} | null;
  };
}

export interface HaFormSelectorDevice extends HaFormBaseSchema<string | string[]> {
  type?: never;
  selector: {
    device: {
      filter?: HaDeviceFilter | readonly HaDeviceFilter[];
      entity?: HaEntityFilter | readonly HaEntityFilter[];
      multiple?: boolean;
    };
  };
}

export interface HaFormSelectorArea extends HaFormBaseSchema<string | string[]> {
  type?: never;
  selector: {
    area: {
      entity?: HaEntityFilter | readonly HaEntityFilter[];
      device?: HaDeviceFilter | readonly HaDeviceFilter[];
      multiple?: boolean;
    };
  };
}

export interface HaFormSelectorEntity extends HaFormBaseSchema<string | string[]> {
  type?: never;
  selector: {
    entity: {
      multiple?: boolean;
      include_entities?: string[];
      exclude_entities?: string[];
      filter?: HaEntityFilter | readonly HaEntityFilter[];
    };
  };
}

export interface HaFormConstantSchema extends HaFormBaseSchema<string> {
  type: 'constant';
  value?: string;
}

export interface HaFormStringSchema extends HaFormBaseSchema<string> {
  type: 'string';
  format?: string;
  autocomplete?: string;
}

interface HaDeviceFilter {
  integration?: string;
  manufacturer?: string;
  model?: string;
}

interface HaEntityFilter {
  integration?: string;
  domain?: string | readonly string[];
  device_class?: string | readonly string[];
  supported_features?: number | [number];
}
