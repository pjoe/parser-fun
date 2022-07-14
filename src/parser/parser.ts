import { Node, AstError, IntLit, Exp, BinOpType, BinOp } from './ast';
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

// ParenExp ::= ( '(' Exp ')' ) | IntLit
const parseParenExp = (ctx: ParserContext): Exp => {
  const t = peek(ctx);
  if (t.type === 'LParen') {
    next(ctx);
    const e = parseExp(ctx);
    expect(ctx, 'RParen');
    return e;
  } else {
    return parseIntLit(ctx);
  }
};

// MulExp ::= ParenExp {('*' | '/') ParenExp}
const parseMulExp = (ctx: ParserContext): Exp => {
  let e: Exp = parseParenExp(ctx);
  let t = peek(ctx);
  while (true) {
    let op: BinOpType;
    if (t.type === 'Star') op = '*';
    else if (t.type === 'Slash') op = '/';
    else break;
    next(ctx);
    const right = parseParenExp(ctx);
    const binop: BinOp = { type: 'BinOp', op, left: e, right };
    e = binop;
    t = peek(ctx);
  }
  return e;
};

// AddExp ::= MulExp {('+' | '-' ) MulExp}
const parseAddExp = (ctx: ParserContext): Exp => {
  let e: Exp = parseMulExp(ctx);
  let t = peek(ctx);
  while (true) {
    let op: BinOpType;
    if (t.type === 'Plus') op = '+';
    else if (t.type === 'Dash') op = '-';
    else break;
    next(ctx);
    const right = parseMulExp(ctx);
    const binop: BinOp = { type: 'BinOp', op, left: e, right };
    e = binop;
    t = peek(ctx);
  }
  return e;
};

// Exp ::= AddExp
const parseExp = (ctx: ParserContext): Exp => parseAddExp(ctx);

export const parse = (ctx: ParserContext): Node => {
  try {
    const n = parseExp(ctx);
    expect(ctx, 'EOF');
    return n;
  } catch (e) {
    const err: AstError = { type: 'Error', msg: e.message };
    return err;
  }
};
