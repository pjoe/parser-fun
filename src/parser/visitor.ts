import {
  AstError,
  BinOp,
  ExpList,
  IntLit,
  Node,
  Paren,
  UnOp,
  VarDecl,
  VarId,
} from './ast';

export interface VisitorContext {
  visitExpList: (ctx: VisitorContext, n: ExpList) => void;
  visitIntLit: (ctx: VisitorContext, n: IntLit) => void;
  visitBinOp: (ctx: VisitorContext, n: BinOp) => void;
  visitUnOp: (ctx: VisitorContext, n: UnOp) => void;
  visitParen: (ctx: VisitorContext, n: Paren) => void;
  visitVarDecl: (ctx: VisitorContext, n: VarDecl) => void;
  visitVarId: (ctx: VisitorContext, n: VarId) => void;
}

export const visitNode = (ctx: VisitorContext, n: Node) => {
  if (n.type === 'ExpList') return ctx.visitExpList(ctx, n as ExpList);
  if (n.type === 'IntLit') return ctx.visitIntLit(ctx, n as IntLit);
  if (n.type === 'BinOp') return ctx.visitBinOp(ctx, n as BinOp);
  if (n.type === 'UnOp') return ctx.visitUnOp(ctx, n as UnOp);
  if (n.type === 'Paren') return ctx.visitParen(ctx, n as Paren);
  if (n.type === 'VarDecl') return ctx.visitVarDecl(ctx, n as VarDecl);
  if (n.type === 'VarId') return ctx.visitVarId(ctx, n as VarId);
  if (n.type === 'Error') throw new Error((n as AstError).msg);
  throw new Error(`Unknown node: ${n.type}`);
};
