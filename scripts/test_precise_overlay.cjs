const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function testPreciseOverlay() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Real site ground measurements:
  // South compound wall in image: Y = 2330..2340
  // North compound wall / park wall in image: Y = 1790 (east), Y = 1895 (west)
  // West compound wall / entrance: X = 1845..1860
  // East compound wall: X = 3180..3200
  // Center dirt road: Y = 2075
  // Center roundabout: X = 2525, Y = 2075

  // Let's test a grid of precise offsets around (roundX, roundY, scale, rot):
  const tests = [
    { name: 'align_opt_1', roundX: 2515, roundY: 2110, scale: 0.985, rotDeg: -0.2 },
    { name: 'align_opt_2', roundX: 2520, roundY: 2115, scale: 0.990, rotDeg: -0.3 },
    { name: 'align_opt_3', roundX: 2525, roundY: 2120, scale: 0.995, rotDeg: -0.4 },
    { name: 'align_opt_4', roundX: 2520, roundY: 2125, scale: 1.000, rotDeg: -0.2 },
    { name: 'align_opt_5', roundX: 2530, roundY: 2130, scale: 1.005, rotDeg: -0.3 },
  ];

  for (const t of tests) {
    const toPx = (x, y) => {
      const rx = x * 3.4699 * t.scale;
      const ry = y * 3.4699 * t.scale;
      const rad = (t.rotDeg * Math.PI) / 180;
      const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
      const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);
      return [t.roundX + rotX, t.roundY - rotY];
    };

    // Outer layout shape
    const pts = [
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
    ];
    const polyStr = pts.map(p => `${p[0]},${p[1]}`).join(' ');

    // CA site
    const caPts = [
      toPx(-193.5, 63.84), toPx(-6.0, 63.84),
      toPx(-6.0, 89.52), toPx(-193.5, 89.52),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    // Park
    const parkPts = [
      toPx(3.0, 66.80), toPx(136.5, 66.80),
      toPx(136.5, 94.68), toPx(3.0, 94.68),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    // South boundary line of bottom plots (minY = -51.3)
    const sStart = toPx(-193.5, -51.3);
    const sEnd = toPx(175.79, -51.3);

    // East boundary line of 18m road (maxX = 175.79)
    const eStart = toPx(175.79, -51.3);
    const eEnd = toPx(175.79, 94.68);

    // West boundary line (minX = -220.5)
    const wStart = toPx(-220.5, -51.3);
    const wEnd = toPx(-220.5, -4.61);

    // Main East-West Road (Y = 0)
    const rStart = toPx(-220.5, 0);
    const rEnd = toPx(175.79, 0);

    const svg = `<svg width="2000" height="1400" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-1400, -1400)">
        <!-- Outer layout polygon -->
        <polygon points="${polyStr}" fill="rgba(30, 144, 255, 0.15)" stroke="#00d4ff" stroke-width="2.5"/>
        <!-- CA Site -->
        <polygon points="${caPts}" fill="rgba(240, 230, 200, 0.4)" stroke="#e6c280" stroke-width="2"/>
        <text x="${toPx(-100, 76)[0]}" y="${toPx(-100, 76)[1]}" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">CA Site</text>
        <!-- Park -->
        <polygon points="${parkPts}" fill="rgba(60, 200, 80, 0.4)" stroke="#22c55e" stroke-width="2"/>
        <text x="${toPx(70, 80)[0]}" y="${toPx(70, 80)[1]}" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">Park</text>
        <!-- South Wall Highlight -->
        <line x1="${sStart[0]}" y1="${sStart[1]}" x2="${sEnd[0]}" y2="${sEnd[1]}" stroke="#ff3366" stroke-width="4"/>
        <!-- East Wall Highlight -->
        <line x1="${eStart[0]}" y1="${eStart[1]}" x2="${eEnd[0]}" y2="${eEnd[1]}" stroke="#ff3366" stroke-width="4"/>
        <!-- Main East-West Road -->
        <line x1="${rStart[0]}" y1="${rStart[1]}" x2="${rEnd[0]}" y2="${rEnd[1]}" stroke="#ffff00" stroke-width="3" stroke-dasharray="8,4"/>
        <!-- Roundabout -->
        <circle cx="${toPx(0, 0)[0]}" cy="${toPx(0, 0)[1]}" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
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

testPreciseOverlay().catch(console.error);
