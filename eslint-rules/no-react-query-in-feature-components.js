const { normalizeFilename, isTestFile } = require('./_utils');

function isFeatureComponentFile(filename) {
  return (
    filename.includes('/src/features/') &&
    !filename.includes('/src/features/__tests__/') &&
    !filename.includes('/services/') &&
    !filename.includes('/hooks/') &&
    !isTestFile(filename)
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow react-query imports in feature component files',
    },
    schema: [],
    messages: {
      forbidden:
        'Feature component files must not import @tanstack/react-query directly. Use dedicated feature hooks.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!isFeatureComponentFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (source === '@tanstack/react-query') {
          context.report({ node, messageId: 'forbidden' });
        }
      },
    };
  },
};
