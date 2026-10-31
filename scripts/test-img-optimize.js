const http = require('http');
const fs = require('fs');

http.get('http://localhost:3001/_next/image?url=%2Fteam%2Flaiba-baig.jpg&w=3840&q=75', (res) => {
  console.log('Optimized laiba-baig status:', res.statusCode);
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    console.log('Length:', buf.length);
    fs.writeFileSync('scripts/downloaded-laiba.webp', buf);
  });
});
