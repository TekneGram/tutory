const { normalizeFilename, isTestFile } = require('./_utils');

function isPascalCase(name) {
  return typeof name === 'string' && /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function containsJsx(node) {
  let found = false;
  const visited = new Set();

  function visit(current) {
    if (!current || found) return;
    if (visited.has(current)) return;
    visited.add(current);

    if (
      current.type === 'JSXElement' ||
      current.type === 'JSXFragment'
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

function isReactComponentDeclaration(node) {
  if (!node) return false;

  if (node.type === 'FunctionDeclaration') {
    return Boolean(node.id && isPascalCase(node.id.name) && containsJsx(node.body));
  }

  if (node.type === 'VariableDeclaration') {
    return node.declarations.some((decl) => {
      if (!decl.id || decl.id.type !== 'Identifier' || !isPascalCase(decl.id.name) || !decl.init) {
        return false;
      }

      if (
        decl.init.type === 'ArrowFunctionExpression' ||
        decl.init.type === 'FunctionExpression'
      ) {
        return containsJsx(decl.init.body);
      }

      if (
        decl.init.type === 'CallExpression' &&
        decl.init.arguments &&
        decl.init.arguments.length > 0
      ) {
        return decl.init.arguments.some((arg) => {
          if (
            arg &&
            (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression')
          ) {
            return containsJsx(arg.body);
          }
          return false;
        });
      }

      return false;
    });
  }

  if (node.type === 'ClassDeclaration') {
    return Boolean(node.id && isPascalCase(node.id.name));
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce one React component per .tsx file',
    },
    schema: [],
    messages: {
      extra: 'Define only one component per .tsx file. Move subcomponents to their own files.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename());

    if (!filename.endsWith('.tsx') || isTestFile(filename)) {
      return {};
    }

    return {
      Program(node) {
        const componentNodes = node.body.filter(isReactComponentDeclaration);

        if (componentNodes.length <= 1) {
          return;
        }

        for (let i = 1; i < componentNodes.length; i += 1) {
          context.report({ node: componentNodes[i], messageId: 'extra' });
        }
      },
    };
  },
};
