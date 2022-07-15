import { Node } from '../ast';
import { visitNode, VisitorContext } from '../visitor';

export const printVisitor = (n: Node): string => {
  const out: string[] = [];
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
  const ctx: VisitorContext = {
    visitExpList: (ctx, n) => {
      add('ExpList');
      ++level;
      let i = 0;
      while (true) {
        if (i >= n.exps.length) break;
        visitNode(ctx, n.exps[i]);
        ++i;
      }
      --level;
    },
    visitIntLit: (ctx, n) => add('IntLit ' + n.val.toString()),
    visitParen: (ctx, n) => {
      add('Paren');
      ++level;
      visitNode(ctx, n.exp);
      --level;
    },
    visitBinOp: (ctx, n) => {
      add('BinOp ' + n.op);
      ++level;
      visitNode(ctx, n.left);
      visitNode(ctx, n.right);
      --level;
    },
    visitUnOp: (ctx, n) => {
      add('UnOp ' + n.op);
      ++level;
      visitNode(ctx, n.exp);
      --level;
    },
    visitVarDecl: (ctx, n) => {
      add('VarDecl ' + n.ident);
      ++level;
      visitNode(ctx, n.exp);
      --level;
    },
    visitVarId: (ctx, n) => {
      add('VarId ' + n.ident);
    },
  };
  visitNode(ctx, n);
  return out.join('\n');
};
