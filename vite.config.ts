import { defineConfig, type UserConfig } from 'vite';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import copy from 'vite-plugin-cp';
import { scssInline } from '../../plugins/scss-inline';
// import { resolveExternalLit } from '../../plugins/resolve-external-lit';
import * as process from 'node:process';

const APP_ROOT = dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  const isWatch = process.argv.includes('--watch');
  return {
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
            } else {
              return 'advanced-ui-cards';
            }
          },
        },
        watch: {},
      },
    },
    plugins: [
      // resolveExternalLit(),
      scssInline(),
      copy({
        targets: [
          {
            src: join(APP_ROOT, 'src', 'images'),
            dest: join(APP_ROOT, 'custom_components', 'advanced_ui_cards', 'lovelace'),
          },
        ],
      }),
    ],
  } as UserConfig;
});