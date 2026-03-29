const path = require('path');
const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require feature hook filenames to start with use',
    },
    schema: [],
    messages: {
      invalid: 'Feature hook filenames must start with "use".',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (
      !filename.includes('/src/features/') ||
      !filename.includes('/hooks/') ||
      isTestFile(filename)
    ) {
      return {};
    }

    return {
      Program(node) {
        const basename = path.basename(filename);
        if (!basename.startsWith('use')) {
          context.report({ node, messageId: 'invalid' });
        }
      },
    };
  },
};
