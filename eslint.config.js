const { builtinModules } = require('module');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...builtinModules.reduce((acc, mod) => ({ ...acc, [mod]: 'readonly' }), {}),
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
    },
    plugins: ['prettier'],
    rules: {
      'no-console': 'warn',
      indent: ['error', 2],
      quotes: ['error', 'double'],
      semi: ['error', 'always'],
      eqeqeq: 'error',
      'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
      'comma-dangle': ['error', 'never'],
      'arrow-spacing': ['error', { before: true, after: true }],
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  },
  {
    files: ['**/*.html'],
    plugins: ['html'],
    rules: {
      indent: ['error', 2],
      'html-indent': ['error', 2], // Set a custom rule to indent HTML
      'html-quotes': ['error', 'double'], // Enforce double quotes for HTML attributes
      'self-closing-comp': 'off', // Disable self-closing tags
    },
  },
];
