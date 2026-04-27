import fs from 'fs';
import https from 'https';

https.get('https://libraries.excalidraw.com/libraries.json', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed.slice(0, 5), null, 2));
    } catch (e) {
      console.error(e);
    }
  });
});
