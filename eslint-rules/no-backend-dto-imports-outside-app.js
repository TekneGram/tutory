const { normalizeFilename, isTestFile } = require('./_utils');

function isBackendDtoImport(source) {
  return (
    source.startsWith('@electron/ipc/contracts/') ||
    source.startsWith('../electron/ipc/contracts/') ||
    source.startsWith('../../electron/ipc/contracts/') ||
    source.startsWith('electron/ipc/contracts/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow frontend imports of backend DTO contracts outside src/app',
    },
    schema: [],
    messages: {
      forbidden: 'Frontend code outside src/app must not import backend IPC DTOs directly.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/src/') || filename.includes('/src/app/') || isTestFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (typeof source === 'string' && isBackendDtoImport(source)) {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
