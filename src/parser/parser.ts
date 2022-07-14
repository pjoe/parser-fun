import { Node, AstError, IntLit } from './ast';
import { Token, TokenType } from './token';

export type GetTokenFn = (peek?: boolean) => Token;

export interface ParserContext {
  getToken: GetTokenFn;
}

const next = (ctx: ParserContext) => ctx.getToken();
const peek = (ctx: ParserContext) => ctx.getToken(true);
const expect = (ctx: ParserContext, type: TokenType) => {
  const t = peek(ctx);
  if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type}`);
  return next(ctx);
};

const parseIntLit = (ctx: ParserContext): IntLit => {
  const t = expect(ctx, 'IntConst');
  return { type: 'IntLit', val: t.value as number };
};

export const parse = (ctx: ParserContext): Node => {
  try {
    const n = parseIntLit(ctx);
    expect(ctx, 'EOF');
    return n;
  } catch (e) {
    const err: AstError = { type: 'Error', msg: e.message };
    return err;
  }
};
