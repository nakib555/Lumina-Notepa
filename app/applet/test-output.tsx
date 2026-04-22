import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const html = renderToStaticMarkup(
  <SyntaxHighlighter language="text" useInlineStyles={false}>
    {`A\nB`}
  </SyntaxHighlighter>
);
console.log(JSON.stringify(html));
