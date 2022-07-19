import { BinOpType, Node, UnOpType } from '../ast';
import { visitNode, VisitorContext } from '../visitor';

type ValType = 'num' | 'str' | 'bool' | 'func';
interface Func {
  fn: () => void;
  params: string[];
}
interface Val {
  type: ValType;
  val: number | string | boolean | Func;
}

type Scope = Record<string, Val>;

const num = (n: number): Val => ({ type: 'num', val: n });

const valBinOp = (op: BinOpType, a: Val, b: Val): Val => {
  if (a.type !== 'num' || b.type !== 'num')
    throw new Error(`Bad type: ${a.val} ${op} ${b.val}`);
  if (op === '+') return num((a.val as number) + (b.val as number));
  if (op === '-') return num((a.val as number) - (b.val as number));
  if (op === '*') return num((a.val as number) * (b.val as number));
  if (op === '/') return num((a.val as number) / (b.val as number));
  if (op === '**') return num(Math.pow(a.val as number, b.val as number));
  throw new Error(`Unknown BinOp: ${op}`);
};

const valUnOp = (op: UnOpType, a: Val): Val => {
  if (a.type !== 'num') throw new Error(`Bad type: ${op} ${a.val}`);
  if (op === '+') return { ...a };
  if (op === '-') return num(-(a.val as number));
  throw new Error(`Unknown UnOp: ${op}`);
};

export const evalVisitor = (n: Node): string => {
  const stack: Val[] = [];
  const scopes: Scope[] = [{}];
  const ctx: VisitorContext = {
    visitExpList: (ctx, n) => {
      let i = 0;
      while (true) {
        if (i >= n.exps.length) break;
        visitNode(ctx, n.exps[i]);
        ++i;
      }
    },
    visitIntLit: (ctx, n) => {
      stack.push(num(n.val));
    },
    visitParen: (ctx, n) => {
      visitNode(ctx, n.exp);
    },
    visitBinOp: (ctx, n) => {
      visitNode(ctx, n.left);
      visitNode(ctx, n.right);
      if (stack.length < 2) throw new Error('BinOp stack error');
      const right = stack.pop()!;
      const left = stack.pop()!;
      stack.push(valBinOp(n.op, left, right));
    },
    visitUnOp: (ctx, n) => {
      visitNode(ctx, n.exp);
      if (stack.length < 1) throw new Error('UnOp stack error');
      const right = stack.pop()!;
      stack.push(valUnOp(n.op, right));
    },
    visitVarDecl: (ctx, n) => {
      visitNode(ctx, n.exp);
      if (stack.length < 1) throw new Error('VarDecl stack error');
      const scope: Scope = scopes[scopes.length - 1];
      const val = stack.pop()!;
      scope[n.ident] = val;
      stack.push(val);
    },
    visitVarId: (ctx, n) => {
      // search through scopes
      let idx = scopes.length - 1;
      let val: Val | null = null;
      while (true) {
        if (idx < 0) break;
        val = scopes[idx][n.ident];
        if (val) break;
        --idx;
      }
      if (!val) throw new Error('Unknown var: ' + n.ident);
      stack.push(val!);
    },
    visitFuncDecl: (ctx, n) => {
      const fn = (): void => {
        visitNode(ctx, n.exp);
      };
      stack.push({ type: 'func', val: { fn, params: n.params } });
    },
    visitFuncCall: (ctx, n) => {
      visitNode(ctx, n.func);
      if (stack.length < 1) throw new Error('FuncCall stack error');
      const fnVal: Val = stack.pop()!;
      if (fnVal.type !== 'func') throw new Error('Not a function');
      const func = fnVal.val as Func;
      if (func.params.length !== n.params.length)
        throw new Error('FuncCall wrong number of params');
      const localScope: Scope = {};
      scopes.push(localScope);
      let idx = 0;
      while (true) {
        if (idx >= n.params.length) break;
        visitNode(ctx, n.params[idx]);
        if (stack.length < 1) throw new Error('FuncCall params stack error');
        const val: Val = stack.pop()!;
        localScope[func.params[idx]] = val;
        ++idx;
      }
      func.fn();
      scopes.pop();
    },
  };
  visitNode(ctx, n);
  if (stack.length < 1) throw new Error('Stack error');
  const res = stack.pop()!;
  return res.val.toString();
};
