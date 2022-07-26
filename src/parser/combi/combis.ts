import { Context, err, Err, ok, Ok, Parser, Result } from './types';

export const str =
  (match: string): Parser<string> =>
  (ctx) => {
    const endIdx = ctx.index + match.length;
    if (ctx.src.substring(ctx.index, endIdx) === match) {
      return ok({ ...ctx, index: endIdx }, match);
    } else {
      return err(ctx, `Expected: '${match}'`);
    }
  };

export const anyChar =
  (chars: string): Parser<string> =>
  (ctx) => {
    const ch = ctx.src[ctx.index];
    if (chars.indexOf(ch) >= 0) {
      return ok({ ...ctx, index: ctx.index + 1 }, ch);
    } else {
      return err(ctx, `Expected one of: '${chars}'`);
    }
  };

export const seq =
  <T>(...parsers: Parser<T>[]): Parser<T[]> =>
  (ctx) => {
    let values: T[] = [];
    let nextCtx = ctx;
    for (const parser of parsers) {
      const res = parser(nextCtx);
      if (!res.isOk) return res;
      values.push(res.val);
      nextCtx = res.ctx;
    }
    return ok(nextCtx, values);
  };

export const any =
  <T>(...parsers: Parser<T>[]): Parser<T> =>
  (ctx) => {
    let furthestRes: Result<T> | null = null;
    for (const parser of parsers) {
      const res = parser(ctx);
      if (res.isOk) return res;
      if (!furthestRes || furthestRes.ctx.index < res.ctx.index)
        furthestRes = res;
    }
    return furthestRes!;
  };

export const optional = <T>(parser: Parser<T>): Parser<T | null> =>
  any(parser, (ctx) => ok(ctx, null));

export const many =
  <T>(parser: Parser<T>): Parser<T[]> =>
  (ctx) => {
    let values: T[] = [];
    let nextCtx = ctx;
    while (true) {
      const res = parser(nextCtx);
      if (!res.isOk) break;
      values.push(res.val);
      nextCtx = res.ctx;
    }
    return ok(nextCtx, values);
  };

export const many1 =
  <T>(parser: Parser<T>, name: string): Parser<T[]> =>
  (ctx) => {
    let values: T[] = [];
    let nextCtx = ctx;
    while (true) {
      const res = parser(nextCtx);
      if (!res.isOk) {
        if (values.length > 0) break;
        return err(nextCtx, `Expected at least one ${name}`);
      }
      values.push(res.val);
      nextCtx = res.ctx;
    }
    return ok(nextCtx, values);
  };

export const map =
  <A, B>(parser: Parser<A>, fn: (val: A) => B): Parser<B> =>
  (ctx) => {
    const res = parser(ctx);
    return res.isOk ? ok(res.ctx, fn(res.val)) : res;
  };
