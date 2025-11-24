import type { Plugin } from 'vite';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const END_CONTENT = `export const ICONS_MAP = Object.entries(ICONS).map(([icon, content]) => ({ name: icon, keywords: content.keywords }));

window.customIcons = window.customIcons || {};
window.customIconsets = window.customIconsets || {};

window.customIcons['lc'] = {
  getIcon: async (iconName) => ({ path: ICONS[iconName]?.path }),
  getIconList: async () => ICONS_MAP,
};
`;

export interface Icon {
  path: string;
  keywords?: string[];
}

export interface IconsGeneratorConfig {
  /**
   * Path with source icons
   */
  input: string;
  /**
   * Typescript output file
   */
  output: string;
}

export function iconsGenerator(config: IconsGeneratorConfig): Plugin {
  const input = config.input;
  
  return {
    name: 'vite:icons-generator',
    enforce: 'pre',
    async buildStart() {
      const files = await readdir(config.input, {
        recursive: false,
        encoding: 'utf8',
        withFileTypes: true,
      });
      
      let content = 'export const ICONS: Record<string, any> = {\n';
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file || !/\.svg$/.test(file.name)) continue;
        
        const name = file.name.replace('.svg', '');
        const svgContent = await readFile(join(file.parentPath, file.name), 'utf8');
        
        try {
          const { path, keywords } = parseSvg(svgContent);
          
          content += `  ${name.includes('-') ? `'${name}'` : name}: {\n`;
          content += `    path: '${path}',\n`;
          if (keywords) {
            content += `    keywords: [${keywords.map(i => `'${i}'`).join(', ')}],\n`;
          }
          content += `  },\n`;
        } catch (e: any) {
          console.error(e);
        }
      }
      
      content += `};\n\n`;
      
      content += END_CONTENT;
      
      await writeFile(config.output, content, 'utf8');
    },
  };
}

export function parseSvg(svg: string): Icon {
  const desc = /<desc>([\w,]+)<\/desc>/g.exec(svg)?.[1];
  const keywords = desc?.split(',');
  
  const regExp = /<[a-z]{1,6}(:?>|\s.*(:?\/>|>))/ig
  let match: RegExpExecArray | null;
  
  while ((match = regExp.exec(svg)) !== null) {
    const tagContent = match[0]
    const [tag] = tagContent.split(' ', 1)
    
    if (tag !== '<path') continue;
    
    const path = tagContent.split('d="', 2)?.[1]?.split('"', 1)?.[0];
    if (path) {
      return { keywords, path };
    }
  }
   throw new Error(`No path found SVG`);
}