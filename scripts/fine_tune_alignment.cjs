const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function fineTuneAlignment() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Real site center shift in meters:
  // In Three.js:
  // Layout center X: -22.355 m
  // Layout center Z: -21.69 m
  
  // Best shift parameters to test
  const configs = [
    { name: 'fine_v1', shiftX_m: 97.2, shiftZ_m: -32.5, scale: 0.985, rotDeg: -0.2 },
    { name: 'fine_v2', shiftX_m: 97.5, shiftZ_m: -31.5, scale: 0.990, rotDeg: 0.0 },
    { name: 'fine_v3', shiftX_m: 96.8, shiftZ_m: -32.0, scale: 0.980, rotDeg: -0.3 },
  ];

  for (const cfg of configs) {
    const sitePxX = 2176 + cfg.shiftX_m * 3.4699;
    const sitePxY = 2176 - cfg.shiftZ_m * 3.4699; // In 3D, -Z is North (-Y in image), +Z is South (+Y in image)
    
    const toPx = (x, y) => {
      const rx = (x - (-22.355)) * 3.4699 * cfg.scale;
      const ry = (y - (+21.69)) * 3.4699 * cfg.scale;
      const rad = (cfg.rotDeg * Math.PI) / 180;
      const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
      const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);
      return [sitePxX + rotX, sitePxY - rotY];
    };

    // Outer layout shape including CA site and Park
    // CA Site: x from -193.5 to -6.0, y from 63.84 to 89.52
    // Park: x from 3.0 to 136.5, y from 66.80 to 94.68
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

    // CA site rect
    const caPts = [
      toPx(-193.5, 63.84),
      toPx(-6.0, 63.84),
      toPx(-6.0, 89.52),
      toPx(-193.5, 89.52),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    // Park rect
    const parkPts = [
      toPx(3.0, 66.80),
      toPx(136.5, 66.80),
      toPx(136.5, 94.68),
      toPx(3.0, 94.68),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    // Left park rect
    const leftParkPts = [
      toPx(-220.5, -51.3),
      toPx(-193.5, -51.3),
      toPx(-193.5, -4.61),
      toPx(-220.5, -4.61),
    ].map(p => `${p[0]},${p[1]}`).join(' ');

    // Main East-West Road
    const rStart = toPx(-220.5, 0);
    const rEnd = toPx(175.79, 0);

    const svg = `<svg width="2000" height="1400" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-1400, -1400)">
        <!-- Outer layout -->
        <polygon points="${polyStr}" fill="rgba(0, 150, 255, 0.15)" stroke="#00d4ff" stroke-width="3"/>
        <!-- CA Site -->
        <polygon points="${caPts}" fill="rgba(240, 230, 200, 0.45)" stroke="#e6c280" stroke-width="2"/>
        <text x="${toPx(-100, 76)[0]}" y="${toPx(-100, 76)[1]}" fill="#ffffff" font-size="22" font-weight="bold" text-anchor="middle">CA Site</text>
        <!-- Park -->
        <polygon points="${parkPts}" fill="rgba(60, 200, 80, 0.45)" stroke="#22c55e" stroke-width="2"/>
        <text x="${toPx(70, 80)[0]}" y="${toPx(70, 80)[1]}" fill="#ffffff" font-size="22" font-weight="bold" text-anchor="middle">Park</text>
        <!-- Left Park -->
        <polygon points="${leftParkPts}" fill="rgba(60, 200, 80, 0.45)" stroke="#22c55e" stroke-width="2"/>
        <!-- Main East-West Road -->
        <line x1="${rStart[0]}" y1="${rStart[1]}" x2="${rEnd[0]}" y2="${rEnd[1]}" stroke="#ffff00" stroke-width="3" stroke-dasharray="8,4"/>
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

fineTuneAlignment().catch(console.error);
