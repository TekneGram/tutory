const { normalizeFilename, isTestFile } = require('./_utils');

function isForbiddenSource(source) {
  return (
    source.startsWith('@electron/') ||
    source === 'electron' ||
    source.startsWith('electron/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow renderer imports from electron code',
    },
    schema: [],
    messages: {
      forbidden: 'Renderer code must not import from electron/*. Use frontend ports/adapters instead.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/src/') || isTestFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (typeof source === 'string' && isForbiddenSource(source)) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
