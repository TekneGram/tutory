const { normalizeFilename, isTestFile } = require('./_utils');

function isForbiddenSource(source) {
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
      description: 'keep electron/ipc/contracts pure DTOs',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/ipc/contracts/* must stay pure DTOs and must not import from electron, services, db, infrastructure, or runtime.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/ipc/contracts/') || isTestFile(filename)) {
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
