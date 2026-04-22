import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

console.log(renderToStaticMarkup(
  <SyntaxHighlighter language="text" useInlineStyles={false}>
    {`Line 1\nLine 2`}
  </SyntaxHighlighter>
));
