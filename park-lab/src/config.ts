// ============================================================
// CENTRALIZED PARK PARAMETERS — reference image driven
// ============================================================
export const parkConfig = {
  // Extended ground — wide enough to show tree perimeter outside track
  groundWidth: 180,
  groundDepth: 62,

  // Inner green lawn (inside the track)
  lawnWidth: 130,
  lawnDepth: 30,

  // Outer track dimensions
  parkWidth: 136,       // outer edge of track loop
  parkDepth: 34,        // outer edge of track loop
  trackInset: 0,        // track starts at edge
  trackWidth: 3.0,      // width of track strip
  trackCornerRadius: 9, // fully rounded ends

  // Path widths
  mainPathWidth: 2.4,
  secondaryPathWidth: 1.8,
  spurPathWidth: 1.2,

  // ── MONUMENT AREA (left-center) ──────────────────────────
  // Reference: large circular plaza, obelisk, 4+ radial spurs
  monumentCX: -33,
  monumentCZ: 0,
  monumentPlazaR: 8.5,     // paved circle radius
  monumentRingR: 10,       // outer circulation ring radius
  monumentRingW: 2.0,
  monumentPlatformH: 0.7,
  monumentSteps: 3,

  // ── WATER BODY (top-center, ABOVE axis) ──────────────────
  // Reference: circular pond, top half of park, left of center
  waterCX: -4,
  waterCZ: -8,             // NORTH of center line (negative = north)
  waterR: 4.5,             // nearly circular

  // ── CAMPFIRE AREA (between water body and gazebo) ────────
  campfireCX: 11.5,
  campfireCZ: -3,

  // ── PLAYGROUND (bottom-center, BELOW axis) ───────────────
  // Reference: orange rubber surface, center-left of park
  playCX: -1,
  playCZ: 10,              // SOUTH of center line
  playRadius: 5.0,

  // ── GYM ZONE (top, near water body) ──────────────────────
  gymCX: -18,
  gymCZ: -8,               // NORTH, left of water body
  gymRadius: 4.0,

  // ── GAZEBO (right-center) ─────────────────────────────────
  // Reference: octagonal pavilion, right side, centered vertically
  gazeboCX: 28,
  gazeboCZ: 0,
  gazeboRingR: 9.5,        // outer circulation ring
  gazeboRingW: 2.0,
  gazeboColumns: 8,
  gazeboRadius: 4.8,       // column placement radius
  gazeboRoofH: 5.0,
  gazeboPlatformH: 0.6,

  // ── PERGOLA (far right) ───────────────────────────────────
  pergolaCX: 52,
  pergolaCZ: 0,
  pergolaLength: 20,
  pergolaWidth: 5,
  pergolaColumns: 7,
  pergolaH: 4.5,
};
