module.exports = {
  client: {
    service: {
      localSchemaFile: 'apps/playnite-web/.generated/schema.generated.graphqls',
    },
    // array of glob patterns
    includes: [
      'apps/playnite-web/src/**/*.ts',
      'apps/playnite-web/src/**/*.tsx',
    ],
    // array of glob patterns
    excludes: ['**/__tests__/**', '**/__component_tests__/**'],
  },
}
