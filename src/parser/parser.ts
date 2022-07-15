import {
  Node,
  AstError,
  IntLit,
  Exp,
  BinOpType,
  BinOp,
  Paren,
  UnOpType,
  UnOp,
  ExpList,
} from './ast';
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

// PrimaryExp ::= IntLit | '(' Exp ')'
const parsePrimaryExp = (ctx: ParserContext): Exp => {
  const t = peek(ctx);
  if (t.type === 'IntConst') {
    return parseIntLit(ctx);
  } else {
    expect(ctx, 'LParen');
    const exp = parseExp(ctx);
    expect(ctx, 'RParen');
    const paren: Paren = { type: 'Paren', exp };
    return paren;
  }
};

// PowerExp ::= PrimaryExp ['**' UnaryExp]
const parsePowerExp = (ctx: ParserContext): Exp => {
  const left = parsePrimaryExp(ctx);
  const t = peek(ctx);
  if (t.type !== 'Power') return left;
  next(ctx);
  const right = parseUnaryExp(ctx);
  const binop: BinOp = { type: 'BinOp', op: '**', left, right };
  return binop;
};

// UnaryExp ::= PowerExp | ('-' | '+') UnaryExp
const parseUnaryExp = (ctx: ParserContext): Exp => {
  const t = peek(ctx);
  let op: UnOpType;
  if (t.type === 'Dash') op = '-';
  else if (t.type === 'Plus') op = '+';
  else return parsePowerExp(ctx);
  next(ctx);
  const exp = parsePowerExp(ctx);
  const unop: UnOp = { type: 'UnOp', op, exp };
  return unop;
};

// MulExp ::= UnaryExp {('*' | '/') UnaryExp}
const parseMulExp = (ctx: ParserContext): Exp => {
  let e: Exp = parseUnaryExp(ctx);
  let t = peek(ctx);
  while (true) {
    let op: BinOpType;
    if (t.type === 'Star') op = '*';
    else if (t.type === 'Slash') op = '/';
    else break;
    next(ctx);
    const right = parseUnaryExp(ctx);
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

// ExpList ::= Exp { 'NEWLINE' Exp}
const parseExpList = (ctx: ParserContext): ExpList => {
  const exps: Exp[] = [parseAddExp(ctx)];
  let t = peek(ctx);
  while (t.type === 'NEWLINE') {
    next(ctx);
    exps.push(parseAddExp(ctx));
    t = peek(ctx);
  }
  return { type: 'ExpList', exps };
};

export const parse = (ctx: ParserContext): Node => {
  try {
    const n = parseExpList(ctx);
    expect(ctx, 'EOF');
    return n;
  } catch (e) {
    const err: AstError = { type: 'Error', msg: e.message };
    return err;
  }
};
