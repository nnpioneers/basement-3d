const fs = require('fs');
const path = require('path');

const centerTileX = 93554;
const centerTileY = 59951;
const radius = 3;
const zoom = 17;
const tileSize = 256;
const gridSize = radius * 2 + 1; // 7
const totalSize = gridSize * tileSize; // 1792

let imagesXml = '';

for (let dy = -radius; dy <= radius; dy++) {
  for (let dx = -radius; dx <= radius; dx++) {
    const tx = centerTileX + dx;
    const ty = centerTileY + dy;
    const col = dx + radius;
    const row = dy + radius;
    const x = col * tileSize;
    const y = row * tileSize;

    const tileFile = path.join(__dirname, '..', 'public', 'tiles', `tile_${zoom}_${tx}_${ty}.jpg`);
    if (fs.existsSync(tileFile)) {
      const b64 = fs.readFileSync(tileFile).toString('base64');
      imagesXml += `  <image x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" href="data:image/jpeg;base64,${b64}" />\n`;
    }
  }
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">
  <rect width="${totalSize}" height="${totalSize}" fill="#222822"/>
${imagesXml}
</svg>`;

const outFile = path.join(__dirname, '..', 'public', 'satellite_map.svg');
fs.writeFileSync(outFile, svgContent, 'utf-8');
console.log('Saved satellite_map.svg successfully! Size:', (fs.statSync(outFile).size / 1024).toFixed(1), 'KB');
