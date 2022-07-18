import {
  GetCharFn,
  LexContext,
  makeContext as _makeContext,
  next as _next,
} from './lexer';
import { Token } from './token';

// workaround to detect functions vs. experession:
//  (x) => x + x
//    or
//  (x) + x
//
// inserts Func token before LParen

export interface FuncLexContext extends LexContext {
  lookahead: Token[];
  funcParen: Token | null;
}

export const makeContext = (getChar: GetCharFn): FuncLexContext => ({
  ..._makeContext(getChar),
  lookahead: [],
  funcParen: null,
});

export const next = (ctx: FuncLexContext): Token => {
  let t: Token;
  if (ctx.funcParen) {
    t = ctx.funcParen;
    ctx.funcParen = null;
    return t;
  }
  if (ctx.lookahead.length > 0) t = ctx.lookahead.shift()!;
  else t = _next(ctx);
  if (t.type === 'LParen') {
    let parenCount = 1;
    let bufPos = 0;
    const bufLen = ctx.lookahead.length;
    let rParenMatch = false;
    while (true) {
      let t2: Token;
      if (bufPos < bufLen) {
        t2 = ctx.lookahead[bufPos];
        ++bufPos;
      } else {
        t2 = _next(ctx);
        ctx.lookahead.push(t2);
      }
      if (t2.type === 'EOF') break;
      if (rParenMatch) {
        if (t2.type === 'Arrow' && rParenMatch) {
          ctx.funcParen = t;
          return {
            type: 'Func',
            pos: {
              line: t.pos.line,
              start: t.pos.start,
              end: t.pos.end,
            },
          };
        } else break;
      }
      rParenMatch = false;
      if (t2.type === 'LParen') {
        ++parenCount;
      } else if (t2.type === 'RParen') {
        --parenCount;
        if (parenCount === 0) {
          rParenMatch = true;
        }
      }
    }
  }
  return t;
};
