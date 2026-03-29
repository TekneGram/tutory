const { normalizeFilename, isTestFile } = require('./_utils');

function isForbiddenSource(source) {
  const isIpcImport =
    source.startsWith('@electron/ipc/') ||
    source.startsWith('../ipc/');

  if (isIpcImport) {
    return !(
      source.startsWith('@electron/ipc/contracts/') ||
      source.startsWith('../ipc/contracts/')
    );
  }

  return (
    source.startsWith('@electron/services/') ||
    source.startsWith('@electron/infrastructure/') ||
    source.startsWith('./repositories/') ||
    source.startsWith('../services/') ||
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
        'electron/db/sqlite.ts must remain generic and must not import repositories, infrastructure, or services. Imports from electron/ipc/* are limited to shared contracts in electron/ipc/contracts/*.',
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
