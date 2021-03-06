export type NodeType =
  | 'Error'
  | 'ExpList'
  | 'IntLit'
  | 'BinOp'
  | 'UnOp'
  | 'Paren'
  | 'VarDecl'
  | 'VarId'
  | 'FuncDecl'
  | 'FuncCall';

export interface Node {
  type: NodeType;
}

export interface AstError extends Node {
  msg: string;
}

export interface Exp extends Node {}

export interface ExpList extends Node {
  exps: Exp[];
}

export interface IntLit extends Exp {
  val: number;
}

export type BinOpType = '+' | '-' | '*' | '/' | '**';
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

export interface VarDecl extends Exp {
  ident: string;
  exp: Exp;
}

export interface VarId extends Exp {
  ident: string;
}

export interface FuncDecl extends Exp {
  params: string[];
  exp: Exp;
}

export interface FuncCall extends Exp {
  func: Exp;
  params: Exp[];
}
