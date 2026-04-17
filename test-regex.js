const text = `| A | B |

|---|---|

| 1 | 2 |

Some text here | with a pipe

| and another
`;

let md = text;
let prev;
do {
  prev = md;
  md = md.replace(/^([ \t]*\|[^\n]+\|[ \t]*)\n[ \t]*\n([ \t]*\|[^\n]+\|[ \t]*)$/gm, '$1\n$2');
} while (prev !== md);

console.log(md);
