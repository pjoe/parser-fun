import { any, anyChar, many, many1, map, optional, seq, str } from './combis';
import { Context, err, Err, ok, Ok, Parser } from './types';

const whitespace = anyChar(' \t\r');

const spaces = map(many1(whitespace, 'space'), () => ' ');

const letter = anyChar('abcdefghijklmonpqrstuvwxyzABCDEFGHIJKLMONPQRSTUVWXYZ');

const digit = anyChar('0123456789');

const join = (strs: string[]) => strs.join('');
const manyStrs = (parser: Parser<string>): Parser<string> =>
  map(many(parser), join);

const _ident = map(seq(letter, manyStrs(any(letter, digit))), join);

const token = <T>(parser: Parser<T>): Parser<T> =>
  map(seq<T | string[]>(parser, many(whitespace)), (val) => val[0] as T);

const tokenStr = (match: string): Parser<string> => token(str(match));

const ident = token(_ident);

const parseThisIsFun = seq<string>(
  ident,
  tokenStr('='),
  token(map(many1(digit, 'digit'), join))
);

export const combi = (src: string): string => {
  const ctx = { src, index: 0 };

  const res = parseThisIsFun(ctx);
  return JSON.stringify(res, undefined, 1);
};
