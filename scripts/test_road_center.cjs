const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function testRoadCenter() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Real site:
  // Central horizontal road in image is at Y ≈ 2060
  // Central vertical road in image is at X ≈ 2520
  //
  // In 3D model, (0, 0) is the center of the roundabout (intersection of central roads).
  // Therefore, in the image, 3D point (0, 0) MUST land on (2520, 2060)!
  //
  // Since image center is (2176, 2176):
  // 3D (0, 0) offset in image pixels = (2520 - 2176, 2060 - 2176) = (+344 px, -116 px)
  // In meters (3.4699 px/m):
  // Offset of (0,0) in meters = (+344 / 3.4699, -116 / 3.4699) = (+99.14 m, -33.43 m)
  //
  // In Three.js:
  // - 3D X: +99.14 m
  // - 3D Z: +33.43 m (since image -Y is 3D -Z, so ground offset in Z is +33.43m or texture offset)
  
  const configs = [
    { name: 'match_v1', roundX_px: 2515, roundY_px: 2065, scale: 0.975, rotDeg: 0 },
    { name: 'match_v2', roundX_px: 2520, roundY_px: 2055, scale: 0.965, rotDeg: -0.2 },
    { name: 'match_v3', roundX_px: 2525, roundY_px: 2060, scale: 0.960, rotDeg: 0.2 },
  ];

  for (const cfg of configs) {
    const toPx = (x, y) => {
      const rx = x * 3.4699 * cfg.scale;
      const ry = y * 3.4699 * cfg.scale; // 2D y is North
      const rad = (cfg.rotDeg * Math.PI) / 180;
      const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
      const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);
      // cfg.roundX_px and cfg.roundY_px is (0,0)
      return [cfg.roundX_px + rotX, cfg.roundY_px - rotY];
    };

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
      toPx(-193.5, 63.84),
      toPx(-6.0, 63.84),
      toPx(-6.0, 89.52),
      toPx(-193.5, 89.52),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    // Park
    const parkPts = [
      toPx(3.0, 66.80),
      toPx(136.5, 66.80),
      toPx(136.5, 94.68),
      toPx(3.0, 94.68),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    // Left park
    const leftParkPts = [
      toPx(-220.5, -51.3),
      toPx(-193.5, -51.3),
      toPx(-193.5, -4.61),
      toPx(-220.5, -4.61),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    // Main East-West Road
    const rStart = toPx(-220.5, 0);
    const rEnd = toPx(175.79, 0);

    // Main North-South Road
    const vStart = toPx(0, -51.3);
    const vEnd = toPx(0, 94.68);

    const svg = `<svg width="2000" height="1400" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-1400, -1400)">
        <!-- Outer layout -->
        <polygon points="${polyStr}" fill="rgba(0, 150, 255, 0.12)" stroke="#00d4ff" stroke-width="3"/>
        <!-- CA Site -->
        <polygon points="${caPts}" fill="rgba(240, 230, 200, 0.4)" stroke="#e6c280" stroke-width="2"/>
        <text x="${toPx(-100, 76)[0]}" y="${toPx(-100, 76)[1]}" fill="#ffffff" font-size="22" font-weight="bold" text-anchor="middle">CA Site</text>
        <!-- Park -->
        <polygon points="${parkPts}" fill="rgba(60, 200, 80, 0.4)" stroke="#22c55e" stroke-width="2"/>
        <text x="${toPx(70, 80)[0]}" y="${toPx(70, 80)[1]}" fill="#ffffff" font-size="22" font-weight="bold" text-anchor="middle">Park</text>
        <!-- Left Park -->
        <polygon points="${leftParkPts}" fill="rgba(60, 200, 80, 0.4)" stroke="#22c55e" stroke-width="2"/>
        <!-- Main East-West Road -->
        <line x1="${rStart[0]}" y1="${rStart[1]}" x2="${rEnd[0]}" y2="${rEnd[1]}" stroke="#ffff00" stroke-width="3" stroke-dasharray="8,4"/>
        <!-- Main North-South Road -->
        <line x1="${vStart[0]}" y1="${vStart[1]}" x2="${vEnd[0]}" y2="${vEnd[1]}" stroke="#00ffff" stroke-width="3" stroke-dasharray="8,4"/>
        <!-- Roundabout -->
        <circle cx="${toPx(0, 0)[0]}" cy="${toPx(0, 0)[1]}" r="14" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
      </g>
    </svg>`;

    const overlayBuf = Buffer.from(svg);
    const outPath = path.join(__dirname, `${cfg.name}.jpg`);
    await sharp(mapPath)
      .extract({ left: 1400, top: 1400, width: 2000, height: 1400 })
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toFile(outPath);

    console.log(`Saved ${cfg.name}.jpg`);
  }
}

testRoadCenter().catch(console.error);
