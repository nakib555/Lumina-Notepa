import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const html = renderToStaticMarkup(
  <SyntaxHighlighter language="javascript" useInlineStyles={false}>
    {`const a = 1;`}
  </SyntaxHighlighter>
);
console.log(html);
