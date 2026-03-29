const { normalizeFilename, isTestFile } = require('./_utils');

function isIpcContractsImport(source) {
  return (
    source.startsWith('@electron/ipc/contracts/') ||
    source.startsWith('../ipc/contracts/') ||
    source.startsWith('../../ipc/contracts/')
  );
}

function isForbiddenSource(source) {
  const isLoggerImport =
    source === '@electron/services/logger' ||
    source === '../services/logger' ||
    source === '../../services/logger';

  if (isLoggerImport) {
    return false;
  }

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
    source.startsWith('@electron/infrastructure/protocols/') ||
    source.startsWith('../services/') ||
    source.startsWith('../../services/') ||
    source.startsWith('../db/') ||
    source.startsWith('../../db/') ||
    source.startsWith('./protocols/') ||
    source.startsWith('../protocols/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'keep electron/infrastructure/adapters thin and capability-focused',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/infrastructure/adapters/* must not import from services other than the shared logger, db, or protocols. Imports from electron/ipc/* are limited to shared contracts in electron/ipc/contracts/*.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/infrastructure/adapters/') || isTestFile(filename)) {
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
