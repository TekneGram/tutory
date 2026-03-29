const { normalizeFilename, isTestFile } = require('./_utils');

function isFeatureHookFile(filename) {
  return (
    filename.includes('/src/features/') &&
    filename.includes('/hooks/') &&
    !isTestFile(filename)
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow feature hook imports from src/app/adapters',
    },
    schema: [],
    messages: {
      forbidden:
        'Feature hooks must not import src/app/adapters/* directly. Route adapter access through feature services.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!isFeatureHookFile(filename)) {
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
