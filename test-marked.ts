import { marked } from 'marked';
import TurndownService from 'turndown';
const turndownService = new TurndownService();
turndownService.escape = (string) => string;
marked.use({ breaks: true });
const parsed = marked.parse('line 1\nline 2');
console.log('MARK:', JSON.stringify(parsed));
console.log('TURN:', JSON.stringify(turndownService.turndown(parsed)));
