export type NodeType = 'Error' | 'IntLit' | 'BinOp' | 'UnOp' | 'Paren';

export interface Node {
  type: NodeType;
}

export interface AstError extends Node {
  msg: string;
}

export interface Exp extends Node {}

export interface IntLit extends Exp {
  val: number;
}

export type BinOpType = '+' | '-' | '*' | '/';
export interface BinOp extends Exp {
  op: BinOpType;
  left: Exp;
  right: Exp;
}
export type UnOpType = '+' | '-';
export interface UnOp extends Exp {
  op: UnOpType;
  exp: Exp;
}

export interface Paren extends Exp {
  exp: Exp;
}
