import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Text, Line } from '@react-three/drei';
import { registerPlotPosition } from '../data/plotLookup';
import type { PlotStatus } from '../types/plot';

export type PlotSpec = {
  id: number;
  depthB: number;
  depthT: number;
  frontage: number;
};

const extrudeSettings = {
  steps: 1,
  depth: 0.1,
  bevelEnabled: false,
};

function formatDimension(val: number): string {
  return Math.abs(val - Math.round(val)) < 0.05
    ? `${Math.round(val)} m`
    : `${val.toFixed(1)} m`;
}

const geomCache = new Map<string, THREE.ExtrudeGeometry>();

function getPlotGeom(plot: PlotSpec) {
  const key = `${plot.depthB}_${plot.depthT}_${plot.frontage}`;
  if (!geomCache.has(key)) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0, plot.frontage);
    s.lineTo(-plot.depthT, plot.frontage);
    s.lineTo(-plot.depthB, 0);
    s.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(s, extrudeSettings);
    geomCache.set(key, g);
  }
  return geomCache.get(key)!;
}

const matCache: Record<string, THREE.MeshStandardMaterial> = {};
function getPlotMaterial(color: string) {
  if (!matCache[color]) {
    matCache[color] = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.0,
    });
  }
  return matCache[color];
}

const commonTextProps = {
  characters: '0123456789. m' + String.fromCharCode(178) + 'ftSOLD',
  matrixAutoUpdate: false,
  onUpdate: (c: any) => c.updateMatrix(),
  raycast: () => null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Geometry helpers for true parallel-offset outline
// ─────────────────────────────────────────────────────────────────────────────

/** Normalised perpendicular (left-hand normal) of a 2-D segment a→b. */
function edgeNormal(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  // left-hand normal for a CCW polygon = outward normal for CW polygon
  return { nx: dy / len, ny: -dx / len };
}

/**
 * Given 4 vertices of the plot (CCW or CW in 2-D XY), compute the parallel-
 * offset polygon that sits `gap` units outside every edge. Uses line–line
 * intersection of adjacent offset edges to get exact miter corners.
 */
function parallelOffset(
  verts: [number, number][],
  gap: number,
  z: number
): THREE.Vector3[] {
  const n = verts.length;
  // Compute outward normals for each edge
  const normals: { nx: number; ny: number }[] = [];
  for (let i = 0; i < n; i++) {
    const [ax, ay] = verts[i];
    const [bx, by] = verts[(i + 1) % n];
    normals.push(edgeNormal(ax, ay, bx, by));
  }
  // For each vertex, intersect the two adjacent offset lines to get the
  // miter corner. If edges are nearly parallel, fall back to bisector.
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const [px, py] = verts[i];
    const prev = normals[(i + n - 1) % n];
    const curr = normals[i];
    // Bisector direction (average of two normals)
    const bx = prev.nx + curr.nx;
    const by = prev.ny + curr.ny;
    const bl = Math.hypot(bx, by);
    // Miter scale = gap / cos(half-angle) = gap * |bisector| / (n1 . bisector)
    const dot = prev.nx * bx + prev.ny * by;
    const scale = bl < 0.001 ? gap : (gap * bl) / dot;
    const maxMiter = gap * 3.5; // clamp to avoid extreme miters on sharp corners
    const s = Math.min(scale, maxMiter);
    out.push(new THREE.Vector3(px + (bx / bl) * s, py + (by / bl) * s, z));
  }
  // Close the loop
  out.push(out[0].clone());
  return out;
}

/** Midpoint of an edge, offset outward along the edge normal by `dist`. */
function edgeMidOutward(
  ax: number, ay: number,
  bx: number, by: number,
  dist: number
): [number, number] {
  const { nx, ny } = edgeNormal(ax, ay, bx, by);
  return [(ax + bx) / 2 + nx * dist, (ay + by) / 2 + ny * dist];
}

// ─────────────────────────────────────────────────────────────────────────────

const WHITE_OUTLINE_Z  = 0.25;   // z-height for the white outline line
const DIM_LABEL_OFFSET = 1.9;    // world units outside the plot for dim labels
const LABEL_Z          = 0.50;   // z-height for all text labels

