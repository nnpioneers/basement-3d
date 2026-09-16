const sharp = require('sharp');
const path = require('path');

async function testMatchLandmarks() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');

  // Ground landmarks:
  // - Top North Wall (above sand mounds & trees): Y ~ 1680 px
  // - Bottom South Wall (below brick piles): Y ~ 2220 px
  // - Height between North and South = 2220 - 1680 = 540 px.
  // - 3D layout height from Park top (94.64) to Bottom plots (-51.26) = 145.9 m.
  // - Scale = 540 / (145.9 * 3.4699) = 540 / 506.26 = 1.066
  // - Central roundabout: X ~ 2530 px, Y ~ 1950 px.

  // In Three.js:
  // groundSize = 1254.2 * scale
  // At zoom 19, 4352 px is mapped to groundSize.
  // If we want roundabout at (X_px, Y_px):
  // posOffset_X = - (X_px - 2176) * (groundSize / 4352)
  // posOffset_Z = - (Y_px - 2176) * (groundSize / 4352) (if Y_px < 2176, Y_px - 2176 is negative, so posOffset_Z is POSITIVE!)

  const candidates = [
    { name: 'cand_1', roundX: 2530, roundY: 1955, scale: 1.06, rotDeg: 0.8 },
    { name: 'cand_2', roundX: 2535, roundY: 1950, scale: 1.07, rotDeg: 0.9 },
    { name: 'cand_3', roundX: 2540, roundY: 1945, scale: 1.08, rotDeg: 1.0 },
    { name: 'cand_4', roundX: 2535, roundY: 1960, scale: 1.05, rotDeg: 0.8 },
    { name: 'cand_5', roundX: 2525, roundY: 1950, scale: 1.07, rotDeg: 0.85 },
  ];

  for (const c of candidates) {
    const groundSize = 1254.2 * c.scale;
    const mPerPx = groundSize / 4352;
    const posX = - (c.roundX - 2176) * mPerPx;
    const posZ = - (c.roundY - 2176) * mPerPx; // posZ will be around +60m !
    const rad = (c.rotDeg * Math.PI) / 180;

    const project3DToTexPx = (wx, wz) => {
      const dx = wx - posX;
      const dz = wz - posZ;
      const lx = dx * Math.cos(rad) - dz * Math.sin(rad);
      const ly = -dx * Math.sin(rad) - dz * Math.cos(rad);

      const u = lx / groundSize;
      const v = ly / groundSize;
      const px = (u + 0.5) * 4352;
      const py = (0.5 - v) * 4352;
      return [px, py];
    };

    const toPx = (x, y) => project3DToTexPx(x, -y);

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

    const caPts = [
      toPx(-106.5, 63.80), toPx(-6.0, 63.80),
      toPx(-6.0, 89.48), toPx(-61.0, 87.28),
      toPx(-61.0, 88.78), toPx(-106.5, 87.15),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    const parkPts = [
      toPx(3.0, 66.80), toPx(136.5, 66.80),
      toPx(136.5, 94.64), toPx(3.0, 89.86),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    const leftParkPts = [
      toPx(-220.5, -51.26), toPx(-193.5, -51.26),
      toPx(-193.5, -13.61), toPx(-220.5, -13.61),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    const svg = `<svg width="2400" height="1600" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-1200, -1200)">
        <polygon points="${pts}" fill="rgba(0, 150, 255, 0.15)" stroke="#00ffff" stroke-width="3"/>
        <polygon points="${caPts}" fill="rgba(240, 230, 200, 0.55)" stroke="#e6c280" stroke-width="2"/>
        <polygon points="${parkPts}" fill="rgba(46, 125, 50, 0.6)" stroke="#22c55e" stroke-width="2"/>
        <polygon points="${leftParkPts}" fill="rgba(46, 125, 50, 0.6)" stroke="#22c55e" stroke-width="2"/>
        <!-- South Wall Line -->
        <line x1="${toPx(-193.5, -51.26)[0]}" y1="${toPx(-193.5, -51.26)[1]}" x2="${toPx(175.79, -51.26)[0]}" y2="${toPx(175.79, -51.26)[1]}" stroke="#ff0055" stroke-width="3"/>
        <!-- East Wall Line (18m road) -->
        <line x1="${toPx(175.79, -51.26)[0]}" y1="${toPx(175.79, -51.26)[1]}" x2="${toPx(175.79, 94.64)[0]}" y2="${toPx(175.79, 94.64)[1]}" stroke="#ff0055" stroke-width="3"/>
        <!-- Main East-West Road -->
        <line x1="${toPx(-220.5, 21.65)[0]}" y1="${toPx(-220.5, 21.65)[1]}" x2="${toPx(175.79, 21.65)[0]}" y2="${toPx(175.79, 21.65)[1]}" stroke="#ffff00" stroke-width="2.5" stroke-dasharray="6,4"/>
        <!-- Roundabout -->
        <circle cx="${toPx(0, 21.65)[0]}" cy="${toPx(0, 21.65)[1]}" r="12" fill="#ef4444" stroke="#fff" stroke-width="2"/>
      </g>
    </svg>`;

    const overlayBuf = Buffer.from(svg);
    const outPath = path.join(__dirname, `${c.name}.jpg`);
    await sharp(mapPath)
      .extract({ left: 1200, top: 1200, width: 2400, height: 1600 })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toFile(outPath);

    console.log(`${c.name}: posX=${posX.toFixed(2)}, posZ=${posZ.toFixed(2)}, scale=${c.scale}, rotDeg=${c.rotDeg}`);
  }
}

testMatchLandmarks().catch(console.error);
