const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');

const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.tables);

turndownService.addRule('preserveBr', {
  filter: 'br',
  replacement: function (_content, node) {
    let parent = node.parentNode;
    while (parent) {
      if (parent.nodeName === 'TD' || parent.nodeName === 'TH') {
        return '<br>';
      }
      if (parent.nodeName === 'PRE') {
        return '\n';
      }
      parent = parent.parentNode;
    }
    return '\n';
  }
});

turndownService.addRule('tableBlocks', {
  filter: function (node) {
    if (!['P', 'DIV', 'UL', 'OL', 'LI', 'BLOCKQUOTE'].includes(node.nodeName)) return false;
    let parent = node.parentNode;
    while (parent) {
      if (parent.nodeName === 'TD' || parent.nodeName === 'TH') {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  },
  replacement: function (content, node) {
    if (!content.trim()) return '';
    // If it's a list item, add a bullet
    let prefix = '';
    if (node.nodeName === 'LI') {
      prefix = '• ';
    }
    
    // Return content with a <br> if it's not the last child
    return prefix + content + (node.nextSibling ? '<br>' : '');
  }
});

const html = `
<table>
  <thead>
    <tr><th>Header</th><th>Header2</th></tr>
  </thead>
  <tbody>
    <tr><td><div>%%%%CARETMARKER%%%%</div></td><td><br></td></tr>
  </tbody>
</table>
`;

const md = turndownService.turndown(html);
console.log("Markdown:");
console.log(md);