const InteractivePlotComponent = ({
  plot,
  x,
  y,
  isSelected,
  onClick,
  status = 'available',
}: {
  plot: PlotSpec;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: (id: number, worldPos: [number, number, number]) => void;
  status?: PlotStatus;
}) => {
  const { geom, metrics, worldPos, innerLine, outerLine, dimAnchors } =
    useMemo(() => {
      const g = getPlotGeom(plot);

      // ── Area ──────────────────────────────────────────────────────────────
      const areaSqM   = ((plot.depthB + plot.depthT) / 2) * plot.frontage;
      const areaSqFt  = areaSqM * 10.7639;

      const fmtM2 = Math.abs(areaSqM - Math.round(areaSqM)) < 0.05
        ? `${Math.round(areaSqM)} m` + String.fromCharCode(178)
        : `${areaSqM.toFixed(1)} m` + String.fromCharCode(178);

      const fmtFt2 = `${areaSqFt.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ft` + String.fromCharCode(178);

      // ── Plot corners in local 2-D space (CCW = bottom-right → top-right → top-left → bottom-left) ──
      // Shape: moveTo(0,0) → (0,F) → (-dT,F) → (-dB,0) → close
      const corners: [number, number][] = [
        [0,          0          ],  // 0  bottom-right (road side)
        [0,          plot.frontage],  // 1  top-right
        [-plot.depthT, plot.frontage],  // 2  top-left
        [-plot.depthB, 0          ],  // 3  bottom-left
      ];

      // ── Inner black border (exact plot boundary) ───────────────────────
      const inner = corners.map(([cx, cy]) => new THREE.Vector3(cx, cy, 0.16));
      inner.push(inner[0].clone()); // close

      // ── Outer white selection border (true parallel offset) ────────────
      const outer = parallelOffset(corners, 0.55, WHITE_OUTLINE_Z);

      // ── Dimension label anchor points + rotation angles ─────────────────
      // Each anchor: {x, y, angle} placed outside the corresponding edge
      const [b0x, b0y] = corners[0]; // bottom-right
      const [b1x, b1y] = corners[1]; // top-right
      const [b2x, b2y] = corners[2]; // top-left
      const [b3x, b3y] = corners[3]; // bottom-left

      const [rightX, rightY] = edgeMidOutward(b0x, b0y, b1x, b1y, DIM_LABEL_OFFSET);
      const [topX,   topY  ] = edgeMidOutward(b1x, b1y, b2x, b2y, DIM_LABEL_OFFSET);
      const [leftX,  leftY ] = edgeMidOutward(b2x, b2y, b3x, b3y, DIM_LABEL_OFFSET);
      const [botX,   botY  ] = edgeMidOutward(b3x, b3y, b0x, b0y, DIM_LABEL_OFFSET);

      // Edge angle in 2-D (for Text rotation around Z)
      function edgeAngle(ax: number, ay: number, bx: number, by: number) {
        return Math.atan2(by - ay, bx - ax);
      }

      const rightAngle = edgeAngle(b0x, b0y, b1x, b1y); // ~π/2 (vertical edge)
      const topAngle   = edgeAngle(b1x, b1y, b2x, b2y); // ~π   (horizontal top)
      const leftAngle  = edgeAngle(b2x, b2y, b3x, b3y); // slanted
      const botAngle   = edgeAngle(b3x, b3y, b0x, b0y); // ~0   (horizontal bottom)

      // Actual dimension of each edge
      const rightDim = plot.frontage; // right edge = frontage (vertical)
      const topDim   = plot.depthT;   // top edge   = depthT
      const leftDim  = Math.hypot(plot.depthB - plot.depthT, plot.frontage); // slanted
      const botDim   = plot.depthB;   // bottom edge = depthB

      const centerX = -(plot.depthB + plot.depthT) / 4;
      const centerY = plot.frontage / 2;

      return {
        geom: g,
        metrics: { fmtM2, fmtFt2, centerX, centerY },
        worldPos: [x + centerX, 0.5, -(y + centerY)] as [number, number, number],
        innerLine: inner,
        outerLine: outer,
        dimAnchors: {
          right: { x: rightX, y: rightY, angle: rightAngle, dim: rightDim },
          top:   { x: topX,   y: topY,   angle: topAngle,   dim: topDim   },
          left:  { x: leftX,  y: leftY,  angle: leftAngle,  dim: leftDim  },
          bot:   { x: botX,   y: botY,   angle: botAngle,   dim: botDim   },
        },
      };
    }, [plot, x, y]);

  useEffect(() => {
    registerPlotPosition(plot.id, worldPos);
  }, [plot.id, worldPos]);

  const [hovered, setHovered] = useState(false);
  const isSold = status === 'sold';

  // ── Colors ───────────────────────────────────────────────────────────────
  const defaultBgColor  = isSold ? '#8c3a3a' : '#faeed9';
  const hoverBgColor    = isSold ? '#a04848' : '#ebdcc2';
  const selectedBgColor = isSold ? '#6b2828' : '#1565c0'; // deep premium blue
  const currentColor    = isSelected ? selectedBgColor : hovered ? hoverBgColor : defaultBgColor;

  // ── Plot number ──────────────────────────────────────────────────────────
  const plotNumberStr = plot.id.toString().padStart(3, '0');

  // ── Font sizes (proportional to plot geometry) ───────────────────────────
  const H        = plot.frontage;
  const avgDepth = (plot.depthB + plot.depthT) / 2;

  const numFontSize   = isSelected
    ? Math.min(4.5, Math.max(2.2, H * 0.33))
    : Math.min(3.8, Math.max(2.2, Math.min(H * 0.35, avgDepth * 0.28)));

  const areaM2FontSize  = Math.min(1.6,  Math.max(1.0,  H * 0.13 ));
  const areaFt2FontSize = Math.min(1.3,  Math.max(0.85, H * 0.10 ));
  const dimFontSize     = Math.min(1.35, Math.max(0.9,  Math.min(H * 0.115, avgDepth * 0.095)));

  // ── Vertical positions inside the plot (number + area) ───────────────────
  const numY   = metrics.centerY + H * 0.17;
  const area1Y = metrics.centerY - H * 0.03;
  const area2Y = metrics.centerY - H * 0.20;

  return (
    <group
      position={[x, y, 0]}
      matrixAutoUpdate={false}
      onUpdate={(c) => c.updateMatrix()}
    >
      {/* ── Plot mesh ── */}
      <mesh
        geometry={geom}
        material={getPlotMaterial(currentColor)}
        matrixAutoUpdate={false}
        onUpdate={(c) => c.updateMatrix()}
        onClick={(e) => {
          e.stopPropagation();
          onClick(plot.id, worldPos);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Inner black border — always visible */}
        <Line
          points={innerLine}
          color="#000000"
          lineWidth={isSelected ? 2.5 : 2.0}
        />
      </mesh>

      {/* ── White selection outline (true parallel offset, follows all edges) ── */}
      {isSelected && (
        <Line
          points={outerLine}
          color="#ffffff"
          lineWidth={3.5}
          dashed={true}
          dashSize={0.8}
          gapSize={0.4}
        />
      )}

      {/* ── Plot number ── */}
      <Text
        {...commonTextProps}
        position={[
          metrics.centerX,
          isSelected || (isSold && !isSelected) ? numY : metrics.centerY,
          LABEL_Z,
        ]}
        rotation={[0, 0, 0]}
        fontSize={numFontSize}
        color={isSelected || isSold ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={isSelected ? numFontSize * 0.09 : 0}
        outlineColor="#000000"
      >
        {plotNumberStr}
      </Text>

      {/* ── SOLD indicator (unselected sold plots) ── */}
      {isSold && !isSelected && (
        <Text
          {...commonTextProps}
          position={[metrics.centerX, area1Y, LABEL_Z]}
          rotation={[0, 0, 0]}
          fontSize={areaM2FontSize}
          color="#ffcccc"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          SOLD
        </Text>
      )}

      {/* ── Selected-state overlay ── */}
      {isSelected && (
        <group>
          {/* Area m2 */}
          <Text
            {...commonTextProps}
            position={[metrics.centerX, area1Y, LABEL_Z]}
            rotation={[0, 0, 0]}
            fontSize={areaM2FontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {metrics.fmtM2}
          </Text>

          {/* Area ft2 */}
          <Text
            {...commonTextProps}
            position={[metrics.centerX, area2Y, LABEL_Z]}
            rotation={[0, 0, 0]}
            fontSize={areaFt2FontSize}
            color="#dceeff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {metrics.fmtFt2}
          </Text>

          {/* ── Dimension labels — outside each edge, aligned to edge direction ── */}

          {/* Right edge (frontage) */}
          <Text
            {...commonTextProps}
            position={[dimAnchors.right.x, dimAnchors.right.y, LABEL_Z]}
            rotation={[0, 0, dimAnchors.right.angle]}
            fontSize={dimFontSize}
            color="#111111"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={dimFontSize * 0.25}
            outlineColor="#ffffff"
          >
            {formatDimension(dimAnchors.right.dim)}
          </Text>

          {/* Top edge (depthT) */}
          <Text
            {...commonTextProps}
            position={[dimAnchors.top.x, dimAnchors.top.y, LABEL_Z]}
            rotation={[0, 0, dimAnchors.top.angle]}
            fontSize={dimFontSize}
            color="#111111"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={dimFontSize * 0.25}
            outlineColor="#ffffff"
          >
            {formatDimension(dimAnchors.top.dim)}
          </Text>

          {/* Left edge (slanted back boundary) */}
          <Text
            {...commonTextProps}
            position={[dimAnchors.left.x, dimAnchors.left.y, LABEL_Z]}
            rotation={[0, 0, dimAnchors.left.angle]}
            fontSize={dimFontSize}
            color="#111111"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={dimFontSize * 0.25}
            outlineColor="#ffffff"
          >
            {formatDimension(dimAnchors.left.dim)}
          </Text>

          {/* Bottom edge (depthB) */}
          <Text
            {...commonTextProps}
            position={[dimAnchors.bot.x, dimAnchors.bot.y, LABEL_Z]}
            rotation={[0, 0, dimAnchors.bot.angle]}
            fontSize={dimFontSize}
            color="#111111"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={dimFontSize * 0.25}
            outlineColor="#ffffff"
          >
            {formatDimension(dimAnchors.bot.dim)}
          </Text>
        </group>
      )}
    </group>
  );
};

export default React.memo(InteractivePlotComponent, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.status    === nextProps.status    &&
    prevProps.plot.id   === nextProps.plot.id
  );
});