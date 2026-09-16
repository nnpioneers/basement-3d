const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const centerTileX = 374219;
const centerTileY = 239807;
const radius = 8;
const zoom = 19;
const tileSize = 256;
const gridSize = radius * 2 + 1; // 17
const totalSize = gridSize * tileSize; // 4352

async function stitch() {
  console.log(`Stitching ${gridSize}x${gridSize} tiles into ${totalSize}x${totalSize} image...`);
  
  const composites = [];

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const tx = centerTileX + dx;
      const ty = centerTileY + dy;
      const col = dx + radius;
      const row = dy + radius;
      const left = col * tileSize;
      const top = row * tileSize;

      const tilePath = path.join(__dirname, '..', 'public', 'tiles_z19', `tile_${zoom}_${tx}_${ty}.jpg`);
      if (fs.existsSync(tilePath)) {
        composites.push({
          input: tilePath,
          top: top,
          left: left,
        });
      }
    }
  }

  const outFile = path.join(__dirname, '..', 'public', 'satellite_map.jpg');

  await sharp({
    create: {
      width: totalSize,
      height: totalSize,
      channels: 3,
      background: { r: 34, g: 40, b: 34 },
    },
  })
    .composite(composites)
    .jpeg({ quality: 95 })
    .toFile(outFile);

  console.log('Successfully created:', outFile, 'Size:', (fs.statSync(outFile).size / 1024).toFixed(1), 'KB');
}

stitch().catch(console.error);

