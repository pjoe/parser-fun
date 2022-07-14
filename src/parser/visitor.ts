import { BinOp, IntLit, Node, Paren } from './ast';

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
