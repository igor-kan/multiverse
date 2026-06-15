const fs = require('fs');
let txt = fs.readFileSync('src/data.js', 'utf8');
txt = txt.replace(/\\`/g, '`');
fs.writeFileSync('src/data.js', txt);
console.log('Fixed data.js');
