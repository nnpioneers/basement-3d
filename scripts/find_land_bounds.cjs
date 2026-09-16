const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function findLandBounds() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  const left = 1400;
  const top = 1400;
  const width = 2000;
  const height = 1400;

  // Let's create an SVG grid over the cropped area
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  for (let x = left; x <= left + width; x += 100) {
    const isMajor = x % 500 === 0;
    const cropX = x - left;
    svg += `<line x1="${cropX}" y1="0" x2="${cropX}" y2="${height}" stroke="${isMajor ? 'red' : 'cyan'}" stroke-width="${isMajor ? 3 : 1}" opacity="0.6"/>`;
    svg += `<text x="${cropX + 4}" y="30" fill="yellow" font-size="20" font-weight="bold">${x}</text>`;
  }
  for (let y = top; y <= top + height; y += 100) {
    const isMajor = y % 500 === 0;
    const cropY = y - top;
    svg += `<line x1="0" y1="${cropY}" x2="${width}" y2="${cropY}" stroke="${isMajor ? 'red' : 'cyan'}" stroke-width="${isMajor ? 3 : 1}" opacity="0.6"/>`;
    svg += `<text x="10" y="${cropY - 4}" fill="yellow" font-size="20" font-weight="bold">${y}</text>`;
  }
  svg += `</svg>`;

  const overlayBuf = Buffer.from(svg);
  const outPath = path.join(__dirname, 'grid_crop.jpg');
  await sharp(mapPath)
    .extract({ left, top, width, height })
    .composite([{ input: overlayBuf, top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toFile(outPath);

  console.log('Saved grid_crop.jpg successfully:', outPath);
}

findLandBounds().catch(console.error);

