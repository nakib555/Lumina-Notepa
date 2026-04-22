const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Prism: SyntaxHighlighter } = require('react-syntax-highlighter');

const CUSTOM_STYLE = {
  margin: 0,
  padding: '1.5rem',
  fontSize: '13px',
  lineHeight: '1.5',
  fontFamily: "'Fira Code', monospace",
  background: 'transparent',
};

const html = renderToStaticMarkup(
  React.createElement(SyntaxHighlighter, {
    language: "text",
    useInlineStyles: true,
    customStyle: CUSTOM_STYLE,
    PreTag: "div",
    codeTagProps: {
      className: "code-element outline-none block min-h-[20px] whitespace-pre [font-variant-ligatures:none]"
    }
  }, `Line (AC)         Full Bridge        Regulator\n  o---) )---+       +----------+    +----------+\n       ) )  |       |   / \\    |    | IN   OUT |`)
);
console.log(html);
