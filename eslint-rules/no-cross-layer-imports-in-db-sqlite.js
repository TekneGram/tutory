const { normalizeFilename, isTestFile } = require('./_utils');

function isForbiddenSource(source) {
  return (
    source.startsWith('@electron/ipc/') ||
    source.startsWith('@electron/services/') ||
    source.startsWith('@electron/runtime/') ||
    source.startsWith('@electron/infrastructure/') ||
    source.startsWith('./repositories/') ||
    source.startsWith('../ipc/') ||
    source.startsWith('../services/') ||
    source.startsWith('../runtime/') ||
    source.startsWith('../infrastructure/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'keep electron/db/sqlite.ts generic and reusable',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/db/sqlite.ts must remain generic and must not import repositories or higher-level backend layers.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.endsWith('/electron/db/sqlite.ts') || isTestFile(filename)) {
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
