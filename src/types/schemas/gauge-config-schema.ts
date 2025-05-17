export interface IGaugeLevelConfigSchema {
  level: number;
  color: string;
}

export interface IGaugeConfigSchema {
  entity: string;
  attribute?: string;
  name?: string;
  icon?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  digits?: boolean;
  levels?: IGaugeLevelConfigSchema;
}