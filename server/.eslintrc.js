export default {
  env: {
    node: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'linebreak-style': ['error', 'unix'],
    quotes: 'off',
    semi: 'off',
    indent: ['error', 2],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'consistent-return': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': ['error', { props: false }],
    'max-len': ['error', { code: 120 }],
    'object-curly-newline': ['error', { consistent: true }],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    'import/extensions': ['error', 'ignorePackages'],
  },
}
