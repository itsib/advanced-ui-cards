import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import litScss from './rollup-plugins/lit-scss.js';
import clean from 'rollup-plugin-delete';

const plugins = [
  clean({ targets: 'custom_components/ui_lovelace_minimalist/lovelace/*' }),
  litScss({
    minify: true,
    options: { loadPaths: ['src/scss'] },
  }),
  resolve({ browser: true }),
  commonjs(),
  typescript(),
  json(),
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
  }),
  terser(),
  copy({
    targets: [{ src: 'src/images/**/*', dest: 'custom_components/ui_lovelace_minimalist/lovelace' }],
  }),
];

export default [
  {
    input: 'src/ui-lovelace-minimalist.ts',
    output: {
      dir: 'custom_components/ui_lovelace_minimalist/lovelace',
      format: 'es',
    },
    plugins: [...plugins],
  },
];
