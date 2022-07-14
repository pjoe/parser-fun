export type NodeType = 'Error' | 'IntLit' | 'BinOp';

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
