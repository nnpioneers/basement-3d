const sharp = require('sharp');
const path = require('path');

async function testGridAlignment() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // We want to test different combinations of:
  // - posX (in Three.js world meters)
  // - posZ (in Three.js world meters)
  // - groundWidth, groundHeight (or scale factor)
  // - rotDeg

  // In Three.js:
  // Layout Origin (0,0,0) is at roundabout.
  // Ground plane center is at (posX, 0, posZ).
  // Ground plane has dimensions (W, H).
  // Texture is mapped onto (W, H). Texture center (2176, 2176) is at ground center (posX, posZ).
  // At zoom 19, 4352 px corresponds to physical ground size.
  // When mesh has planeGeometry args=[W, H]:
  // Pixel (px, py) on texture corresponds to world position:
  // u = px / 4352 - 0.5; v = 0.5 - py / 4352;
  // Local (lx, ly) on plane = (u * W, v * H);
  // Rotated by rotDeg:
  // (rx, rz) = (lx * cos(rad) + ly * sin(rad), -lx * sin(rad) + ly * cos(rad)) [since Three.js ground is in X-Z]
  // World pos = (posX + rx, posZ - rz);

  // Conversely, given world point (wx, wz) of 3D layout:
  // We can project 3D layout points onto the 4352x4352 satellite texture!
  // dx = wx - posX; dz = wz - posZ;
  // Unrotate by -rotDeg:
  // lx = dx * cos(rad) - dz * sin(rad)
  // lz = dx * sin(rad) + dz * cos(rad)  (where lz is in -Z direction, corresponding to +ly)
  // ly = -lz
  // u = lx / W; v = ly / H;
  // px = (u + 0.5) * 4352; py = (0.5 - v) * 4352;

  const testCases = [
    { name: 'align_grid_A1', posX: -94, posZ: 7, W: 1254.2 * 1.02, H: 1254.2 * 1.02, rotDeg: 0.5 },
    { name: 'align_grid_A2', posX: -90, posZ: 7, W: 1254.2 * 1.02, H: 1254.2 * 1.02, rotDeg: 0.5 },
    { name: 'align_grid_A3', posX: -86, posZ: 7, W: 1254.2 * 1.02, H: 1254.2 * 1.02, rotDeg: 0.5 },
    { name: 'align_grid_B1', posX: -94, posZ: 3, W: 1254.2 * 1.02, H: 1254.2 * 1.02, rotDeg: 0.5 },
    { name: 'align_grid_B2', posX: -90, posZ: 3, W: 1254.2 * 1.02, H: 1254.2 * 1.02, rotDeg: 0.5 },
    { name: 'align_grid_B3', posX: -86, posZ: 3, W: 1254.2 * 1.02, H: 1254.2 * 1.02, rotDeg: 0.5 },
    { name: 'align_grid_C1', posX: -92, posZ: 0, W: 1254.2 * 1.03, H: 1254.2 * 1.03, rotDeg: 0.6 },
    { name: 'align_grid_C2', posX: -88, posZ: 0, W: 1254.2 * 1.03, H: 1254.2 * 1.03, rotDeg: 0.6 },
    { name: 'align_grid_C3', posX: -84, posZ: 0, W: 1254.2 * 1.03, H: 1254.2 * 1.03, rotDeg: 0.6 },
    { name: 'align_grid_D1', posX: -90, posZ: -4, W: 1254.2 * 1.04, H: 1254.2 * 1.04, rotDeg: 0.5 },
    { name: 'align_grid_D2', posX: -86, posZ: -4, W: 1254.2 * 1.04, H: 1254.2 * 1.04, rotDeg: 0.5 },
    { name: 'align_grid_D3', posX: -82, posZ: -4, W: 1254.2 * 1.04, H: 1254.2 * 1.04, rotDeg: 0.5 },
  ];

  for (const tc of testCases) {
    const rad = (tc.rotDeg * Math.PI) / 180;
    
    const project3DToTexPx = (wx, wz) => {
      const dx = wx - tc.posX;
      const dz = wz - tc.posZ;
      // In Three.js: ground plane mesh rotation=[-Math.PI/2, 0, rotOffset]
      // A vertex at local (lx, ly) on plane:
      // rotated around Z by rotOffset: x' = lx*cos - ly*sin, y' = lx*sin + ly*cos
      // then Rx(-PI/2): world X = x', world Y = 0, world Z = -y'
      // So:
      // dx = lx * Math.cos(rad) - ly * Math.sin(rad)
      // -dz = lx * Math.sin(rad) + ly * Math.cos(rad)
      // Solving for lx and ly:
      // lx = dx * Math.cos(rad) - dz * Math.sin(rad)
      // ly = -dx * Math.sin(rad) - dz * Math.cos(rad)
      const lx = dx * Math.cos(rad) - dz * Math.sin(rad);
      const ly = -dx * Math.sin(rad) - dz * Math.cos(rad);

      const u = lx / tc.W;
      const v = ly / tc.H;
      const px = (u + 0.5) * 4352;
      const py = (0.5 - v) * 4352;
      return [px, py];
    };

    // 3D Layout Coordinates:
    // In Three.js:
    // 2D Shape (x, y) becomes 3D (x, 0, -y)
    // So wx = x, wz = -y
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
  console.log('All grid tests generated!');
}

testGridAlignment().catch(console.error);
