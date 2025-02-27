import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';

import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';

// Mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended });

export default [
  { languageOptions: { globals: globals.browser } },
  ...compat.extends('xo'),
  ...pluginVue.configs['flat/essential'],
  { ignores: ['dist/'] },
  {
    rules: {
      indent: ['error', 2],
      'object-curly-spacing': ['error', 'always'],
      'capitalized-comments': 'off',
      'padding-line-between-statements': 'off',
      'vue/require-v-for-key': 'off',
    },
  },
];
