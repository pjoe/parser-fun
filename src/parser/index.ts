import { LexContext, next } from './lexer';
import { parse, ParserContext } from './parser';
import { Token } from './token';
import { compileVisitor } from './visitors/compile';
import { evalVisitor } from './visitors/eval';
import { printVisitor } from './visitors/print';

export const lex = (src: string) => {
  let i = 0;
  const getChar = (peek?: boolean) => {
    const res = i < src.length ? src[i] : null;
    if (!peek) ++i;
    return res;
  };
  const lexCtx: LexContext = { getChar, line: 1, start: 1, parenCount: 0 };
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

const parseAst = (src: string) => {
  let i = 0;
  const getChar = (peek?: boolean) => {
    const res = i < src.length ? src[i] : null;
    if (!peek) ++i;
    return res;
  };
  const lexCtx: LexContext = { getChar, line: 1, start: 1, parenCount: 0 };

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

const evaluate = (src: string): string => {
  try {
    const ast = parseAst(src);
    return evalVisitor(ast).toString();
  } catch (e) {
    return 'Error: ' + e.message;
  }
};

const compileAst = (src: string): string => {
  try {
    const ast = parseAst(src);
    return compileVisitor(ast);
  } catch (e) {
    return 'Error: ' + e.message;
  }
};

export const compile = (src: string, mode: string): string => {
  if (mode === 'lex') return lex(src);
  if (mode === 'eval') return evaluate(src);
  if (mode === 'compile') return compileAst(src);
  //return JSON.stringify(parseAst(src), undefined, 1);
  return printVisitor(parseAst(src));
};
