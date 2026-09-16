const sharp = require('sharp');
const path = require('path');

async function testGoldFit() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');

  // Let's test fine-tuned sweet spot candidates around fit_exact_2:
  const configs = [
    { name: 'gold_1', posX: -105.0, posZ: 18.0, scaleX: 1.050, scaleY: 1.015, rotDeg: 0.50 },
    { name: 'gold_2', posX: -103.5, posZ: 19.0, scaleX: 1.052, scaleY: 1.018, rotDeg: 0.52 },
    { name: 'gold_3', posX: -102.0, posZ: 20.0, scaleX: 1.055, scaleY: 1.020, rotDeg: 0.55 },
    { name: 'gold_4', posX: -104.0, posZ: 17.5, scaleX: 1.048, scaleY: 1.012, rotDeg: 0.48 },
  ];

  for (const c of configs) {
    const rad = (c.rotDeg * Math.PI) / 180;
    const groundW = 1254.2 * c.scaleX;
    const groundH = 1254.2 * c.scaleY;

    const project3DToTexPx = (wx, wz) => {
      const dx = wx - c.posX;
      const dz = wz - c.posZ;
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
      .extract({ left: 1300, top: 1300, width: 2200, height: 1500 })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toFile(outPath);

    console.log(`Saved ${c.name}.jpg`);
  }
}

testGoldFit().catch(console.error);
