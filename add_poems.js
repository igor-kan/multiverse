import fs from 'fs';
import path from 'path';
import https from 'https';
import { texts } from './src/data.js';

const API_ENDPOINTS = [
  'https://poetrydb.org/author,title/Poe;Alone',
  'https://poetrydb.org/author,title/Tennyson;Ulysses',
  'https://poetrydb.org/author,title/Shakespeare;Sonnet'
];

const UNSPLASH_IMAGES = {
  alone: 'https://images.unsplash.com/photo-1478819705295-a22830386121',
  ulysses: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6',
  sonnets: [
    'https://images.unsplash.com/photo-1463320726281-696a485928c7',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d',
    'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb',
    'https://images.unsplash.com/photo-1455390582262-044cdead27d8',
    'https://images.unsplash.com/photo-1476842634003-c6ce18d141fa'
  ]
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching poems...');
  let allPoems = [];
  for (const url of API_ENDPOINTS) {
    const resData = await fetchJson(url);
    if (Array.isArray(resData)) {
      allPoems = allPoems.concat(resData);
    }
  }

  console.log("Fetched " + allPoems.length + " poems.");

  for (const poem of allPoems) {
    if (!poem.title || !poem.author || !poem.lines) continue;

    let contentHtml = '<p>';
    for (let i = 0; i < poem.lines.length; i++) {
      const line = poem.lines[i].trim();
      if (line === '') {
        contentHtml += '</p>\n<p>';
      } else {
        contentHtml += line + (i < poem.lines.length - 1 && poem.lines[i+1].trim() !== '' ? '<br>\n' : '\n');
      }
    }
    contentHtml += '</p>';

    let bgImage = 'url(./images/bg-1.jpg)';
    let id = poem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let tags = 'poetry, classic';

    if (poem.title.toLowerCase().includes('alone')) {
      bgImage = 'url(./images/bg-alone.jpg)';
      tags += ', poe, solitary';
    } else if (poem.title.toLowerCase().includes('ulysses')) {
      bgImage = 'url(./images/bg-ulysses.jpg)';
      tags += ', tennyson, voyage';
    } else if (poem.title.toLowerCase().includes('sonnet')) {
      const idx = Math.floor(Math.random() * UNSPLASH_IMAGES.sonnets.length);
      bgImage = "url(./images/bg-sonnet-" + idx + ".jpg)";
      tags += ', shakespeare, sonnet, romance';
    }

    contentHtml += "\n<br>\n<p><em>Tags: " + tags + "</em></p>";

    texts.push({
      id: id + "-" + Math.floor(Math.random()*1000),
      title: poem.title,
      author: poem.author,
      type: "poetry",
      subtitle: "A Classic Poem",
      bgImage: bgImage,
      content: contentHtml
    });
  }

  const fileContent = 'export const texts = ' + JSON.stringify(texts, null, 2) + ';\n';
  fs.writeFileSync('src/data.js', fileContent);
  console.log('Finished updating data.js securely.');
}

main().catch(console.error);
