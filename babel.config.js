const presets = [
  "@babel/preset-env", "@babel/preset-react"
]

const plugins = [
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  '@babel/plugin-proposal-function-sent',
  '@babel/plugin-proposal-export-namespace-from',
  '@babel/plugin-proposal-numeric-separator',
  '@babel/plugin-proposal-throw-expressions',
  "@babel/plugin-proposal-class-properties",
  "@babel/plugin-syntax-dynamic-import"
]

module.exports = { presets, plugins }