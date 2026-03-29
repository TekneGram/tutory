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
    source === 'electron' ||
    source.startsWith('@electron/services/') ||
    source.startsWith('@electron/db/') ||
    source.startsWith('@electron/infrastructure/') ||
    source.startsWith('@electron/runtime/') ||
    source.startsWith('../services/') ||
    source.startsWith('../../services/') ||
    source.startsWith('../db/') ||
    source.startsWith('../../db/') ||
    source.startsWith('../infrastructure/') ||
    source.startsWith('../../infrastructure/') ||
    source.startsWith('../runtime/') ||
    source.startsWith('../../runtime/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow cross-layer imports in electron/core',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/core/* must stay generic and must not import from services, db, infrastructure, runtime, or the electron package. Imports from electron/ipc/* are limited to shared contracts in electron/ipc/contracts/*.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/core/') || isTestFile(filename)) {
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
