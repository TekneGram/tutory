const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow direct electron package imports in electron/services',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/services/* must not import from the electron package directly. Use infrastructure adapters for Electron APIs.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/services/') || isTestFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (source === 'electron') {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
