module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    'color-named': 'never',
    'color-no-hex': true,
    'declaration-no-important': true,
    'unit-allowed-list': ['%', 'rem', 'em', 'vh', 'vw', 's', 'ms'],
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [/^--/, /^\$\w+/]
      }
    ],
    'order/properties-order': []
  },
  overrides: [
    {
      files: ['**/*.vue', '**/*.css', '**/*.scss'],
      customSyntax: 'postcss-html'
    }
  ]
}
