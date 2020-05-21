import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup'
import {uglify} from 'rollup-plugin-uglify'
import EventEmitter from 'eventemitter3'

var env = process.env.NODE_ENV
var config = {
  input: './src/index.js',
  output: {
    file: './dist/index.js',
    format: 'umd',
    name: 'fetchServiceParser'
  },
  plugins: [
    resolve({
      mainFields: ['module', 'main']
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs({
      include: /node_modules/,
      namedExports: {
        'eventemitter3': Object.keys(EventEmitter),
      }
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    cleanup()
  ],
  external: ['react', 'react-dom', 'prop-types'],
}
if (env === 'production') {
  config.plugins.push(uglify())
}
export default config
