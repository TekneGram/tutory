const { normalizeFilename, isTestFile } = require('./_utils');

function isForbiddenSource(source) {
  const isInfrastructureImport =
    source.startsWith('@electron/infrastructure/') ||
    source.startsWith('../infrastructure/') ||
    source.startsWith('../../infrastructure/');

  if (isInfrastructureImport) {
    return !(
      source.startsWith('@electron/infrastructure/ports/') ||
      source.startsWith('../infrastructure/ports/') ||
      source.startsWith('../../infrastructure/ports/')
    );
  }

  return (
    source.startsWith('@electron/db/') ||
    source.startsWith('@electron/runtime/') ||
    source.startsWith('../db/') ||
    source.startsWith('../../db/') ||
    source.startsWith('../runtime/') ||
    source.startsWith('../../runtime/')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow cross-layer imports in electron/ipc',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/ipc/* must remain a transport boundary and must not import from db, runtime, or concrete infrastructure implementations. Imports from electron/infrastructure/* are limited to shared ports in electron/infrastructure/ports/*.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.includes('/electron/ipc/') || isTestFile(filename)) {
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
