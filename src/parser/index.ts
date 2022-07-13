import { setSourceMapRange } from 'typescript/lib/tsserverlibrary';

import { lex } from './lexer';

export const parse = (src: string) => {
  return lex(src)
    .map(
      (t) =>
        `${t.type}: ${t.value ?? ''} ln ${t.pos.line} (${t.pos.start}:${
          t.pos.end
        })`
    )
    .join('\n');
};
