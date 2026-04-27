const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');

const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.tables);

const html = `
<table>
  <thead>
    <tr><th>Header</th><th>Header2</th></tr>
  </thead>
  <tbody>
    <tr><td><div>Cell 1</div><div>Cell 2</div></td><td>Test</td></tr>
  </tbody>
</table>
`;

const md = turndownService.turndown(html);
console.log("Markdown:");
console.log(md);
