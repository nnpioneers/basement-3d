const sharp = require('sharp');
const path = require('path');

async function testFullPlotRender() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Calibrated settings from align_opt_3:
  const roundX = 2525;
  const roundY = 2120;
  const scale = 0.995;
  const rotDeg = -0.4;

  const toPx = (x, y) => {
    const rx = x * 3.4699 * scale;
    const ry = y * 3.4699 * scale;
    const rad = (rotDeg * Math.PI) / 180;
    const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
    const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);
    return [roundX + rotX, roundY - rotY];
  };

  // Let's create an SVG that outlines all blocks of plots:
  // Left blocks, CA Site, Park, Right blocks, 18m road
  const ptsOuter = [
    toPx(-220.5, -51.3),
    toPx(175.79, -51.3),
    toPx(175.79, 94.68),
    toPx(136.50, 94.68),
    toPx(136.50, 66.80),
    toPx(3.00, 66.80),
    toPx(3.00, 89.90),
    toPx(-6.00, 89.52),
    toPx(-6.00, 63.84),
    toPx(-193.5, 63.84),
    toPx(-193.5, -4.61),
    toPx(-220.5, -4.61),
  ].map(p => `${p[0]},${p[1]}`).join(' ');

  // Central road
  const rStart = toPx(-220.5, 0);
  const rEnd = toPx(175.79, 0);

  const svg = `<svg width="2000" height="1400" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(-1400, -1400)">
      <polygon points="${ptsOuter}" fill="none" stroke="#00ffcc" stroke-width="4"/>
      <line x1="${rStart[0]}" y1="${rStart[1]}" x2="${rEnd[0]}" y2="${rEnd[1]}" stroke="#ffeb3b" stroke-width="3" stroke-dasharray="6,4"/>
      <circle cx="${toPx(0, 0)[0]}" cy="${toPx(0, 0)[1]}" r="14" fill="#f44336" stroke="#fff" stroke-width="3"/>
    </g>
  </svg>`;

  const overlayBuf = Buffer.from(svg);
  const outPath = path.join(__dirname, 'final_verification.jpg');
  await sharp(mapPath)
    .extract({ left: 1400, top: 1400, width: 2000, height: 1400 })
    .composite([{ input: overlayBuf, top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(outPath);

  console.log('Saved final_verification.jpg');
}

testFullPlotRender().catch(console.error);
