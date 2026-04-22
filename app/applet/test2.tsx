import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const CUSTOM_STYLE = {
  margin: 0,
  padding: '1.5rem',
  fontSize: '13px',
  lineHeight: '1.5',
  fontFamily: "'Fira Code', monospace",
  background: 'transparent',
};

const html = renderToStaticMarkup(
  <SyntaxHighlighter
    language="text"
    useInlineStyles={true}
    customStyle={CUSTOM_STYLE}
    PreTag="div"
    codeTagProps={{
      className: "code-element outline-none block min-h-[20px] whitespace-pre [font-variant-ligatures:none]"
    }}
  >
    {`Line (AC)         Full Bridge        Regulator`}
  </SyntaxHighlighter>
);
console.log(html);
