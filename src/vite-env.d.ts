/// <reference types="vite/client" />

declare module '*.scss' {
  import { CSSResultGroup } from './types/lit';
  const styles: CSSResultGroup;

  export default CSSResultGroup;
}

interface CardDefine {
  type: string;
  name: string;
  description?: string;
  preview?: boolean;
  configurable?: boolean;
}

interface FeatureDefine {
  type: string;
  name: string;
  supported?: (state: { entity_id: string }) => boolean;
  configurable?: boolean;
}

declare interface Window {
  customCards?: CardDefine[];
  customCardFeatures?: FeatureDefine[];
}