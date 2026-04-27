const fs = require('fs');
const path = './android/app/src/main/java/com/lumina/notes/MainActivity.java';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('catch (Exception e)', 'catch (Throwable e)');
fs.writeFileSync(path, content);
console.log('Modified MainActivity.java');
