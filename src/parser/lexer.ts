import { TokenType, Token, TokenValue } from './token';

export type GetCharFn = (peek?: boolean) => string | null;

export interface LexContext {
  line: number;
  start: number;
  parenCount: number;
  getChar: GetCharFn;
}

export const makeContext = (getChar: GetCharFn): LexContext => ({
  getChar,
  line: 1,
  start: 1,
  parenCount: 0,
});

const makeToken = (
  ctx: LexContext,
  type: TokenType,
  len: number,
  value?: TokenValue
): Token => {
  const end = ctx.start + len;
  const start = ctx.start;
  ctx.start += len;
  return {
    type,
    value,
    pos: { line: ctx.line, start, end },
  };
};

const consumeFloat = (ctx: LexContext, str: string): Token => {
  let hasExp = false;
  let afterExp = false;
  while (true) {
    const ch2 = ctx.getChar(true);
    if (!ch2) break;

    if ((ch2 === 'e' || ch2 === 'E') && !hasExp) {
      hasExp = true;
      afterExp = true;
      ctx.getChar(); // consume the char
      str += ch2;
      continue;
    }

    if (afterExp) {
      afterExp = false;
      if (ch2 === '-') {
        ctx.getChar(); // consume the char
        str += ch2;
        continue;
      }
    }
    if (ch2 < '0' || ch2 > '9') break;

    ctx.getChar(); // consume the char
    str += ch2;
  }
  if (str === '.') {
    return makeToken(ctx, 'Dot', 1);
  }
  return makeToken(ctx, 'FloatConst', str.length, parseFloat(str));
};

const consumeNumber = (ctx: LexContext, ch1: string): Token => {
  if (ch1 === '.') {
    return consumeFloat(ctx, ch1);
  }
  let str = ch1;
  let base = 10;
  while (true) {
    const ch2 = ctx.getChar(true);
    if (!ch2) break;
    if (str === '0') {
      if (ch2 === 'x' || ch2 === 'X') {
        // hex
        base = 16;
        ctx.getChar(); // consume the char
        str += ch2;
        continue;
      } else if (ch2 !== '.') {
        // octal
        base = 8;
      }
    }
    if (base === 10) {
      if (ch2 === '.') {
        ctx.getChar(); // consume the char
        str += ch2;
        return consumeFloat(ctx, str);
      }
      if (ch2 < '0' || ch2 > '9') break;
    } else if (base === 8) {
      if (ch2 < '0' || ch2 > '8') break;
    } else if (base === 16) {
      if (
        !(ch2 >= '0' && ch2 <= '9') &&
        !(ch2 >= 'a' && ch2 <= 'f') &&
        !(ch2 >= 'A' && ch2 <= 'F')
      )
        break;
    }
    ctx.getChar(); // consume the char
    str += ch2;
  }
  return makeToken(ctx, 'IntConst', str.length, parseInt(str, base));
};

const consumeIdentOrKeyword = (ctx: LexContext, ch1: string): Token => {
  let str = ch1;
  while (true) {
    const ch2 = ctx.getChar(true);
    if (!ch2) break;
    if (
      !(ch2 >= '0' && ch2 <= '9') &&
      !(ch2 >= 'a' && ch2 <= 'z') &&
      !(ch2 >= 'A' && ch2 <= 'Z')
    )
      break;
    ctx.getChar(); // consume the char
    str += ch2;
  }
  if (str === 'fn') return makeToken(ctx, 'Func', str.length);
  if (str === 'if') return makeToken(ctx, 'If', str.length);
  if (str === 'else') return makeToken(ctx, 'Else', str.length);
  if (str === 'break') return makeToken(ctx, 'Break', str.length);
  if (str === 'continue') return makeToken(ctx, 'Continue', str.length);
  if (str === 'while') return makeToken(ctx, 'While', str.length);
  if (str === 'let') return makeToken(ctx, 'Let', str.length);
  if (str === 'return') return makeToken(ctx, 'Return', str.length);
  if (str === 'true') return makeToken(ctx, 'BoolConst', str.length, true);
  if (str === 'false') return makeToken(ctx, 'BoolConst', str.length, false);
  return makeToken(ctx, 'Ident', str.length, str);
};

