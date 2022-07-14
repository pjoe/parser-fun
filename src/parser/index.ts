import { LexContext, next } from './lexer';
import { parse, ParserContext } from './parser';
import { Token } from './token';

const lexDebug = (src: string) => {
  let i = 0;
  const getChar = (peek?: boolean) => {
    const res = i < src.length ? src[i] : null;
    if (!peek) ++i;
    return res;
  };
  const lexCtx: LexContext = { getChar, line: 1, start: 1 };
  const res: Token[] = [];

  while (true) {
    const t = next(lexCtx);
    if (t.type === 'EOF') break;
    res.push(t);
  }
  return res
    .map(
      (t) =>
        `${t.type}: ${t.value ?? ''} ln ${t.pos.line} (${t.pos.start}:${
          t.pos.end
        })`
    )
    .join('\n');
};

const _parse = (src: string) => {
  let i = 0;
  const getChar = (peek?: boolean) => {
    const res = i < src.length ? src[i] : null;
    if (!peek) ++i;
    return res;
  };
  const lexCtx: LexContext = { getChar, line: 1, start: 1 };

  let token = next(lexCtx);
  const getToken = (peek?: boolean): Token => {
    if (peek) return token;
    const cur = token;
    token = next(lexCtx);
    return cur;
  };
  const parserCtx: ParserContext = { getToken };
  return parse(parserCtx);
};

export const compile = (src: string) => {
  //return lexDebug(src);
  return JSON.stringify(_parse(src), undefined, 1);
};
