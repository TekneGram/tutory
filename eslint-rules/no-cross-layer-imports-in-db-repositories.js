const { normalizeFilename, isTestFile } = require('./_utils');

function isForbiddenSource(source) {
  const isIpcImport =
    source.startsWith('@electron/ipc/') ||
    source.startsWith('../ipc/') ||
    source.startsWith('../../ipc/');

  if (isIpcImport) {
    return !(
      source.startsWith('@electron/ipc/contracts/') ||
      source.startsWith('../ipc/contracts/') ||
      source.startsWith('../../ipc/contracts/')
    );
  }

  return (
    source.startsWith('@electron/services/') ||
    source.startsWith('@electron/runtime/') ||
    source.startsWith('@electron/infrastructure/') ||
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
        'electron/db/repositories/* must stay DB-focused and must not import from services, runtime, or infrastructure layers. Imports from electron/ipc/* are limited to shared contracts in electron/ipc/contracts/*.',
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