export const next = (ctx: LexContext): Token => {
  while (true) {
    const ch1 = ctx.getChar();
    if (ch1 === null) return makeToken(ctx, 'EOF', 0);

    if ((ch1 >= '0' && ch1 <= '9') || ch1 === '.')
      return consumeNumber(ctx, ch1);

    if ((ch1 >= 'a' && ch1 <= 'z') || (ch1 >= 'A' && ch1 <= 'Z') || ch1 === '_')
      return consumeIdentOrKeyword(ctx, ch1);

    switch (ch1) {
      // whitespace
      case ' ':
      case '\t':
      case '\r':
        continue;
      case '\n':
        const pos = {
          line: ctx.line,
          start: ctx.start,
          end: ctx.start,
        };
        ++ctx.line;
        ctx.start = 1;
        if (ctx.parenCount === 0) return { type: 'NEWLINE', pos };
        continue;
      // paren
      case '(':
        ++ctx.parenCount;
        return makeToken(ctx, 'LParen', 1);
      case ')':
        --ctx.parenCount;
        return makeToken(ctx, 'RParen', 1);
      case '[':
        return makeToken(ctx, 'LBracket', 1);
      case ']':
        return makeToken(ctx, 'RBracket', 1);
      case '{':
        return makeToken(ctx, 'LBrace', 1);
      case '}':
        return makeToken(ctx, 'RBrace', 1);
      case '<': {
        const ch2 = ctx.getChar(true);
        switch (ch2) {
          case '=':
            ctx.getChar();
            return makeToken(ctx, 'LessEqual', 2);

          default:
            return makeToken(ctx, 'LAngle', 1);
        }
      }
      case '>': {
        const ch2 = ctx.getChar(true);
        switch (ch2) {
          case '=':
            ctx.getChar();
            return makeToken(ctx, 'GreaterEqual', 2);

          default:
            return makeToken(ctx, 'RAngle', 1);
        }
      }

      case ',':
        return makeToken(ctx, 'Comma', 1);
      case "'":
        return makeToken(ctx, 'Quote', 1);
      case ':':
        return makeToken(ctx, 'Colon', 1);
      case ';':
        return makeToken(ctx, 'Semicolon', 1);

      case '+': {
        const ch2 = ctx.getChar(true);
        switch (ch2) {
          case '+':
            ctx.getChar();
            return makeToken(ctx, 'Inc', 2);
          case '=':
            ctx.getChar();
            return makeToken(ctx, 'AddAssign', 2);

          default:
            return makeToken(ctx, 'Plus', 1);
        }
      }
      case '-': {
        const ch2 = ctx.getChar(true);
        switch (ch2) {
          case '-':
            ctx.getChar();
            return makeToken(ctx, 'Dec', 2);
          case '=':
            ctx.getChar();
            return makeToken(ctx, 'SubAssign', 2);

          default:
            return makeToken(ctx, 'Dash', 1);
        }
      }
      case '*': {
        const ch2 = ctx.getChar(true);
        switch (ch2) {
          case '*':
            ctx.getChar();
            return makeToken(ctx, 'Power', 2);
          case '=':
            ctx.getChar();
            return makeToken(ctx, 'MulAssign', 2);

          default:
            return makeToken(ctx, 'Star', 1);
        }
      }
      case '/': {
        const ch2 = ctx.getChar(true);
        switch (ch2) {
          case '=':
            ctx.getChar();
            return makeToken(ctx, 'DivAssign', 2);

          default:
            return makeToken(ctx, 'Slash', 1);
        }
      }
      case '=': {
        const ch2 = ctx.getChar(true);
        switch (ch2) {
          case '>':
            ctx.getChar();
            return makeToken(ctx, 'Arrow', 2);
          case '=':
            ctx.getChar();
            return makeToken(ctx, 'Equal', 2);
          default:
            return makeToken(ctx, 'Assign', 1);
        }
      }
    }
    return makeToken(ctx, 'Unknown', 1, ch1);
  }
};
