const { normalizeFilename, isTestFile } = require('./_utils');

function isIpcContractsImport(source) {
  return (
    source.startsWith('@electron/ipc/contracts/') ||
    source.startsWith('../../ipc/contracts/') ||
    source.startsWith('../ipc/contracts/')
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
    source === 'electron' ||
    source.startsWith('@electron/services/') ||
    source.startsWith('@electron/db/') ||
    source.startsWith('@electron/infrastructure/adapters/') ||
    source.startsWith('@electron/infrastructure/protocols/') ||
    source.startsWith('../services/') ||
    source.startsWith('../../services/') ||
    source.startsWith('../db/') ||
    source.startsWith('../../db/') ||
    source.startsWith('./adapters/') ||
    source.startsWith('../adapters/') ||
    source.startsWith('./protocols/') ||
    source.startsWith('../protocols/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'keep electron/infrastructure/ports pure and capability-focused',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/infrastructure/ports/* must stay pure and must not import the electron package, services, db, adapters, or protocols. Imports from electron/ipc/* are limited to shared contracts in electron/ipc/contracts/*.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/infrastructure/ports/') || isTestFile(filename)) {
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
