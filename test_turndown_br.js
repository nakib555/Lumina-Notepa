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
    <tr><td>Cell</td><td><br></td></tr>
  </tbody>
</table>
`;

const md = turndownService.turndown(html);
console.log("Markdown:");
console.log(md);
