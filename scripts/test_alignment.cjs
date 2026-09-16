const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function testAlignment() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Real site bounds in pixels:
  // Left: 1845, Right: 3180, Top: 1790 (east part) / 1900 (west part), Bottom: 2330
  // Center: X = 2512.5, Y = 2060
  // Image Center: X = 2176, Y = 2176
  // Shift needed: dX = 2512.5 - 2176 = +336.5 px, dY = 2060 - 2176 = -116 px

  // Let's create an SVG outline of the 3D layout transformed to the image pixel coordinates:
  // 3D coordinates in meters:
  // Layout bounds: X from -220.5 to +175.79 (width 396.3m)
  // Layout bounds: Y (in 2D) from -51.30 to +94.68 (height 146.0m)
  // Layout center: X = -22.355, Y = +21.69
  //
  // Scale factor: meters to pixels = 1 / 0.28819 = 3.4699 px/meter.
  // If scale is adjusted: s
  // Rotation angle: theta (in degrees)
  
  // Let's test a few candidate offsets and overlay them directly on the cropped image:
  const configs = [
    { name: 'align_v1', shiftX_m: 97.0, shiftY_m: -33.4, scale: 0.98, rotDeg: 0 },
    { name: 'align_v2', shiftX_m: 98.5, shiftY_m: -32.0, scale: 0.975, rotDeg: -0.5 },
    { name: 'align_v3', shiftX_m: 99.0, shiftY_m: -30.0, scale: 0.97, rotDeg: 0.5 },
  ];

  for (const cfg of configs) {
    // Center in pixels:
    // In image: X = 2176 + cfg.shiftX_m * 3.4699
    //           Y = 2176 + cfg.shiftY_m * 3.4699 (since image Y is positive downwards, South)
    const sitePxX = 2176 + cfg.shiftX_m * 3.4699;
    const sitePxY = 2176 + cfg.shiftY_m * 3.4699; // in 3D, positive Y in 2D shape is North (-Y in image)
    
    // In 3D shape, 2D +Y is North, which is -Y in image!
    // So for a point (x, y) in 3D layout:
    // pxX = sitePxX + (x - (-22.355)) * 3.4699 * cfg.scale
    // pxY = sitePxY - (y - (+21.69)) * 3.4699 * cfg.scale
    
    // Let's draw key boundaries:
    // Outer road:
    // minX = -220.5, maxX = 175.79, minY = -51.30, maxY = 94.68
    const toPx = (x, y) => {
      const rx = (x - (-22.355)) * 3.4699 * cfg.scale;
      const ry = (y - (+21.69)) * 3.4699 * cfg.scale;
      // apply rotation
      const rad = (cfg.rotDeg * Math.PI) / 180;
      const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
      const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);
      return [sitePxX + rotX, sitePxY - rotY];
    };

    const p1 = toPx(-220.5, -51.3);
    const p2 = toPx(175.79, -51.3);
    const p3 = toPx(175.79, 94.68);
    const p4 = toPx(3.0, 94.68);
    const p5 = toPx(3.0, 63.84);
    const p6 = toPx(-193.5, 63.84);
    const p7 = toPx(-193.5, -4.61);
    const p8 = toPx(-220.5, -4.61);

    // Center horizontal road line: Y = 0
    const rStart = toPx(-220.5, 0);
    const rEnd = toPx(175.79, 0);
    
    // Center vertical road line: X = 0
    const vStart = toPx(0, -51.3);
    const vEnd = toPx(0, 94.68);

    const svg = `<svg width="2000" height="1400" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-1400, -1400)">
        <!-- Outline of 3D layout -->
        <polygon points="${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]} ${p6[0]},${p6[1]} ${p7[0]},${p7[1]} ${p8[0]},${p8[1]}" 
          fill="rgba(0, 255, 128, 0.2)" stroke="#00ff88" stroke-width="4"/>
        <!-- Main East-West Road -->
        <line x1="${rStart[0]}" y1="${rStart[1]}" x2="${rEnd[0]}" y2="${rEnd[1]}" stroke="#ffff00" stroke-width="4" stroke-dasharray="10,5"/>
        <!-- Main North-South Road -->
        <line x1="${vStart[0]}" y1="${vStart[1]}" x2="${vEnd[0]}" y2="${vEnd[1]}" stroke="#00ffff" stroke-width="4" stroke-dasharray="10,5"/>
        <!-- Roundabout center -->
        <circle cx="${toPx(0, 0)[0]}" cy="${toPx(0, 0)[1]}" r="15" fill="red" stroke="white" stroke-width="3"/>
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

testAlignment().catch(console.error);
