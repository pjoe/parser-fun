import { Node, Paren } from '../ast';
import { visitNode, VisitorContext } from '../visitor';

export const compileVisitor = (n: Node): string => {
  const out: string[] = [];
  const removeParen = (n: Node): Node => {
    if (n.type === 'Paren') return (n as Paren).exp;
    return n;
  };
  const ctx: VisitorContext = {
    visitExpList: (ctx, n) => {
      let i = 0;
      while (true) {
        if (i >= n.exps.length) break;
        visitNode(ctx, n.exps[i]);
        ++i;
        out.push(';\n');
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
  };
  visitNode(ctx, n);
  return out.join('');
};
