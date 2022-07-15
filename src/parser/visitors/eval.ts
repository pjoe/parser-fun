import { Node } from '../ast';
import { visitNode, VisitorContext } from '../visitor';

export const evalVisitor = (n: Node): number => {
  const stack: number[] = [];
  const ctx: VisitorContext = {
    visitExpList: (ctx, n) => {
      let i = 0;
      while (true) {
        if (i >= n.exps.length) break;
        visitNode(ctx, n.exps[i]);
        ++i;
      }
    },
    visitIntLit: (ctx, n) => {
      stack.push(n.val);
    },
    visitParen: (ctx, n) => {
      visitNode(ctx, n.exp);
    },
    visitBinOp: (ctx, n) => {
      visitNode(ctx, n.left);
      visitNode(ctx, n.right);
      if (stack.length < 2) throw new Error('BinOp stack error');
      const right = stack.pop()!;
      const left = stack.pop()!;
      let res: number;
      if (n.op === '+') res = left + right;
      else if (n.op === '-') res = left - right;
      else if (n.op === '*') res = left * right;
      else if (n.op === '/') res = left / right;
      else if (n.op === '**') res = Math.pow(left, right);
      else throw new Error(`Unknown BinOp: ${n.op}`);
      stack.push(res);
    },
    visitUnOp: (ctx, n) => {
      visitNode(ctx, n.exp);
      if (stack.length < 1) throw new Error('UnOp stack error');
      const right = stack.pop()!;
      let res: number;
      if (n.op === '+') res = right;
      else if (n.op === '-') res = -right;
      else throw new Error(`Unknown UnOp: ${n.op}`);
      stack.push(res);
    },
  };
  visitNode(ctx, n);
  if (stack.length < 1) throw new Error('Stack error');
  return stack.pop()!;
};
