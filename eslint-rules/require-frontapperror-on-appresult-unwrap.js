const { normalizeFilename, isTestFile } = require('./_utils');

function isResultOkFailureCheck(node) {
  if (!node) return false;

  if (
    node.type === 'UnaryExpression' &&
    node.operator === '!' &&
    node.argument &&
    node.argument.type === 'MemberExpression' &&
    !node.argument.computed &&
    node.argument.property.type === 'Identifier' &&
    node.argument.property.name === 'ok'
  ) {
    return true;
  }

  if (
    node.type === 'BinaryExpression' &&
    (node.operator === '===' || node.operator === '==') &&
    node.left &&
    node.left.type === 'MemberExpression' &&
    !node.left.computed &&
    node.left.property.type === 'Identifier' &&
    node.left.property.name === 'ok' &&
    node.right &&
    node.right.type === 'Literal' &&
    node.right.value === false
  ) {
    return true;
  }

  return false;
}

function containsFrontAppErrorThrow(node) {
  let found = false;
  const visited = new Set();

  function visit(current) {
    if (!current || found) return;
    if (visited.has(current)) return;
    visited.add(current);

    if (
      current.type === 'ThrowStatement' &&
      current.argument &&
      current.argument.type === 'NewExpression' &&
      current.argument.callee &&
      current.argument.callee.type === 'Identifier' &&
      current.argument.callee.name === 'FrontAppError'
    ) {
      found = true;
      return;
    }

    for (const [key, value] of Object.entries(current)) {
      if (key === 'parent') continue;
      if (!value) continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item.type === 'string') visit(item);
        }
      } else if (value && typeof value.type === 'string') {
        visit(value);
      }
    }
  }

  visit(node);
  return found;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require FrontAppError when feature services unwrap failed AppResult values',
    },
    schema: [],
    messages: {
      missingThrow: 'Feature services that unwrap failed AppResult values must throw new FrontAppError(result.error).',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());
    const isFeatureService =
      filename.includes('/src/features/') &&
      filename.includes('/services/') &&
      filename.endsWith('.ts');

    if (!isFeatureService || isTestFile(filename)) {
      return {};
    }

    return {
      IfStatement(node) {
        if (!isResultOkFailureCheck(node.test)) {
          return;
        }

        if (!containsFrontAppErrorThrow(node.consequent)) {
          context.report({ node, messageId: 'missingThrow' });
        }
      },
    };
  },
};
