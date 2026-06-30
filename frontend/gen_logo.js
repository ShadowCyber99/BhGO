const fs = require('fs');
const svg = fs.readFileSync('C:\\Users\\Softelevation-Devops\\.gemini\\antigravity\\brain\\66d98c81-2784-45c5-ab74-b7c88cb99aa3\\artifacts\\bharatgo_logo.svg', 'utf8');
const base64 = Buffer.from(svg).toString('base64');
const output = `export const logoSvgBase64 = "data:image/svg+xml;base64,${base64}";\n`;
fs.writeFileSync('C:\\Users\\Softelevation-Devops\\.gemini\\antigravity\\scratch\\bharatgo-app\\frontend\\src\\constants\\logo.js', output);
console.log('Successfully generated logo.js with Base64 encoding!');
