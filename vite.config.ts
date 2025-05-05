import { defineConfig } from 'vite';
import { resolve, relative, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import copy from 'vite-plugin-cp';
import { scssInline } from '../../plugins/scss-inline';
import { resolveExternalLit } from '../../plugins/resolve-external-lit';

const APP_ROOT = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  appType: 'custom',
  resolve: {
    alias: {
      i18n: resolve(APP_ROOT, 'src', 'i18n', 'i18n.ts'),
      types: resolve(APP_ROOT, 'src', 'types', 'index.ts'),
    },
  },
  esbuild: {
    legalComments: 'none',
  },
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      formats: ['es'],
      entry: {
        ['lovelace-cards']: join(APP_ROOT, 'src', 'index.ts'),
        ['brand-resolver']: join(APP_ROOT, 'src', 'brand-resolver', 'index.ts'),
      },
    },
    outDir: join(APP_ROOT, 'custom_components', 'lovelace_cards', 'lovelace'),
    rollupOptions: {
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        manualChunks(id: string) {
          const path = relative(APP_ROOT, id);
          if (path.startsWith('brand-resolver')) {
            return 'brand-resolver';
          } else {
            return 'lovelace-cards';
          }
        }
      },
      watch: {},
    },
  },
  plugins: [
    resolveExternalLit(),
    scssInline(),
    copy({
      targets: [
        {
          src: join(APP_ROOT, 'src', 'images'),
          dest: join(APP_ROOT, 'custom_components', 'lovelace_cards', 'lovelace'),
        },
      ],
    }),
  ],
});