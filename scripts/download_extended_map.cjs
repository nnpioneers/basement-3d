const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

sharp.cache(false);

const centerTileX = 374219;
const centerTileY = 239807;
const zoom = 19;
const radius = 38;
const gridSize = radius * 2 + 1; // 77 tiles
const targetPx = 6144; // 6K WebP texture
const tileDir = path.join(__dirname, '..', 'public', 'tiles_z19_extended');

async function main() {
  console.log(`Building ${targetPx}x${targetPx} WebP satellite map via direct pixel memory mapping (${gridSize}x${gridSize} tiles)...`);

  // Pre-calculate exact grid cell pixel bounds
  const xBounds = [];
  const yBounds = [];
  for (let i = 0; i <= gridSize; i++) {
    xBounds.push(Math.round(i * (targetPx / gridSize)));
    yBounds.push(Math.round(i * (targetPx / gridSize)));
  }

  // Allocate target canvas raw RGB buffer (6144 * 6144 * 3 bytes)
  const canvasBuf = Buffer.alloc(targetPx * targetPx * 3, 84);

  let processed = 0;
  const startTime = Date.now();

  for (let dy = -radius; dy <= radius; dy++) {
    const row = dy + radius;
    const ty = centerTileY + dy;
    const y0 = yBounds[row];
    const y1 = yBounds[row + 1];
    const cellH = y1 - y0;

    for (let dx = -radius; dx <= radius; dx++) {
      const col = dx + radius;
      const tx = centerTileX + dx;
      const x0 = xBounds[col];
      const x1 = xBounds[col + 1];
      const cellW = x1 - x0;

      const tilePath = path.join(tileDir, `tile_${zoom}_${tx}_${ty}.jpg`);
      if (fs.existsSync(tilePath)) {
        // Resize tile directly to raw RGB cell buffer
        const { data, info } = await sharp(tilePath)
          .resize(cellW, cellH, { fit: 'fill' })
          .raw()
          .toBuffer({ resolveWithObject: true });

        // Copy cell row-by-row into master canvas buffer
        for (let r = 0; r < info.height; r++) {
          const srcOffset = r * info.width * 3;
          const dstOffset = ((y0 + r) * targetPx + x0) * 3;
          data.copy(canvasBuf, dstOffset, srcOffset, srcOffset + info.width * 3);
        }
      }

      processed++;
    }

    if ((row + 1) % 10 === 0 || row === gridSize - 1) {
      console.log(`Processed ${row + 1} / ${gridSize} tile rows (${processed} / ${gridSize * gridSize} tiles)...`);
    }
  }

  console.log(`Memory mapping complete in ${((Date.now() - startTime) / 1000).toFixed(1)}s. Encoding WebP image...`);

  const outWebp = path.join(__dirname, '..', 'public', 'extended_satellite_map.webp');

  await sharp(canvasBuf, {
    raw: {
      width: targetPx,
      height: targetPx,
      channels: 3,
    }
  })
    .webp({ quality: 85, effort: 3 })
    .toFile(outWebp);

  console.log('SUCCESS! Created extended satellite map:', outWebp, 'Size:', (fs.statSync(outWebp).size / 1024 / 1024).toFixed(2), 'MB');
}

main().catch(console.error);
