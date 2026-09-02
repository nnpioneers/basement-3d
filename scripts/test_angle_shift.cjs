const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function testAngleAndShift() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Base parameters:
  // We want to test moving right (increasing roundX) and rotating slightly
  const variations = [
    { name: 'rot_opt_1', roundX: 2532, roundY: 2118, scale: 0.995, rotDeg: 0.2 },
    { name: 'rot_opt_2', roundX: 2535, roundY: 2116, scale: 0.995, rotDeg: 0.5 },
    { name: 'rot_opt_3', roundX: 2538, roundY: 2115, scale: 0.995, rotDeg: 0.8 },
    { name: 'rot_opt_4', roundX: 2535, roundY: 2120, scale: 0.990, rotDeg: 0.4 },
    { name: 'rot_opt_5', roundX: 2540, roundY: 2118, scale: 0.995, rotDeg: 0.6 },
  ];

  for (const t of variations) {
    const toPx = (x, y) => {
      const rx = x * 3.4699 * t.scale;
      const ry = y * 3.4699 * t.scale;
      const rad = (t.rotDeg * Math.PI) / 180;
      const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
      const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);
      return [t.roundX + rotX, t.roundY - rotY];
    };

    // Original outer layout points
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
    ];
    const polyStr = pts.map(p => `${p[0]},${p[1]}`).join(' ');

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

    const svg = `<svg width="2000" height="1400" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-1400, -1400)">
        <polygon points="${polyStr}" fill="rgba(30, 144, 255, 0.15)" stroke="#00ffff" stroke-width="3"/>
        <polygon points="${caPts}" fill="rgba(240, 230, 200, 0.4)" stroke="#e6c280" stroke-width="2"/>
        <polygon points="${parkPts}" fill="rgba(60, 200, 80, 0.4)" stroke="#22c55e" stroke-width="2"/>
        <line x1="${toPx(-220.5, 21.65)[0]}" y1="${toPx(-220.5, 21.65)[1]}" x2="${toPx(175.79, 21.65)[0]}" y2="${toPx(175.79, 21.65)[1]}" stroke="#ffff00" stroke-width="3" stroke-dasharray="8,4"/>
        <circle cx="${toPx(0, 21.65)[0]}" cy="${toPx(0, 21.65)[1]}" r="14" fill="#ef4444" stroke="#fff" stroke-width="2"/>
      </g>
    </svg>`;

    const overlayBuf = Buffer.from(svg);
    const outPath = path.join(__dirname, `${t.name}.jpg`);
    await sharp(mapPath)
      .extract({ left: 1400, top: 1400, width: 2000, height: 1400 })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toFile(outPath);

    console.log(`Saved ${t.name}.jpg`);
  }
}

testAngleAndShift().catch(console.error);
