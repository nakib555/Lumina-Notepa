const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Prism: SyntaxHighlighter } = require('react-syntax-highlighter');

const html = renderToStaticMarkup(
  React.createElement(SyntaxHighlighter, {
    language: "text",
    useInlineStyles: false
  }, `A\nB`)
);
console.log(JSON.stringify(html));
