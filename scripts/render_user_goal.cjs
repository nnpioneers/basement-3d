const sharp = require('sharp');
const path = require('path');

async function renderUserGoalComparison() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');

  // Let's test a fine grid of positions and rotations:
  // We want the layout to sit squarely inside the compound wall like in image 2:
  // - North Wall: Y_north ~ 1805 px
  // - South Wall: Y_south ~ 2320 px
  // - West Wall: X_west ~ 1865 px
  // - East Wall: X_east ~ 3230 px

  const configs = [
    { name: 'goal_1', rotDeg: 0.86, posX: -106.0, posZ: 20.0, scaleX: 1.015, scaleY: 1.010 },
    { name: 'goal_2', rotDeg: 0.86, posX: -102.0, posZ: 22.0, scaleX: 1.020, scaleY: 1.015 },
    { name: 'goal_3', rotDeg: 0.90, posX: -98.0, posZ: 24.0, scaleX: 1.025, scaleY: 1.020 },
    { name: 'goal_4', rotDeg: 0.80, posX: -110.0, posZ: 18.0, scaleX: 1.010, scaleY: 1.005 },
    { name: 'goal_5', rotDeg: 0.95, posX: -94.0, posZ: 26.0, scaleX: 1.030, scaleY: 1.025 },
    { name: 'goal_6', rotDeg: 0.85, posX: -100.0, posZ: 20.0, scaleX: 1.018, scaleY: 1.012 },
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
        <polygon points="${pts}" fill="rgba(20, 20, 25, 0.75)" stroke="#ffffff" stroke-width="3"/>
        <polygon points="${caPts}" fill="rgba(235, 225, 205, 0.9)" stroke="#fff" stroke-width="2"/>
        <polygon points="${parkPts}" fill="rgba(76, 175, 80, 0.85)" stroke="#fff" stroke-width="2"/>
        <polygon points="${leftParkPts}" fill="rgba(76, 175, 80, 0.85)" stroke="#fff" stroke-width="2"/>
        <!-- White boundary lines like in reference photo -->
        <polyline points="${pts}" fill="none" stroke="#ffffff" stroke-width="4"/>
      </g>
    </svg>`;

    const overlayBuf = Buffer.from(svg);
    const outPath = path.join(__dirname, `${c.name}.jpg`);
    await sharp(mapPath)
      .extract({ left: 1300, top: 1300, width: 2200, height: 1500 })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toFile(outPath);
  }
  console.log('Goal comparison rendered!');
}

renderUserGoalComparison().catch(console.error);
