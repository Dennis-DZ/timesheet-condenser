module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'xo',
    'plugin:vue/vue3-essential',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      extends: [
        'xo-typescript',
      ],
      files: [
        '*.ts',
        '*.tsx',
      ],
      parserOptions: {
        project: [
          'tsconfig.node.json',
          'tsconfig.app.json',
        ],
      },
      rules: {
        '@typescript-eslint/indent': ['error', 2],
        '@typescript-eslint/object-curly-spacing': ['error', 'always'],
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  ignorePatterns: [
    'dist/',
  ],
  rules: {
    indent: ['error', 2],
    'object-curly-spacing': ['error', 'always'],
  },
};
