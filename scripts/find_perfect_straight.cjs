const sharp = require('sharp');
const path = require('path');

async function findPerfectStraightFit() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');

  // Let's test a matrix of:
  // rotDeg: [1.2, 1.4, 1.6, 1.8, 2.0]  (more rotation to straighten the slanted bottom wall)
  // posX: [-88, -92, -96, -100]        (shifting right to eliminate the right-side gap)
  // posZ: [14, 18, 22]
  // scaleX: [1.00, 1.02]
  // scaleY: [1.00, 1.02]

  const tests = [
    { name: 'straight_1', rotDeg: 1.2, posX: -94, posZ: 18, scaleX: 1.01, scaleY: 1.01 },
    { name: 'straight_2', rotDeg: 1.4, posX: -92, posZ: 18, scaleX: 1.01, scaleY: 1.01 },
    { name: 'straight_3', rotDeg: 1.6, posX: -90, posZ: 18, scaleX: 1.01, scaleY: 1.01 },
    { name: 'straight_4', rotDeg: 1.8, posX: -88, posZ: 18, scaleX: 1.01, scaleY: 1.01 },
    { name: 'straight_5', rotDeg: 1.4, posX: -94, posZ: 16, scaleX: 1.00, scaleY: 1.00 },
    { name: 'straight_6', rotDeg: 1.6, posX: -92, posZ: 16, scaleX: 1.00, scaleY: 1.00 },
    { name: 'straight_7', rotDeg: 1.8, posX: -90, posZ: 16, scaleX: 1.00, scaleY: 1.00 },
    { name: 'straight_8', rotDeg: 2.0, posX: -88, posZ: 16, scaleX: 1.00, scaleY: 1.00 },
    { name: 'straight_9', rotDeg: 1.5, posX: -86, posZ: 17, scaleX: 1.00, scaleY: 1.00 },
    { name: 'straight_10', rotDeg: 1.7, posX: -86, posZ: 17, scaleX: 1.00, scaleY: 1.00 },
    { name: 'straight_11', rotDeg: 1.5, posX: -84, posZ: 18, scaleX: 0.99, scaleY: 0.99 },
    { name: 'straight_12', rotDeg: 1.7, posX: -84, posZ: 18, scaleX: 0.99, scaleY: 0.99 },
  ];

  for (const t of tests) {
    const rad = (t.rotDeg * Math.PI) / 180;
    const groundW = 1254.2 * t.scaleX;
    const groundH = 1254.2 * t.scaleY;

    const project3DToTexPx = (wx, wz) => {
      const dx = wx - t.posX;
      const dz = wz - t.posZ;
      const lx = dx * Math.cos(rad) - dz * Math.sin(rad);
      const ly = -dx * Math.sin(rad) - dz * Math.cos(rad);

      const u = lx / groundW;
      const v = ly / groundH;
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

    const svg = `<svg width="2200" height="1500" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-1300, -1300)">
        <polygon points="${pts}" fill="rgba(0, 150, 255, 0.2)" stroke="#00ffff" stroke-width="3"/>
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
    const outPath = path.join(__dirname, `${t.name}.jpg`);
    await sharp(mapPath)
      .extract({ left: 1300, top: 1300, width: 2200, height: 1500 })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toFile(outPath);
  }
  console.log('Straight tests done!');
}

findPerfectStraightFit().catch(console.error);
