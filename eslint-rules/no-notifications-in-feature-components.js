const { normalizeFilename, isTestFile } = require('./_utils');

function isFeatureComponentFile(filename) {
  return (
    filename.includes('/src/features/') &&
    !filename.includes('/src/features/__tests__/') &&
    !filename.includes('/services/') &&
    !filename.includes('/hooks/') &&
    !isTestFile(filename)
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow notifications adapter imports in feature component files',
    },
    schema: [],
    messages: {
      forbidden:
        'Feature component files must not import the notifications adapter directly. Trigger notifications in services or workflow hooks.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!isFeatureComponentFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (
          typeof source === 'string' &&
          (source === '@/app/adapters/notifications' ||
            source.endsWith('/app/adapters/notifications') ||
            source.includes('/app/adapters/notifications'))
        ) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
