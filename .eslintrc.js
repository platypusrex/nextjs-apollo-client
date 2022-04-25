module.exports = {
  extends: [
    "react-app",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  settings: {
    "react": {
      "version": "detect"
    }
  },
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
      },
    ],
  }
}
