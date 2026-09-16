const sharp = require('sharp');
const path = require('path');

async function fineTuneLive() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');

  // Let's test combinations of:
  // posX: [-94, -98, -102, -106]
  // posZ: [-6, -10, -14, -18]
  // scale: [1.00, 1.01, 1.02, 1.03]
  // rotDeg: [0.6, 0.7, 0.8]
  const tests = [
    { name: 'fine_1', posX: -96, posZ: -10, scale: 1.015, rotDeg: 0.65 },
    { name: 'fine_2', posX: -98, posZ: -12, scale: 1.010, rotDeg: 0.70 },
    { name: 'fine_3', posX: -100, posZ: -14, scale: 1.005, rotDeg: 0.75 },
    { name: 'fine_4', posX: -94, posZ: -8, scale: 1.020, rotDeg: 0.60 },
    { name: 'fine_5', posX: -102, posZ: -12, scale: 1.010, rotDeg: 0.70 },
    { name: 'fine_6', posX: -96, posZ: -14, scale: 1.005, rotDeg: 0.75 },
  ];

  for (const tc of tests) {
    const rad = (tc.rotDeg * Math.PI) / 180;
    const groundSize = 1254.2 * tc.scale;

    const project3DToTexPx = (wx, wz) => {
      const dx = wx - tc.posX;
      const dz = wz - tc.posZ;
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

    const svg = `<svg width="2000" height="1400" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-1400, -1400)">
        <polygon points="${pts}" fill="rgba(0, 150, 255, 0.15)" stroke="#00ffff" stroke-width="3"/>
        <polygon points="${caPts}" fill="rgba(240, 230, 200, 0.45)" stroke="#e6c280" stroke-width="2"/>
        <polygon points="${parkPts}" fill="rgba(46, 125, 50, 0.5)" stroke="#22c55e" stroke-width="2"/>
        <polygon points="${leftParkPts}" fill="rgba(46, 125, 50, 0.5)" stroke="#22c55e" stroke-width="2"/>
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
    const outPath = path.join(__dirname, `${tc.name}.jpg`);
    await sharp(mapPath)
      .extract({ left: 1400, top: 1400, width: 2000, height: 1400 })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toFile(outPath);
  }
  console.log('Fine tune tests generated!');
}

fineTuneLive().catch(console.error);
