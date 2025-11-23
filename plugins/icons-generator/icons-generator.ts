import type { Plugin } from 'vite'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const END_CONTENT = `window.customIcons = window.customIcons || {};
window.customIconsets = window.customIconsets || {};

window.customIcons['lc'] = {
  getIcon: async (iconName) => ({ path: ICONS[iconName]?.path }),
  getIconList: async () => ICONS_MAP,
};
`

export interface IconsGeneratorConfig {
  /**
   * Path with source icons
   */
  input: string
  /**
   * Typescript output file
   */
  output: string
}

export function iconsGenerator(config: IconsGeneratorConfig): Plugin {
  const input = config.input
  
  return {
    name: 'vite:icons-generator',
    enforce: 'pre',
    async buildStart() {
      const files = await readdir(config.input, {
        recursive: false,
        encoding: 'utf8',
        withFileTypes: true,
      });
      
      let content = 'export const ICONS: Record<string, any> = {\n'
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file || !/\.svg$/.test(file.name)) continue;
        
        const name = file.name.replace('.svg', '')
        const svgContent = await readFile(join(file.parentPath, file.name), 'utf8');
        const desc = /<desc>([\w,]+)<\/desc>/.exec(svgContent)?.[1]
        const tags = desc?.split(',').map(tag => `'${tag}'`);
        
        const path = /<path\s?d="([a-z0-9., -]+)"\s?\/>/i.exec(svgContent)?.[1]
        if (!path) {
           throw new Error(`Invalid SVG ${file.name}`)
        }
        
        content += `  ${name.includes('-') ? `'${name}'` : name}: {\n`;
        content += `    path: '${path}',\n`
        if (tags) {
          content += `    keywords: [${tags.join(', ')}],\n`
        }
        content += `  },\n`
      }
      
      content += `};\n\n`
      
      content += 'export const ICONS_MAP = Object.entries(ICONS).map(([icon, content]) => ({ name: icon, keywords: content.keywords }));\n\n'
      
      content += END_CONTENT
      
      await writeFile(config.output, content, 'utf8')
    }
  }
}