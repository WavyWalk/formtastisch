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
  }
]
