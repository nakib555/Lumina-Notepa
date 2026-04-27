const { marked } = require('marked');
const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');

const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.tables);

const html = `
<table>
  <thead>
    <tr><th>Header</th><th></th></tr>
  </thead>
  <tbody>
    <tr><td>Cell</td><td>___CARET_POS_MARKER___</td></tr>
  </tbody>
</table>
`;

const md = turndownService.turndown(html);
console.log("Markdown:");
console.log(md);

console.log("Re-parsed HTML:");
console.log(marked.parse(md));
