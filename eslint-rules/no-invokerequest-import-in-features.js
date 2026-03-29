const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow feature imports of src/app/adapters/invokeRequest',
    },
    schema: [],
    messages: {
      forbidden: 'Features must not import invokeRequest directly. Use ports/adapters instead.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/src/features/') || isTestFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (
          typeof source === 'string' &&
          (source === '@/app/adapters/invokeRequest' ||
            source.endsWith('/app/adapters/invokeRequest') ||
            source.includes('/app/adapters/invokeRequest'))
        ) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
