const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow direct toast usage outside src/app/adapters/notifications.ts',
    },
    schema: [],
    messages: {
      forbidden: 'Use src/app/adapters/notifications.ts instead of calling toast directly here.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());
    const allowedFile = filename.endsWith('/src/app/adapters/notifications.ts');

    if (allowedFile || isTestFile(filename)) {
      return {};
    }

    return {
      ImportSpecifier(node) {
        const parent = node.parent;
        if (
          parent &&
          parent.type === 'ImportDeclaration' &&
          parent.source &&
          parent.source.value === 'react-toastify' &&
          node.imported &&
          node.imported.type === 'Identifier' &&
          node.imported.name === 'toast'
        ) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
      MemberExpression(node) {
        if (
          node.object &&
          node.object.type === 'Identifier' &&
          node.object.name === 'toast'
        ) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
      CallExpression(node) {
        if (node.callee && node.callee.type === 'Identifier' && node.callee.name === 'toast') {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
