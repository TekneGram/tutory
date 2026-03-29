const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow window.api usage outside src/app/adapters',
    },
    schema: [],
    messages: {
      forbidden: 'Use src/app/adapters/* instead of calling window.api here.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());
    const isRendererFile = filename.includes('/src/');
    const isAllowedFile = filename.includes('/src/app/adapters/');

    if (!isRendererFile || isAllowedFile || isTestFile(filename)) {
      return {};
    }

    return {
      MemberExpression(node) {
        if (
          node.object &&
          node.object.type === 'Identifier' &&
          node.object.name === 'window' &&
          node.property &&
          node.property.type === 'Identifier' &&
          node.property.name === 'api' &&
          !node.computed
        ) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
