import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

export default [
  // ES Modules
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.es.js',
      format: 'es'
    },
    plugins: [typescript(), terser()]
  },

  // UMD
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'reactUseThrottle',
      indent: false
    },
    plugins: [typescript(), terser()]
  }
]
