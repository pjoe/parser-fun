import { AstError, BinOp, IntLit, Node, Paren, UnOp } from './ast';

export abstract class AstVisitor<T> {
  visit(n: Node): T {
    if (n.type === 'IntLit') return this.visitIntLit(n as IntLit);
    if (n.type === 'BinOp') return this.visitBinOp(n as BinOp);
    if (n.type === 'Paren') return this.visitParen(n as Paren);
    throw new Error(`Unknown node: ${n.type}`);
  }
  abstract visitIntLit(n: IntLit): T;
  abstract visitBinOp(n: BinOp): T;
  abstract visitParen(n: Paren): T;
}

export class EvalVisitor extends AstVisitor<number> {
  visitIntLit(n: IntLit): number {
    return n.val;
  }
  visitBinOp(n: BinOp): number {
    const left = this.visit(n.left);
    const right = this.visit(n.right);
    if (n.op === '+') return left + right;
    if (n.op === '-') return left - right;
    if (n.op === '*') return left * right;
    if (n.op === '/') return left / right;
    throw new Error(`Unknown BinOp: ${n.op}`);
  }
  visitParen(n: Paren): number {
    return this.visit(n.exp);
  }
}

export interface VisitorContext {
  visitIntLit: (ctx: VisitorContext, n: IntLit) => void;
  visitBinOp: (ctx: VisitorContext, n: BinOp) => void;
  visitUnOp: (ctx: VisitorContext, n: UnOp) => void;
  visitParen: (ctx: VisitorContext, n: Paren) => void;
}

export const visitNode = (ctx: VisitorContext, n: Node) => {
  if (n.type === 'IntLit') return ctx.visitIntLit(ctx, n as IntLit);
  if (n.type === 'BinOp') return ctx.visitBinOp(ctx, n as BinOp);
  if (n.type === 'UnOp') return ctx.visitUnOp(ctx, n as UnOp);
  if (n.type === 'Paren') return ctx.visitParen(ctx, n as Paren);
  if (n.type === 'Error') throw new Error((n as AstError).msg);
  throw new Error(`Unknown node: ${n.type}`);
};

export const evalVisitor = (n: Node): number => {
  const stack: number[] = [];
  const ctx: VisitorContext = {
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
  return stack[0];
};

export const compileVisitor = (n: Node): string => {
  const out: string[] = [];
  const removeParen = (n: Node): Node => {
    if (n.type === 'Paren') return (n as Paren).exp;
    return n;
  };
  const ctx: VisitorContext = {
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
