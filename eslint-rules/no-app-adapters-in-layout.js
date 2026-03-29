const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow layout imports from src/app/adapters',
    },
    schema: [],
    messages: {
      forbidden: 'src/layout/* must not import src/app/adapters/*. Layout should compose UI, not call infrastructure adapters.',
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
          (source === '@/app/adapters' ||
            source.startsWith('@/app/adapters/') ||
            source.includes('/src/app/adapters/'))
        ) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
