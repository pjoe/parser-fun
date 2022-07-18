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
}

export const makeContext = (getChar: GetCharFn): FuncLexContext => ({
  ..._makeContext(getChar),
  lookahead: [],
});

export const next = (ctx: FuncLexContext): Token => {
  let t: Token;
  if (ctx.lookahead.length > 0) t = ctx.lookahead.shift()!;
  else t = _next(ctx);
  if (t.type === 'LParen') {
    const p = ctx.parenCount;
    while (true) {
      let t2: Token;
      if (ctx.lookahead.length > 0) t2 = ctx.lookahead.shift()!;
      else t2 = _next(ctx);
      if (t2.type === 'EOF') break;
      ctx.lookahead.push(t2);
      if (t2.type === 'RParen' && ctx.parenCount === p - 1) {
        ctx.lookahead.unshift(t);
        return {
          type: 'Func',
          pos: {
            line: t.pos.line,
            start: t.pos.start,
            end: t.pos.end,
          },
        };
      }
    }
  }
  return t;
};
