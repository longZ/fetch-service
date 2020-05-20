import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import cleanup from 'rollup-plugin-cleanup'
import {uglify } from 'rollup-plugin-uglify'

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
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    cleanup()
  ],
  external: ['react', 'react-dom', 'prop-types', 'eventemitter3'],
}
if (env === 'production') {
  config.plugins.push(uglify())
}
export default config
