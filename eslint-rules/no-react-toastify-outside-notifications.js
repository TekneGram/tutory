const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow direct react-toastify imports outside notifications adapter',
    },
    schema: [],
    messages: {
      forbidden: 'Import react-toastify only in src/app/adapters/notifications.ts.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());
    const allowedFile =
      filename.endsWith('/src/app/adapters/notifications.ts') ||
      filename.endsWith('/src/main.tsx');

    if (allowedFile || isTestFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (typeof source === 'string' && (source === 'react-toastify' || source.startsWith('react-toastify/'))) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
