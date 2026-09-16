const https = require('https');
const fs = require('fs');
const path = require('path');

// Google Maps Location: 15°09'26.8"N 76°57'21.5"E
// Center at lat 15.1574439, lon 76.9559703
// Zoom 19: cx = 374219, cy = 239807
const centerTileX = 374219;
const centerTileY = 239807;
const zoom = 19;
const radius = 8; // 17x17 grid (4352x4352 px)

const outDir = path.join(__dirname, '..', 'public', 'tiles_z19');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function downloadTile(x, y, z) {
  return new Promise((resolve) => {
    const filename = `tile_${z}_${x}_${y}.jpg`;
    const filePath = path.join(outDir, filename);

    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1500) {
      return resolve(filename);
    }

    const url = `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`;
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(filename);
        });
      } else {
        console.error(`Failed to download tile ${z}/${x}/${y}, status: ${res.statusCode}`);
        resolve(null);
      }
    }).on('error', (err) => {
      console.error(`Error for tile ${z}/${x}/${y}:`, err.message);
      resolve(null);
    });
  });
}

async function run() {
  console.log(`Downloading 17x17 ultra-high-res tiles around center: ${centerTileX}, ${centerTileY} at zoom ${zoom}`);
  const tasks = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const tx = centerTileX + dx;
      const ty = centerTileY + dy;
      tasks.push(downloadTile(tx, ty, zoom));
    }
  }

  const results = await Promise.all(tasks);
  console.log(`Successfully downloaded ${results.filter(Boolean).length} / ${tasks.length} tiles!`);
}

run();

