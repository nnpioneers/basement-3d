const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function calibrateGroundFit() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Real Physical Ground Landmark Pixels on satellite_map.jpg (4352x4352):
  // 1. South Compound Wall:
  //    - South-West corner (near entrance): (1860, 2335)
  //    - South-East corner (near 18m road): (3190, 2325)
  // 2. North Compound Wall:
  //    - North-West (behind CA Site): (2210, 1805)
  //    - North-East (behind Park): (2980, 1790)
  // 3. East Wall (18m road): (3195, 1785) to (3190, 2325)
  // 4. West Entrance: (1855, 2335) to (1855, 2180)
  // 5. Central Road junction / roundabout: (2535, 2115)

  // 3D Layout Blueprint Key Coordinates:
  // - South boundary of bottom plots: Y = -51.26
  // - North boundary of CA Site: Y = 89.48 (at X = -106.5 to -6.0)
  // - North boundary of Park: Y = 94.64 (at X = 3.0 to 136.5)
  // - East boundary of 18m road: X = 175.79
  // - West boundary of Plots 001-006 / Left Park: X = -220.5
  // - Roundabout: (0, 21.65)

  // Let's generate a set of visual test options:
  const configs = [
    { name: 'fit_exact_1', roundX: 2542, roundY: 2112, scaleX: 0.945, scaleY: 0.990, rotDeg: 0.45 },
    { name: 'fit_exact_2', roundX: 2540, roundY: 2110, scaleX: 0.950, scaleY: 0.985, rotDeg: 0.50 },
    { name: 'fit_exact_3', roundX: 2538, roundY: 2108, scaleX: 0.955, scaleY: 0.980, rotDeg: 0.55 },
    { name: 'fit_exact_4', roundX: 2542, roundY: 2115, scaleX: 0.950, scaleY: 0.995, rotDeg: 0.40 },
    { name: 'fit_exact_5', roundX: 2545, roundY: 2112, scaleX: 0.940, scaleY: 0.990, rotDeg: 0.50 },
    { name: 'fit_exact_6', roundX: 2538, roundY: 2114, scaleX: 0.960, scaleY: 0.985, rotDeg: 0.45 },
  ];

  for (const c of configs) {
    const toPx = (x, y) => {
      const rx = x * 3.4699 * c.scaleX;
      const ry = y * 3.4699 * c.scaleY;
      const rad = (c.rotDeg * Math.PI) / 180;
      const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
      const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);
      return [c.roundX + rotX, c.roundY - rotY];
    };

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
        <polygon points="${pts}" fill="rgba(0, 150, 255, 0.12)" stroke="#00ffff" stroke-width="3"/>
        <polygon points="${caPts}" fill="rgba(240, 230, 200, 0.45)" stroke="#e6c280" stroke-width="2"/>
        <polygon points="${parkPts}" fill="rgba(46, 125, 50, 0.5)" stroke="#22c55e" stroke-width="2"/>
        <polygon points="${leftParkPts}" fill="rgba(46, 125, 50, 0.5)" stroke="#22c55e" stroke-width="2"/>
        <!-- South Line -->
        <line x1="${toPx(-193.5, -51.26)[0]}" y1="${toPx(-193.5, -51.26)[1]}" x2="${toPx(175.79, -51.26)[0]}" y2="${toPx(175.79, -51.26)[1]}" stroke="#ff0055" stroke-width="3"/>
        <!-- East Line -->
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
      .extract({ left: 1400, top: 1400, width: 2000, height: 1400 })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toFile(outPath);

    console.log(`Saved ${c.name}.jpg`);
  }
}

calibrateGroundFit().catch(console.error);
