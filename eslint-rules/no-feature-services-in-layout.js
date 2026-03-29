const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow layout imports from feature services',
    },
    schema: [],
    messages: {
      forbidden: 'src/layout/* must not import src/features/**/services/*. Layout should render features, not call feature services directly.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/src/layout/') || isTestFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (
          typeof source === 'string' &&
          (source.includes('/services/') ||
            source.startsWith('@/features/') && source.includes('/services/'))
        ) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
