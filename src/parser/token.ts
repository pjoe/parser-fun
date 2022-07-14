export type TokenType =
  // assign
  | 'Assign'
  | 'AddAssign'
  | 'SubAssign'
  | 'MulAssign'
  | 'DivAssign'
  // binary ops
  | 'Plus'
  | 'Dash'
  | 'Star'
  | 'Slash'
  | 'Power'
  // conditons
  | 'Equal'
  | 'GreaterEqual'
  | 'LessEqual'
  // unary ops
  | 'Inc'
  | 'Dec'
  // paren
  | 'LParen'
  | 'RParen'
  | 'LBracket'
  | 'RBracket'
  | 'LBrace'
  | 'RBrace'
  | 'LAngle'
  | 'RAngle'
  // consts
  | 'IntConst'
  | 'FloatConst'
  | 'BoolConst'
  // identifiers
  | 'Ident'
  // keywords
  | 'If'
  | 'Else'
  | 'Break'
  | 'Continue'
  | 'While'
  | 'Let'
  | 'Return'
  // others
  | 'Comma'
  | 'Colon'
  | 'Semicolon'
  | 'Dot'
  | 'Quote'
  | 'Arrow'
  | 'NEWLINE'
  | 'EOF'
  | 'Unknown';

export type TokenValue = string | number | boolean;

export interface Token {
  type: TokenType;
  value?: TokenValue;
  pos: {
    line: number;
    start: number;
    end: number;
  };
}
