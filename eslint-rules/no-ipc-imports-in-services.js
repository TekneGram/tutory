const { normalizeFilename, isTestFile } = require('./_utils');

function isForbiddenSource(source) {
  const isIpcImport =
    source.startsWith('@electron/ipc/') ||
    source.startsWith('../ipc/') ||
    source.startsWith('../../ipc/');

  if (!isIpcImport) {
    return false;
  }

  return !(
    source.startsWith('@electron/ipc/contracts/') ||
    source.startsWith('../ipc/contracts/') ||
    source.startsWith('../../ipc/contracts/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow service imports from electron/ipc',
    },
    schema: [],
    messages: {
      forbidden: 'electron/services/* must not import from electron/ipc/* except shared contracts in electron/ipc/contracts/*.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/services/') || isTestFile(filename)) {
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
