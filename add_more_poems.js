import fs from 'fs';
import path from 'path';
import https from 'https';
import { texts } from './src/data.js';

const API_ENDPOINTS = [
  'https://poetrydb.org/title/Ozymandias',
  'https://poetrydb.org/title/The%20Raven',
  'https://poetrydb.org/author/John%20Keats',
  'https://poetrydb.org/author/Oscar%20Wilde',
  'https://poetrydb.org/author/William%20Blake',
  'https://poetrydb.org/author/Emily%20Dickinson'
];

const UNSPLASH_IMAGES = {
  keats: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8',
  wilde: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
  blake: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee',
  dickinson: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94',
  raven: 'https://images.unsplash.com/photo-1543789060-6dfd15875da4',
  ozymandias: 'https://images.unsplash.com/photo-1534067330058-201509eb34a9',
  generic: [
    'https://images.unsplash.com/photo-1476842634003-c6ce18d141fa',
    'https://images.unsplash.com/photo-1455390582262-044cdead27d8'
  ]
};

const publicImagesDir = 'public/images';

function downloadImage(url, filename) {
  const filepath = path.join(publicImagesDir, filename);
  if (fs.existsSync(filepath)) return Promise.resolve(filename);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
          const file = fs.createWriteStream(filepath);
          res.pipe(file);
          file.on('finish', () => { file.close(); resolve(filename); });
        }).on('error', reject);
      } else {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(filename); });
      }
    }).on('error', reject);
  });
}

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
  console.log('Downloading new images...');
  await downloadImage(UNSPLASH_IMAGES.keats, 'bg-keats.jpg');
  await downloadImage(UNSPLASH_IMAGES.wilde, 'bg-wilde.jpg');
  await downloadImage(UNSPLASH_IMAGES.blake, 'bg-blake.jpg');
  await downloadImage(UNSPLASH_IMAGES.dickinson, 'bg-dickinson.jpg');
  await downloadImage(UNSPLASH_IMAGES.raven, 'bg-raven.jpg');
  await downloadImage(UNSPLASH_IMAGES.ozymandias, 'bg-ozymandias.jpg');

  console.log('Fetching poems...');
  let allPoems = [];
  for (const url of API_ENDPOINTS) {
    const resData = await fetchJson(url);
    if (Array.isArray(resData)) {
      allPoems = allPoems.concat(resData);
    }
  }

  // To prevent running out of memory or making the bundle too huge, limit to max 300 new poems from Dickinson/others if there are too many.
  // Actually, Dickinson has 300+ poems. Let's just process them all, text is small.
  console.log("Fetched " + allPoems.length + " poems.");

  for (const poem of allPoems) {
    if (!poem.title || !poem.author || !poem.lines) continue;
    
    // Check if we already have it to avoid duplicates
    const idBase = poem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (texts.some(t => t.title === poem.title)) continue;

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
    let tags = 'poetry, classic';

    if (poem.author.includes('Keats')) {
      bgImage = 'url(./images/bg-keats.jpg)';
      tags += ', keats, romantic';
    } else if (poem.author.includes('Wilde')) {
      bgImage = 'url(./images/bg-wilde.jpg)';
      tags += ', wilde, aesthetic';
    } else if (poem.author.includes('Blake')) {
      bgImage = 'url(./images/bg-blake.jpg)';
      tags += ', blake, visionary';
    } else if (poem.author.includes('Dickinson')) {
      bgImage = 'url(./images/bg-dickinson.jpg)';
      tags += ', dickinson, american';
    } else if (poem.title.includes('Ozymandias')) {
      bgImage = 'url(./images/bg-ozymandias.jpg)';
      tags += ', shelley, ruins, time';
    } else if (poem.title.includes('Raven')) {
      bgImage = 'url(./images/bg-raven.jpg)';
      tags += ', poe, dark, gothic';
    } else {
      bgImage = 'url(./images/bg-sonnet-0.jpg)'; // fallback
    }

    contentHtml += "\n<br>\n<p><em>Tags: " + tags + "</em></p>";

    texts.push({
      id: idBase + "-" + Math.floor(Math.random()*1000),
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
  console.log('Finished updating data.js with more poems. Total texts: ' + texts.length);
}

main().catch(console.error);
