/// <reference types="vite/client" />

declare module '*.scss' {
  import { CSSResultGroup } from './types/lit';
  const styles: CSSResultGroup;

  export default CSSResultGroup;
}