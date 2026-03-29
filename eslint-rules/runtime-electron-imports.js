const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'limit electron/runtime imports from the electron package to app only',
    },
    schema: [],
    messages: {
      onlyApp:
        'electron/runtime/* may import from the electron package only for app.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/runtime/') || isTestFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (source !== 'electron') {
          return;
        }

        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported &&
            specifier.imported.name === 'app'
          ) {
            continue;
          }

          context.report({ node: specifier, messageId: 'onlyApp' });
        }
      },
    };
  },
};
