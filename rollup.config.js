import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import litScss from './rollup-plugins/lit-scss';
import clean from 'rollup-plugin-delete';
import minifyHTML from 'rollup-plugin-minify-html-literals';

const plugins = [
  clean({ targets: 'custom_components/lovelace_cards/lovelace/*' }),
  minifyHTML(),
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
