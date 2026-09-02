const sharp = require('sharp');
const path = require('path');

async function testFinalLive() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Exactly matching SatelliteGround.tsx settings:
  // positionOffset = [-103.46, 0, 17.29]
  // rotationOffset = 0.0087 rad (+0.5 deg)
  // scale = 1.005 (so layout scale factor = 1 / 1.005 = 0.995)
  const roundX = 2535;
  const roundY = 2116;
  const scale = 0.995;
  const rotDeg = 0.5;

  const toPx = (x, y) => {
    const rx = x * 3.4699 * scale;
    const ry = y * 3.4699 * scale;
    const rad = (rotDeg * Math.PI) / 180;
    const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
    const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);
    return [roundX + rotX, roundY - rotY];
  };

  // Outer boundary
  const pts = [
    toPx(-220.5, -51.26),
    toPx(175.79, -51.26),
    toPx(175.79, 94.64),
    toPx(136.50, 94.64),
    toPx(136.50, 66.80),
    toPx(3.00, 66.80),
    toPx(3.00, 89.86),
    toPx(-6.00, 89.48),
    toPx(-6.00, 63.80),
    toPx(-193.5, 63.80),
    toPx(-193.5, -4.61),
    toPx(-220.5, -4.61),
  ].map(p => `${p[0]},${p[1]}`).join(' ');

  // CA site
  const caPts = [
    toPx(-106.5, 63.80), toPx(-6.0, 63.80),
    toPx(-6.0, 89.48), toPx(-61.0, 87.28),
    toPx(-61.0, 88.78), toPx(-106.5, 87.15),
  ].map(p => `${p[0]},${p[1]}`).join(' ');

  // Park
  const parkPts = [
    toPx(3.0, 66.80), toPx(136.5, 66.80),
    toPx(136.5, 94.64), toPx(3.0, 89.86),
  ].map(p => `${p[0]},${p[1]}`).join(' ');

  // Left Park
  const leftParkPts = [
    toPx(-220.5, -51.26), toPx(-193.5, -51.26),
    toPx(-193.5, -13.61), toPx(-220.5, -13.61),
  ].map(p => `${p[0]},${p[1]}`).join(' ');

  const svg = `<svg width="2000" height="1400" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(-1400, -1400)">
      <polygon points="${pts}" fill="rgba(30, 144, 255, 0.12)" stroke="#00ffff" stroke-width="3"/>
      <polygon points="${caPts}" fill="rgba(240, 230, 200, 0.45)" stroke="#e6c280" stroke-width="2"/>
      <polygon points="${parkPts}" fill="rgba(46, 125, 50, 0.5)" stroke="#22c55e" stroke-width="2"/>
      <polygon points="${leftParkPts}" fill="rgba(46, 125, 50, 0.5)" stroke="#22c55e" stroke-width="2"/>
      <!-- Main East-West Road -->
      <line x1="${toPx(-220.5, 21.65)[0]}" y1="${toPx(-220.5, 21.65)[1]}" x2="${toPx(175.79, 21.65)[0]}" y2="${toPx(175.79, 21.65)[1]}" stroke="#ffff00" stroke-width="2.5" stroke-dasharray="6,4"/>
      <!-- Roundabout -->
      <circle cx="${toPx(0, 21.65)[0]}" cy="${toPx(0, 21.65)[1]}" r="14" fill="#ef4444" stroke="#fff" stroke-width="2"/>
    </g>
  </svg>`;

  const overlayBuf = Buffer.from(svg);
  const outPath = path.join(__dirname, 'live_final_perfect.jpg');
  await sharp(mapPath)
    .extract({ left: 1400, top: 1400, width: 2000, height: 1400 })
    .composite([{ input: overlayBuf, top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(outPath);

  console.log('Saved live_final_perfect.jpg');
}

testFinalLive().catch(console.error);
