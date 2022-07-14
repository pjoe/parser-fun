import { LexContext, next } from './lexer';
import { Token } from './token';

const lexDebug = (src: string) => {
  let i = 0;
  const getChar = (peek?: boolean) => {
    const res = i < src.length ? src[i] : null;
    if (!peek) ++i;
    return res;
  };
  const res: Token[] = [];
  const ctx: LexContext = { getChar, line: 1, start: 1 };
  while (true) {
    const t = next(ctx);
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

export const parse = (src: string) => {
  return lexDebug(src);
};
