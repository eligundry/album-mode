/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['@remix-run/eslint-config', '@remix-run/eslint-config/node'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'off',
    'react/display-name': 'off',
  },
}
