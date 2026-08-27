const sharp = require('sharp');
const path = require('path');

async function measureExactLandmarkCorners() {
  const mapPath = path.join(__dirname, '..', 'public', 'satellite_map.jpg');
  
  // Let's inspect the exact pixel coordinates of the compound wall corners in satellite_map.jpg:
  // On the satellite image:
  // North wall behind Park: runs from around X=2400, Y=1800 to X=3240, Y=1815
  // East wall: runs from X=3240, Y=1815 down to X=3220, Y=2330
  // South wall: runs from X=3220, Y=2330 left to X=1860, Y=2310
  // West wall: runs from X=1860, Y=2310 up to X=1875, Y=1930
  
  // Let's test exact mathematical calibration:
  // North-South height of compound wall = 2320 - 1805 = 515 px.
  // East-West width of compound wall = 3230 - 1865 = 1365 px.
  
  // In 3D layout:
  // Total layout width = 175.79 - (-220.50) = 396.29 m.
  // Total layout height = 94.64 - (-51.26) = 145.90 m.
  
  // Aspect ratio in 3D = 396.29 / 145.90 = 2.716
  // Aspect ratio on ground = 1365 / 515 = 2.650
  
  // The angle of the south wall:
  // From (1865, 2310) to (3220, 2330):
  // dX = 1355, dY = 20 -> angle = atan2(20, 1355) = +0.846 degrees = +0.01476 rad.
  
  // The angle of the north wall:
  // From (2050, 1800) to (3240, 1818):
  // dX = 1190, dY = 18 -> angle = atan2(18, 1190) = +0.866 degrees = +0.0151 rad.
  
  // So the physical land has a tilt of ~0.86 degrees (0.015 rad)!
  // To make the layout horizontal and align with this wall:
  // rotationOffset = 0.0150 rad (0.86 deg).
  
  // Center of compound box:
  // X_mid = (1865 + 3230) / 2 = 2547.5 px
  // Y_mid = (1805 + 2320) / 2 = 2062.5 px
  
  // In 3D layout, the center is:
  // X_layout_mid = (-220.50 + 175.79) / 2 = -22.355 m
  // Z_layout_mid = (94.64 + (-51.26)) / 2 = +21.69 m (in Z, up is negative, so Z_mid = -21.69)
  
  // Ground scale:
  // Layout width = 396.29 m -> corresponds to 1365 px
  // Meters per pixel = 396.29 / 1365 = 0.29032 m/px
  // Total ground size (4352 px) = 4352 * 0.29032 = 1263.47 m
  // Base ground size is 1254.2 m -> scale = 1263.47 / 1254.2 = 1.0074
  
  // Since 3D origin (0,0) corresponds to:
  // dx_from_mid = 0 - (-22.355) = +22.355 m -> +77 px in X -> X_origin_px = 2547.5 + 77 = 2624.5 px
  // dz_from_mid = 0 - (-21.69) = +21.69 m -> +74 px in Y -> Y_origin_px = 2062.5 - 74 = 1988.5 px
  
  // Therefore positionOffset of ground mesh:
  // posX = - (X_origin_px - 2176) * 0.29032 = - (2624.5 - 2176) * 0.29032 = - 448.5 * 0.29032 = -130.2 m
  // posZ = - (Y_origin_px - 2176) * 0.29032 = - (1988.5 - 2176) * 0.29032 = - (-187.5) * 0.29032 = +54.4 m
  
  console.log('Mathematical calibration calculation ready.');
}

measureExactLandmarkCorners().catch(console.error);
