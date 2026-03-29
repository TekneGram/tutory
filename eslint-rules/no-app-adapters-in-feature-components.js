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
      description: 'disallow feature component imports from src/app/adapters',
    },
    schema: [],
    messages: {
      forbidden:
        'Feature component files must not import src/app/adapters/*. Route adapter access through feature services.',
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
          (source === '@/app/adapters' ||
            source.startsWith('@/app/adapters/') ||
            source.includes('/src/app/adapters/'))
        ) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
