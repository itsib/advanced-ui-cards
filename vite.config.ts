/// <reference types="vite" />
/// <reference types="vitest" />
import { defineConfig, type UserConfig } from 'vite';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import copy from 'vite-plugin-cp';
import { scssInline } from '../../plugins/scss-inline';
import { resolveExternalLit } from '../../plugins/resolve-external-lit';
import * as process from 'node:process';
import { iconsGenerator } from './plugins/icons-generator';

const APP_ROOT = dirname(fileURLToPath(import.meta.url));

const isWatch = process.argv.includes('--watch');

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
    emptyOutDir: !isWatch,
    minify: false,
    lib: {
      formats: ['es'],
      entry: {
        ['advanced-ui-cards']: join(APP_ROOT, 'src', 'index.ts'),
        ['advanced-ui-cards-app']: join(APP_ROOT, 'src', 'app.ts'),
        ['brand-resolver']: join(APP_ROOT, 'src', 'brand-resolver', 'index.ts'),
      },
    },
    outDir: join(APP_ROOT, 'custom_components', 'advanced_ui_cards', 'lovelace'),
    rollupOptions: {
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        manualChunks(id: string) {
          const path = relative(APP_ROOT, id);
          if (/\/brand-resolver\//.test(path)) {
            return 'brand-resolver';
          } else if (path === 'src/index.ts') {
            return 'advanced-ui-cards';
          } else {
            return 'advanced-ui-cards-app';
          }
        },
      },
      watch: {},
      external: [
        '/static/mdi/iconList.json',
      ],
    },
  },
  plugins: [
    iconsGenerator({
      input: join(APP_ROOT, 'src', 'icons', 'sources'),
      output: join(APP_ROOT, 'src', 'icons', 'index.ts'),
    }),
    resolveExternalLit(),
    scssInline() as any,
    copy({
      targets: [
        {
          src: join(APP_ROOT, 'src', 'images'),
          dest: join(APP_ROOT, 'custom_components', 'advanced_ui_cards', 'lovelace'),
        },
      ],
    }),
  ],
  test: {
    css: false,
    include: ['src/**/*.{spec,test}.{js,jsx,ts,tsx}'],
    globals: true,
    environment: 'node',
    setupFiles: 'src/setup-tests.ts',
    restoreMocks: true,
  },
});