export type Parser<T> = (ctx: Context) => Result<T>;

export type Context = Readonly<{
  src: string;
  index: number;
}>;

export type Result<T> = Ok<T> | Err;

export type Ok<T> = Readonly<{
  isOk: true;
  val: T;
  ctx: Context;
}>;

export type Err = Readonly<{
  isOk: false;
  msg: string;
  ctx: Context;
}>;

export const ok = <T>(ctx: Context, val: T): Ok<T> => {
  return { isOk: true, val, ctx };
};

export const err = (ctx: Context, msg: string): Err => {
  return { isOk: false, msg, ctx };
};
