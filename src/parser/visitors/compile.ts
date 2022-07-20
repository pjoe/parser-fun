import { Node, Paren } from '../ast';
import { visitNode, VisitorContext } from '../visitor';

type ScopeType = 'global' | 'func' | 'block';
interface Scope {
  type: ScopeType;
}

export const compileVisitor = (n: Node): string => {
  const out: string[] = [];
  const scopes: Scope[] = [{ type: 'global' }];
  let level = 0;
  const add = (str: string) => {
    let res = '';
    let i = level;
    while (true) {
      if (i <= 0) break;
      res += ' ';
      --i;
    }
    res += str;
    out.push(res);
  };

  const removeParen = (n: Node): Node => {
    if (n.type === 'Paren') return (n as Paren).exp;
    return n;
  };
  const ctx: VisitorContext = {
    visitExpList: (ctx, n) => {
      const scope: Scope = scopes[scopes.length - 1];
      if (scope.type !== 'global') {
        out.push('{\n');
        ++level;
      }

      let i = 0;
      while (true) {
        if (i >= n.exps.length) break;

        // last exp
        if (i == n.exps.length - 1) {
          if (scope.type === 'func') {
            add('return ');
          }
        } else {
          add(''); // indent
        }
        visitNode(ctx, n.exps[i]);
        ++i;
        out.push(';\n');
      }

      if (scope.type !== 'global') {
        --level;
        add('}');
      }
    },
    visitIntLit: (ctx, n) => out.push(n.val.toString()),
    visitParen: (ctx, n) => {
      out.push('(');
      visitNode(ctx, n.exp);
      out.push(')');
    },
    visitBinOp: (ctx, n) => {
      if (n.op === '**') {
        out.push('Math.pow(');
        visitNode(ctx, removeParen(n.left));
        out.push(',');
        visitNode(ctx, removeParen(n.right));
        out.push(')');
      } else {
        visitNode(ctx, n.left);
        out.push(n.op);
        visitNode(ctx, n.right);
      }
    },
    visitUnOp: (ctx, n) => {
      if (n.op !== '+') out.push(n.op);
      visitNode(ctx, n.exp);
    },
    visitVarDecl: (ctx, n) => {
      out.push('let ');
      out.push(n.ident);
      out.push(' = ');
      visitNode(ctx, n.exp);
    },
    visitVarId: (ctx, n) => {
      out.push(n.ident);
    },
    visitFuncDecl: (ctx, n) => {
      out.push('(');
      out.push(n.params.join(', '));
      out.push(') => ');
      scopes.push({ type: 'func' });
      visitNode(ctx, n.exp);
      scopes.pop();
    },
    visitFuncCall: (ctx, n) => {
      visitNode(ctx, n.func);
      out.push('(');
      let idx = 0;
      while (idx < n.params.length) {
        if (idx > 0) out.push(', ');
        visitNode(ctx, n.params[idx]);
        ++idx;
      }
      out.push(')');
    },
  };
  visitNode(ctx, n);
  const noEmptyLines = out
    .join('')
    .split('\n')
    .filter((l) => l !== ';');
  return noEmptyLines.join('\n');
};
