const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow safeHandle usage outside electron/ipc',
    },
    schema: [],
    messages: {
      forbidden: 'Use safeHandle(...) only inside electron/ipc/*.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (filename.includes('/electron/ipc/') || isTestFile(filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        if (node.callee && node.callee.type === 'Identifier' && node.callee.name === 'safeHandle') {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
