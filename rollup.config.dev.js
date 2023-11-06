import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import clean from 'rollup-plugin-delete';
import litScss from './rollup-plugins/lit-scss.js';

const plugins = [
  clean({ targets: 'custom_components/lovelace_cards/lovelace/*' }),
  litScss({
    minify: false,
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
  copy({
    targets: [{ src: 'src/images/**/*', dest: 'custom_components/lovelace_cards/lovelace' }],
  }),
];

export default [
  {
    input: 'src/lovelace-cards.ts',
    output: {
      dir: 'custom_components/lovelace_cards/lovelace',
      format: 'es',
    },
    plugins: [...plugins],
  },
];
