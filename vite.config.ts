import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import copy from 'vite-plugin-cp';
import scssInline from '../../plugins/scss-inline';

const PROJECT_ROOT = resolve(__dirname);

export default defineConfig({
  appType: 'custom',
  resolve: {
    alias: {
      lit: resolve(PROJECT_ROOT, 'src/types/lit.ts'),
      i18n: resolve(PROJECT_ROOT, 'src/i18n/i18n.ts'),
      types: resolve(PROJECT_ROOT, 'src/types/index.ts'),
    },
  },
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      formats: ['es'],
      entry: {
        ['lovelace-cards']: resolve(PROJECT_ROOT, 'src/index.ts'),
        ['brand-resolver']: resolve(PROJECT_ROOT, 'src/brand-resolver/index.ts'),
      },
    },
    outDir: resolve(PROJECT_ROOT, 'custom_components/lovelace_cards/lovelace'),
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
  },
  plugins: [
    scssInline(),
    copy({
      targets: [
        {
          src: resolve(PROJECT_ROOT, 'src/images'),
          dest: resolve(PROJECT_ROOT, 'custom_components/lovelace_cards/lovelace'),
        },
      ],
    }),
  ],
});