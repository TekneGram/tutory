const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow window.api.invoke outside src/app/adapters/invokeRequest.ts',
    },
    schema: [],
    messages: {
      forbidden: 'Call window.api.invoke(...) only inside src/app/adapters/invokeRequest.ts.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());
    const allowedFile = filename.endsWith('/src/app/adapters/invokeRequest.ts');

    if (allowedFile || isTestFile(filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee &&
          callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.property &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'invoke'
        ) {
          const object = callee.object;
          if (
            object &&
            object.type === 'MemberExpression' &&
            !object.computed &&
            object.object &&
            object.object.type === 'Identifier' &&
            object.object.name === 'window' &&
            object.property &&
            object.property.type === 'Identifier' &&
            object.property.name === 'api'
          ) {
            context.report({ node, messageId: 'forbidden' });
          }
        }
      },
    };
  },
};
