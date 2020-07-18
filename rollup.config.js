import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'frontend.js',
  output: {
    file: 'dist/index.js',
    format: 'iife',
    name: 'dayChart',
    sourcemap: true
  },
  plugins: [ resolve(), commonjs() ]
};
