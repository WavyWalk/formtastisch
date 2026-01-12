const typescript = require('@rollup/plugin-typescript')
const terser = require('@rollup/plugin-terser')

module.exports = [
  // ES Modules
  {
    input: 'src/index.ts',
    // Ensure peer dependencies are not bundled
    external: ['react', 'react-dom'],
    output: {
      file: 'dist/index.es.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [typescript(), terser()]
  },

  // UMD
  {
    input: 'src/index.ts',
    // Ensure peer dependencies are not bundled
    external: ['react', 'react-dom'],
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'formtastisch',
      indent: false,
      sourcemap: true,
      // Provide global variable names for externals in UMD build
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    },
    plugins: [typescript(), terser()]
  }
]
