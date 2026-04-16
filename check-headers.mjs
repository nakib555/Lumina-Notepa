import https from 'https';

https.get('https://goog-6ls.pages.dev/updates/version.json', (res) => {
  console.log('Headers:', res.headers);
});
