import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Text, Line } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
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
  raycast: () => null,
};

// ─────────────────────────────────────────────────────────────────────────────

const WHITE_OUTLINE_Z = 0.22;   // z-height for the white outline line
const LABEL_Z         = 0.30;   // z-height for text labels

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
  const { geom, metrics, worldPos, innerLine, boundaryLine, dimAnchors } =
    useMemo(() => {
      const g = getPlotGeom(plot);

      // ── Area ──────────────────────────────────────────────────────────────
      const areaSqM  = ((plot.depthB + plot.depthT) / 2) * plot.frontage;
      const areaSqFt = areaSqM * 10.7639;

      const fmtM2 = Math.abs(areaSqM - Math.round(areaSqM)) < 0.05
        ? `${Math.round(areaSqM)} m` + String.fromCharCode(178)
        : `${areaSqM.toFixed(1)} m` + String.fromCharCode(178);

      const fmtFt2 = `${areaSqFt.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ft` + String.fromCharCode(178);

      // ── Plot corners in local 2-D space (CCW = bottom-right → top-right → top-left → bottom-left) ──
      const corners: [number, number][] = [
        [0,            0            ], // 0 bottom-right (road side)
        [0,            plot.frontage], // 1 top-right
        [-plot.depthT, plot.frontage], // 2 top-left
        [-plot.depthB, 0            ], // 3 bottom-left
      ];

      // ── Inner black border (exact plot boundary) ───────────────────────
      const inner = corners.map(([cx, cy]) => new THREE.Vector3(cx, cy, 0.15));
      inner.push(inner[0].clone()); // close

      // ── White selection outline (exact plot boundary, no outward offset) ──
      const boundary = corners.map(([cx, cy]) => new THREE.Vector3(cx, cy, WHITE_OUTLINE_Z));
      boundary.push(boundary[0].clone()); // close

      // ── Dimension label anchors along exact edge midpoints ───────────────
      function getEdgeAnchor(ax: number, ay: number, bx: number, by: number) {
        const dx = bx - ax;
        const dy = by - ay;
        const len = Math.hypot(dx, dy);

        // Exact midpoint of the edge segment
        const midX = (ax + bx) / 2;
        const midY = (ay + by) / 2;

        let angle = Math.atan2(dy, dx);
        while (angle > Math.PI / 2) angle -= Math.PI;
        while (angle < -Math.PI / 2) angle += Math.PI;

        return { x: midX, y: midY, angle, dim: len };
      }

      const [c0x, c0y] = corners[0];
      const [c1x, c1y] = corners[1];
      const [c2x, c2y] = corners[2];
      const [c3x, c3y] = corners[3];

      const rightAnchor = getEdgeAnchor(c0x, c0y, c1x, c1y);
      const topAnchor   = getEdgeAnchor(c1x, c1y, c2x, c2y);
      const leftAnchor  = getEdgeAnchor(c2x, c2y, c3x, c3y);
      const botAnchor   = getEdgeAnchor(c3x, c3y, c0x, c0y);

      const centerX = -(plot.depthB + plot.depthT) / 4;
      const centerY = plot.frontage / 2;

      return {
        geom: g,
        metrics: { fmtM2, fmtFt2, centerX, centerY },
        worldPos: [x + centerX, 0.5, -(y + centerY)] as [number, number, number],
        innerLine: inner,
        boundaryLine: boundary,
        dimAnchors: {
          right: rightAnchor,
          top:   topAnchor,
          left:  leftAnchor,
          bot:   botAnchor,
        },
      };
    }, [plot, x, y]);

  useEffect(() => {
    registerPlotPosition(plot.id, worldPos);
  }, [plot.id, worldPos]);

  // ── CRITICAL: force canvas redraw when selection state changes (frameloop=demand) ──
  const { invalidate } = useThree();
  useEffect(() => {
    if (isSelected) {
      invalidate();
    }
  }, [isSelected, invalidate]);

  const [hovered, setHovered] = useState(false);
  const isSold = status === 'sold';

  // ── Colors ───────────────────────────────────────────────────────────────
  const defaultBgColor  = isSold ? '#8c3a3a' : '#faeed9';
  const hoverBgColor    = isSold ? '#a04848' : '#ebdcc2';
  const selectedBgColor = isSold ? '#6b2828' : '#1565c0'; // deep rich blue (#1565C0)
  const currentColor    = isSelected ? selectedBgColor : hovered ? hoverBgColor : defaultBgColor;

  // ── Plot number string ────────────────────────────────────────────────────
  const plotNumberStr = plot.id.toString();

  // ── Font sizes & strict vertical spacing (guarantees NO text overlap) ──────
  const H        = plot.frontage;
  const avgDepth = (plot.depthB + plot.depthT) / 2;
  const minDim   = Math.min(H, avgDepth);

  // Clear, readable size for unselected plots at overview distance
  const baseNumFontSize = Math.min(3.6, Math.max(2.5, minDim * 0.30));
  let numFontSize       = isSelected ? baseNumFontSize * 1.18 : baseNumFontSize;

  let areaM2FontSize  = numFontSize * 0.42;
  let areaFt2FontSize = numFontSize * 0.36;
  let dimFontSize     = Math.min(1.0, Math.max(0.65, minDim * 0.085));

  // Explicit gaps proportional to font sizes to guarantee clean vertical stacking
  let gap1 = numFontSize * 0.55;
  let gap2 = areaM2FontSize * 0.95;

  if (isSelected) {
    // Scale down selected layout block only if it exceeds plot frontage
    const totalHalfHeight = (gap1 + gap2 + numFontSize * 0.5) / 2;
    const maxHalfHeight   = H * 0.40;

    if (totalHalfHeight > maxHalfHeight && totalHalfHeight > 0) {
      const scale = maxHalfHeight / totalHalfHeight;
      numFontSize     *= scale;
      areaM2FontSize  *= scale;
      areaFt2FontSize *= scale;
      dimFontSize     *= scale;
      gap1            *= scale;
      gap2            *= scale;
    }
  } else {
    // Unselected plot number: ensure it stays within plot frontage height
    const maxNumHeight = H * 0.45;
    if (numFontSize > maxNumHeight) {
      numFontSize = maxNumHeight;
    }
  }

  const blockCenterY = metrics.centerY;
  const numY   = blockCenterY + gap1 * 0.75;
  const area1Y = numY - gap1;
  const area2Y = area1Y - gap2;

  return (
    <group position={[x, y, 0]}>
      {/* ── Plot mesh ── */}
      <mesh
        geometry={geom}
        material={getPlotMaterial(currentColor)}
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
          lineWidth={isSelected ? 2.2 : 1.5}
        />
      </mesh>

      {/* ── White selection boundary line (exact plot perimeter) ── */}
      {isSelected && (
        <Line
          points={boundaryLine}
          color="#ffffff"
          lineWidth={1.6}
          dashed={true}
          dashSize={0.25}
          gapSize={0.15}
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
        outlineWidth={isSelected ? numFontSize * 0.12 : numFontSize * 0.05}
        outlineColor={isSelected ? '#000000' : '#ffffff'}
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
            outlineWidth={0} // No outline for clean look
          >
            {metrics.fmtM2}
          </Text>

          {/* Area ft2 */}
          <Text
            {...commonTextProps}
            position={[metrics.centerX, area2Y, LABEL_Z]}
            rotation={[0, 0, 0]}
            fontSize={areaFt2FontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={0} // No outline for clean look
          >
            {metrics.fmtFt2}
          </Text>

          {/* ── Dimension labels along edges ── */}

          {/* Right edge (frontage) */}
          <Text
            {...commonTextProps}
            position={[dimAnchors.right.x, dimAnchors.right.y, LABEL_Z]}
            rotation={[0, 0, dimAnchors.right.angle]}
            fontSize={dimFontSize}
            color="#000000"
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
            color="#000000"
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
            color="#000000"
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
            color="#000000"
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