const { normalizeFilename, isTestFile } = require('./_utils');

function isIpcContractsImport(source) {
  return (
    source.startsWith('@electron/ipc/contracts/') ||
    source.startsWith('../ipc/contracts/') ||
    source.startsWith('../../ipc/contracts/')
  );
}

function isForbiddenSource(source) {
  const isIpcImport =
    source.startsWith('@electron/ipc/') ||
    source.startsWith('../ipc/') ||
    source.startsWith('../../ipc/');

  if (isIpcImport) {
    return !isIpcContractsImport(source);
  }

  return (
    source.startsWith('@electron/services/') ||
    source.startsWith('@electron/db/') ||
    source.startsWith('../services/') ||
    source.startsWith('../../services/') ||
    source.startsWith('../db/') ||
    source.startsWith('../../db/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow cross-layer imports in electron/infrastructure',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/infrastructure/* must not import from services or from db. Imports from electron/ipc/* are limited to shared contracts in electron/ipc/contracts/*.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/infrastructure/') || isTestFile(filename)) {
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
