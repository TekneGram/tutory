const { normalizeFilename, isTestFile } = require('./_utils');

function isForbiddenSource(source) {
  return (
    source.startsWith('@electron/db/') ||
    source.startsWith('@electron/infrastructure/') ||
    source.startsWith('@electron/runtime/') ||
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
      description: 'keep electron/ipc/registerHandlers boundary-focused',
    },
    schema: [],
    messages: {
      forbidden:
        'electron/ipc/registerHandlers/* must stay boundary-focused and must not import from db, infrastructure, or runtime.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (
      !filename.includes('/electron/ipc/registerHandlers/') ||
      isTestFile(filename)
    ) {
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
