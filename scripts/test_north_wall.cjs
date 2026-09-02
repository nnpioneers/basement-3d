const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function testNorthWallFitting() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Calibrated ground center from align_opt_3
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

  // Let's test different heights and shapes for CA Site and Park:
  // Option A: Clean straight top wall matching the physical north wall
  // Option B: Adjusted Y heights (e.g. Park Y = 94.68 straight, CA site Y = 89.5 straight or slight taper)

  const tests = [
    { 
      name: 'north_v1',
      caTopLeftY: 89.5, caTopRightY: 89.5, caLeftX: -106.5, caRightX: -6.0,
      parkTopLeftY: 94.5, parkTopRightY: 94.5, parkLeftX: 3.0, parkRightX: 136.5
    },
    { 
      name: 'north_v2',
      caTopLeftY: 90.5, caTopRightY: 90.5, caLeftX: -106.5, caRightX: -6.0,
      parkTopLeftY: 94.0, parkTopRightY: 94.5, parkLeftX: 3.0, parkRightX: 136.5
    },
    { 
      name: 'north_v3',
      caTopLeftY: 91.0, caTopRightY: 91.0, caLeftX: -106.5, caRightX: -6.0,
      parkTopLeftY: 94.8, parkTopRightY: 94.8, parkLeftX: 3.0, parkRightX: 136.5
    },
  ];

  for (const t of tests) {
    // CA Site rect:
    const ca = [
      toPx(t.caLeftX, 63.80),
      toPx(t.caRightX, 63.80),
      toPx(t.caRightX, t.caTopRightY),
      toPx(t.caLeftX, t.caTopLeftY),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    // Park rect:
    const park = [
      toPx(t.parkLeftX, 66.80),
      toPx(t.parkRightX, 66.80),
      toPx(t.parkRightX, t.parkTopRightY),
      toPx(t.parkLeftX, t.parkTopLeftY),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    const svg = `<svg width="2000" height="800" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-1400, -1600)">
        <!-- CA Site -->
        <polygon points="${ca}" fill="rgba(240, 230, 200, 0.6)" stroke="#e6c280" stroke-width="2.5"/>
        <text x="${toPx((t.caLeftX+t.caRightX)/2, 76)[0]}" y="${toPx((t.caLeftX+t.caRightX)/2, 76)[1]}" fill="#111" font-size="20" font-weight="bold" text-anchor="middle">CA Site</text>
        
        <!-- Park -->
        <polygon points="${park}" fill="rgba(46, 125, 50, 0.6)" stroke="#22c55e" stroke-width="2.5"/>
        <text x="${toPx((t.parkLeftX+t.parkRightX)/2, 80)[0]}" y="${toPx((t.parkLeftX+t.parkRightX)/2, 80)[1]}" fill="#fff" font-size="22" font-weight="bold" text-anchor="middle">Park</text>
        
        <!-- Top Wall guide line -->
        <line x1="${toPx(-106.5, t.caTopLeftY)[0]}" y1="${toPx(-106.5, t.caTopLeftY)[1]}" 
              x2="${toPx(-6.0, t.caTopRightY)[0]}" y2="${toPx(-6.0, t.caTopRightY)[1]}" stroke="#ff0055" stroke-width="3"/>
        <line x1="${toPx(3.0, t.parkTopLeftY)[0]}" y1="${toPx(3.0, t.parkTopLeftY)[1]}" 
              x2="${toPx(136.5, t.parkTopRightY)[0]}" y2="${toPx(136.5, t.parkTopRightY)[1]}" stroke="#ff0055" stroke-width="3"/>
      </g>
    </svg>`;

    const overlayBuf = Buffer.from(svg);
    const outPath = path.join(__dirname, `${t.name}.jpg`);
    await sharp(mapPath)
      .extract({ left: 1400, top: 1600, width: 2000, height: 800 })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toFile(outPath);

    console.log(`Saved ${t.name}.jpg`);
  }
}

testNorthWallFitting().catch(console.error);
