// Flat ESLint config for Expo SDK 57 (ESLint 9).
// The Expo preset bundles eslint-plugin-react-hooks, so
// react-hooks/rules-of-hooks and exhaustive-deps are enforced.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      // React-Compiler immutability rule flags Reanimated's `sharedValue.value = x`,
      // which is the intended API. We keep rules-of-hooks + exhaustive-deps (the real net).
      'react-hooks/immutability': 'off',
    },
  },
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
]);
