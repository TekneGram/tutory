const { normalizeFilename, isTestFile } = require('./_utils');

function isForbiddenSource(source) {
  return (
    source.startsWith('@electron/ipc/') ||
    source.startsWith('@electron/services/') ||
    source.startsWith('@electron/runtime/') ||
    source.startsWith('@electron/infrastructure/') ||
    source.startsWith('../ipc/') ||
    source.startsWith('../../ipc/') ||
    source.startsWith('../services/') ||
    source.startsWith('../../services/') ||
    source.startsWith('../runtime/') ||
    source.startsWith('../../runtime/') ||
    source.startsWith('../infrastructure/') ||
    source.startsWith('../../infrastructure/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow cross-layer imports in electron/db/repositories',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/db/repositories/* must stay DB-focused and must not import from ipc, services, runtime, or infrastructure layers.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/db/repositories/') || isTestFile(filename)) {
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
