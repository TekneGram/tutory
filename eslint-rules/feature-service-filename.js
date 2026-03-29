const path = require('path');
const { normalizeFilename, isTestFile } = require('./_utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require feature service filenames to end with .service.ts',
    },
    schema: [],
    messages: {
      invalid: 'Feature service filenames must end with ".service.ts".',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (
      !filename.includes('/src/features/') ||
      !filename.includes('/services/') ||
      isTestFile(filename)
    ) {
      return {};
    }

    return {
      Program(node) {
        const basename = path.basename(filename);
        if (!basename.endsWith('.service.ts')) {
          context.report({ node, messageId: 'invalid' });
        }
      },
    };
  },
};
