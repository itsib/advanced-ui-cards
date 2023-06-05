declare global {
  interface Window {
    brandReplacer?: Promise<any>;
  }
}

export function replace(domain: string, image: string): void {
  if (!window.brandReplacer) {
    window.brandReplacer = import('./brand-replacer');
  }
  window.brandReplacer.then(module => {
    module.BrandReplacer.insert(domain, image);
  });
}
