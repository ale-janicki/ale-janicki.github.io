import path from 'node:path'

const DOM_PRIMITIVES = {
  button: 'Button',
  input: 'Input',
  select: 'Select',
  textarea: 'Input',
  dialog: 'Modal',
}
const NATIVE_PRIMITIVES = {
  TouchableOpacity: 'Button',
  TouchableHighlight: 'Button',
  Pressable: 'Button',
  TextInput: 'Input',
  Modal: 'Modal',
}
const PRIMITIVE_DIR = /[\\/](ui|buttons?|inputs?|modals?)[\\/]/i
const VIEW_DIR = /[\\/](pages|components)[\\/]/i
const DIRECTIVE = /^\s*(eslint|@ts-|prettier-ignore|istanbul|c8|webpack|vite-|global |\/ ?<reference)/
const PORTUGUESE = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/
const PASCAL = /^[A-Z][A-Za-z0-9]*$/
const ALLOWED_TSX = /^(index|skeleton)\.tsx$|\.(test|spec|stories)\.tsx$/

// Returns true when the file is a primitive implementation, where raw elements belong
function isPrimitiveFile(filename) {
  return PRIMITIVE_DIR.test(filename)
}

// Returns true when the node is (or wraps) a function definition
function definesFunction(node) {
  if (!node) return false
  switch (node.type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
    case 'TSDeclareFunction':
    case 'MethodDefinition':
    case 'TSMethodSignature':
    case 'TSAbstractMethodDefinition':
      return true
    case 'VariableDeclaration':
      return node.declarations.some((d) => definesFunction(d.init))
    case 'Property':
    case 'PropertyDefinition':
      return definesFunction(node.value)
    case 'CallExpression':
      return node.arguments.some(definesFunction)
    default:
      return false
  }
}

// Returns true when the node is something worth a locating comment: function, class, interface or type
function isCommentable(node) {
  if (!node) return false
  if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
    return isCommentable(node.declaration)
  }
  if (['ClassDeclaration', 'ClassExpression', 'TSInterfaceDeclaration', 'TSTypeAliasDeclaration'].includes(node.type)) {
    return true
  }
  return definesFunction(node)
}

// Finds the outermost node that starts exactly at the given index
function nodeStartingAt(sourceCode, index) {
  let node = sourceCode.getNodeByRangeIndex(index)
  while (node && node.parent && node.parent.range[0] === index && node.parent.type !== 'Program') {
    node = node.parent
  }
  return node
}

const noRawPrimitives = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    if (isPrimitiveFile(context.filename)) return {}
    const nativeImports = new Set()
    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react-native') return
        for (const s of node.specifiers) {
          if (s.type === 'ImportSpecifier' && NATIVE_PRIMITIVES[s.imported.name]) nativeImports.add(s.local.name)
        }
      },
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier') return
        const name = node.name.name
        const target = DOM_PRIMITIVES[name] || (nativeImports.has(name) && NATIVE_PRIMITIVES[name])
        if (!target) return
        context.report({
          node,
          message: `Raw <${name}> outside the primitive. Use the project's existing ${target} from components/ui (add a variant if a style is missing).`,
        })
      },
    }
  },
}

const noDirectApi = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    if (!VIEW_DIR.test(context.filename)) return {}
    const report = (node, what) =>
      context.report({ node, message: `${what} inside a page/component. Data goes through services/ (consumed by a hook).` })
    return {
      ImportDeclaration(node) {
        const src = String(node.source.value)
        if (/^@supabase\//.test(src) || /integrations\/supabase/.test(src) || src === 'axios') {
          report(node, `Import of '${src}'`)
        }
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'fetch') report(node, 'fetch()')
      },
    }
  },
}

const noParentImports = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    return {
      ImportDeclaration(node) {
        const src = String(node.source.value)
        if (src.startsWith('../')) {
          context.report({ node, message: `Relative parent import '${src}'. Use the @/ alias.` })
        }
      },
    }
  },
}

const structure = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    const file = context.filename
    if (!file.endsWith('.tsx') || !VIEW_DIR.test(file)) return {}
    return {
      Program(node) {
        const base = path.basename(file)
        if (!ALLOWED_TSX.test(base)) {
          context.report({
            node,
            loc: { line: 1, column: 0 },
            message: `'${base}' breaks the structure. A component or page is a PascalCase folder with index.tsx + styles.module.css (e.g. ${base.replace(/\.tsx$/, '')}/index.tsx).`,
          })
          return
        }
        if (base !== 'index.tsx') return
        const dir = path.basename(path.dirname(file))
        if (!PASCAL.test(dir)) {
          context.report({
            node,
            loc: { line: 1, column: 0 },
            message: `Folder '${dir}/' holds a component but is not PascalCase.`,
          })
        }
      },
    }
  },
}

const comments = {
  meta: { type: 'suggestion', schema: [] },
  create(context) {
    const sourceCode = context.sourceCode
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          const text = comment.value
          if (DIRECTIVE.test(text) || comment.type === 'Shebang') continue
          const report = (message) => context.report({ loc: comment.loc, message })
          if (comment.loc.start.line !== comment.loc.end.line) {
            report('Multi-line comment. One line at most, above a function, class, interface or type.')
            continue
          }
          const before = sourceCode.getTokenBefore(comment)
          if (before && before.loc.end.line === comment.loc.start.line) {
            report('Comment at the end of a code line. Remove it.')
            continue
          }
          if (/\b(TODO|FIXME|XXX|HACK)\b/.test(text)) {
            report('TODO/FIXME in code. Track it outside the code.')
            continue
          }
          if (PORTUGUESE.test(text)) {
            report('Comment not in English.')
            continue
          }
          const prev = sourceCode.getTokenBefore(comment, { includeComments: true })
          if (prev && (prev.type === 'Line' || prev.type === 'Block') && !DIRECTIVE.test(prev.value)) {
            if (prev.loc.end.line === comment.loc.start.line - 1) {
              report('Consecutive comment lines. One line at most.')
              continue
            }
          }
          const next = sourceCode.getTokenAfter(comment, { includeComments: true })
          if (next && (next.type === 'Line' || next.type === 'Block') && !DIRECTIVE.test(next.value)) {
            if (next.loc.start.line === comment.loc.end.line + 1) {
              report('Consecutive comment lines. One line at most.')
              continue
            }
          }
          const target = next && next.type !== 'Line' && next.type !== 'Block' ? nodeStartingAt(sourceCode, next.range[0]) : null
          if (!isCommentable(target)) {
            report('Comment only goes above a function, class, interface or type, saying what it is for.')
          }
        }
      },
    }
  },
}

export default {
  meta: { name: 'house' },
  rules: {
    'no-raw-primitives': noRawPrimitives,
    'no-direct-api': noDirectApi,
    'no-parent-imports': noParentImports,
    structure,
    comments,
  },
}
