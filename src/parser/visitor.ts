import { AstError, BinOp, ExpList, IntLit, Node, Paren, UnOp } from './ast';

export interface VisitorContext {
  visitExpList: (ctx: VisitorContext, n: ExpList) => void;
  visitIntLit: (ctx: VisitorContext, n: IntLit) => void;
  visitBinOp: (ctx: VisitorContext, n: BinOp) => void;
  visitUnOp: (ctx: VisitorContext, n: UnOp) => void;
  visitParen: (ctx: VisitorContext, n: Paren) => void;
}

export const visitNode = (ctx: VisitorContext, n: Node) => {
  if (n.type === 'ExpList') return ctx.visitExpList(ctx, n as ExpList);
  if (n.type === 'IntLit') return ctx.visitIntLit(ctx, n as IntLit);
  if (n.type === 'BinOp') return ctx.visitBinOp(ctx, n as BinOp);
  if (n.type === 'UnOp') return ctx.visitUnOp(ctx, n as UnOp);
  if (n.type === 'Paren') return ctx.visitParen(ctx, n as Paren);
  if (n.type === 'Error') throw new Error((n as AstError).msg);
  throw new Error(`Unknown node: ${n.type}`);
};
