module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['plugin:react/recommended', 'standard'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 13,
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'space-before-function-paren': 'off',
    'multiline-ternary': 'off',
    camelcase: 'off',
    'no-void': 'off',
    'brace-style': 'off',
    'react/no-unescaped-entities': 'off',
    indent: 'off'
  }
}
