import { describe, expect, it } from 'vitest';
import { parseSvg } from './icons-generator';

describe('plugins/icons-generator/icons-generator.ts', () => {
  describe('#parseSvg', () => {
    it('Should parse simple svg', () => {
      
      const result = parseSvg(`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <desc>tag1,tag2,tag3</desc>
  <path d="M1 1 H 23 V 23 H 1 L 1 1" />
</svg>`);
      
      
      expect(result).toStrictEqual({
        keywords: ['tag1', 'tag2', 'tag3'],
        path: 'M1 1 H 23 V 23 H 1 L 1 1',
      });
    });
    
    it('Should parse svg path with open and closed tag', () => {
      
      const result = parseSvg(`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <desc>tag1,tag2,tag3</desc>
  <path d="M1 1 H 23 V 23 H 1 L 1 1"></path>
</svg>`);
      
      
      expect(result).toStrictEqual({
        keywords: ['tag1', 'tag2', 'tag3'],
        path: 'M1 1 H 23 V 23 H 1 L 1 1',
      });
    });
    
    it('Should parse svg path with attributes', () => {
      
      const result = parseSvg(`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <desc>tag1,tag2,tag3</desc>
  <path stroke-linecap="round" d="M1 1 H 23 V 23 H 1 L 1 1" color="#ff2399"></path>
</svg>`);
      
      
      expect(result).toStrictEqual({
        keywords: ['tag1', 'tag2', 'tag3'],
        path: 'M1 1 H 23 V 23 H 1 L 1 1',
      });
    });
  });
});