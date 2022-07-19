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
  VarDecl,
  VarId,
  FuncDecl,
  FuncCall,
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

// VarId ::= 'Ident'
const parseVarId = (ctx: ParserContext): VarId => {
  const t = expect(ctx, 'Ident');
  return { type: 'VarId', ident: t.value as string };
};

// PrimaryExp ::= VarId | IntLit | '(' Exp ')'
const parsePrimaryExp = (ctx: ParserContext): Exp => {
  const t = peek(ctx);
  if (t.type === 'Ident') return parseVarId(ctx);
  if (t.type === 'IntConst') return parseIntLit(ctx);
  expect(ctx, 'LParen');
  const exp = parseExp(ctx);
  expect(ctx, 'RParen');
  const paren: Paren = { type: 'Paren', exp };
  return paren;
};

// PostfixExpr ::= PrimaryExp
//  [
//    '(' [ Exp { 'Comma' Exp } ] ')'
//  ]
const parsePostfixExpr = (ctx: ParserContext): Exp => {
  let exp = parsePrimaryExp(ctx);
  let t = peek(ctx);
  if (t.type === 'LParen') {
    next(ctx);
    const params: Exp[] = [];
    t = peek(ctx);
    if (t.type !== 'RParen') {
      params.push(parseExp(ctx));
      while (true) {
        t = peek(ctx);
        if (t.type !== 'Comma') break;
        next(ctx);
        params.push(parseExp(ctx));
      }
    }
    expect(ctx, 'RParen');
    const funcCall: FuncCall = { type: 'FuncCall', func: exp, params };
    return funcCall;
  }
  return exp;
};

// PowerExp ::= PrimaryExp ['**' UnaryExp]
const parsePowerExp = (ctx: ParserContext): Exp => {
  const left = parsePostfixExpr(ctx);
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

// VarDecl ::= 'Let' 'Ident' '=' Exp
const parseVarDecl = (ctx: ParserContext): VarDecl => {
  expect(ctx, 'Let');
  const ident = expect(ctx, 'Ident').value as string;
  expect(ctx, 'Assign');
  const exp = parseExp(ctx);
  return { type: 'VarDecl', ident, exp };
};

// ArgList ::= [ 'Ident' { 'Comma', Ident} ]
const parseArgList = (ctx: ParserContext): string[] => {
  const args: string[] = [];
  const t = peek(ctx);
  if (t.type !== 'Ident') return args;
  args.push(next(ctx).value as string);
  while (true) {
    const t = peek(ctx);
    if (t.type !== 'Comma') break;
    next(ctx);
    const ident = expect(ctx, 'Ident').value as string;
    args.push(ident);
  }
  return args;
};

// FuncDecl ::= 'Func' 'LParen' ArgList 'RParen' 'Arrow' Exp
const parseFuncDecl = (ctx: ParserContext): FuncDecl => {
  expect(ctx, 'Func');
  expect(ctx, 'LParen');

  const params = parseArgList(ctx);

  expect(ctx, 'RParen');
  expect(ctx, 'Arrow');

  const exp = parseExp(ctx);
  return { type: 'FuncDecl', exp, params };
};

// Exp ::= FuncDecl | VarDecl | AddExp
const parseExp = (ctx: ParserContext): Exp => {
  const t = peek(ctx);
  if (t.type === 'Func') return parseFuncDecl(ctx);
  if (t.type === 'Let') return parseVarDecl(ctx);
  return parseAddExp(ctx);
};

// ExpList ::= Exp { 'NEWLINE' { 'NEWLINE' } Exp}
const parseExpList = (ctx: ParserContext): ExpList => {
  const exps: Exp[] = [parseExp(ctx)];
  let t = peek(ctx);
  while (t.type === 'NEWLINE') {
    next(ctx);
    t = peek(ctx);
    if (t.type === 'NEWLINE') continue;
    if (t.type === 'EOF') break;
    exps.push(parseExp(ctx));
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
