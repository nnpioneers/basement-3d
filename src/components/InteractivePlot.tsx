import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { registerPlotPosition, registerPlotCorners, getAllPlotCorners } from '../data/plotLookup';
import type { PlotStatus } from '../types/plot';
import type { PlotCorners } from '../data/plotLookup';

export type PlotSpec = {
  id: number;
  depthB: number;
  depthT: number;
  frontage: number;
};

const extrudeSettings = {
  steps: 1,
  depth: 0.22,
  bevelEnabled: false,
};

function formatDimension(val: number): string {
  return Math.abs(val - Math.round(val)) < 0.05
    ? `${Math.round(val)} m`
    : `${val.toFixed(1)} m`;
}

function isPointInPolygon(pt: [number, number], poly: PlotCorners) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
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

const borderGeomCache = new Map<string, THREE.BufferGeometry>();

const BORDER_Z = 0.235; // Safely above the 0.22 extrusion depth

function getPlotBorderGeom(plot: PlotSpec) {
  const key = `${plot.depthB}_${plot.depthT}_${plot.frontage}`;
  if (!borderGeomCache.has(key)) {
    const points = [
      new THREE.Vector3(0, 0, BORDER_Z),
      new THREE.Vector3(0, plot.frontage, BORDER_Z),
      new THREE.Vector3(-plot.depthT, plot.frontage, BORDER_Z),
      new THREE.Vector3(-plot.depthB, 0, BORDER_Z),
    ];
    const g = new THREE.BufferGeometry().setFromPoints(points);
    borderGeomCache.set(key, g);
  }
  return borderGeomCache.get(key)!;
}

const borderMaterial = new THREE.LineBasicMaterial({
  color: 0x000000,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  polygonOffsetUnits: -4,
});

const dashedMaterial = new THREE.LineDashedMaterial({
  color: 0xffffff,
  dashSize: 0.6,
  gapSize: 0.35,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -3,
  polygonOffsetUnits: -3,
});

const crosshairMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -3,
  polygonOffsetUnits: -3,
});

const matCache: Record<string, THREE.MeshStandardMaterial> = {};
function getPlotMaterial(color: string) {
  if (!matCache[color]) {
    matCache[color] = new THREE.MeshStandardMaterial({
      color,
      roughness: 1.0,
      metalness: 0.0,
    });
  }
  return matCache[color];
}

const commonTextProps = {
  raycast: () => null,
};

// ─────────────────────────────────────────────────────────────────────────────

const WHITE_OUTLINE_Z = 0.245;   // z-height for white outline line
const LABEL_Z = 0.255;   // z-height for text labels

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
  const { geom, borderGeom, metrics, worldPos, boundaryGeom, crosshairGeom, dimAnchors, wCorners } =
    useMemo(() => {
      const g = getPlotGeom(plot);
      const bg = getPlotBorderGeom(plot);

      // ── Area ──────────────────────────────────────────────────────────────
      const areaSqM = ((plot.depthB + plot.depthT) / 2) * plot.frontage;
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
        [0, 0], // 0 bottom-right (road side)
        [0, plot.frontage], // 1 top-right
        [-plot.depthT, plot.frontage], // 2 top-left
        [-plot.depthB, 0], // 3 bottom-left
      ];

      const wCorners: PlotCorners = [
        [x + corners[0][0], y + corners[0][1]],
        [x + corners[1][0], y + corners[1][1]],
        [x + corners[2][0], y + corners[2][1]],
        [x + corners[3][0], y + corners[3][1]],
      ];

      // ── Native White Selection Boundary (Sharp dashed line) ────────────────
      const boundary = corners.map(([cx, cy]) => new THREE.Vector3(cx, cy, WHITE_OUTLINE_Z));
      boundary.push(boundary[0].clone()); // close

      const boundaryGeom = new THREE.BufferGeometry().setFromPoints(boundary);

      // ── Dimension label anchors along exact edge midpoints ───────────────
      function getEdgeAnchor(ax: number, ay: number, bx: number, by: number) {
        const dx = bx - ax;
        const dy = by - ay;
        const len = Math.hypot(dx, dy);

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
      const topAnchor = getEdgeAnchor(c1x, c1y, c2x, c2y);
      const leftAnchor = getEdgeAnchor(c2x, c2y, c3x, c3y);
      const botAnchor = getEdgeAnchor(c3x, c3y, c0x, c0y);

      const centerX = -(plot.depthB + plot.depthT) / 4;
      const centerY = plot.frontage / 2;

      // ── Corner Crosshairs (tiny + markers) ─────────────────────────────────
      const crosshairPoints: THREE.Vector3[] = [];
      const s = 0.4; // crosshair half-size
      corners.forEach(([cx, cy]) => {
        crosshairPoints.push(new THREE.Vector3(cx - s, cy, WHITE_OUTLINE_Z));
        crosshairPoints.push(new THREE.Vector3(cx + s, cy, WHITE_OUTLINE_Z));
        crosshairPoints.push(new THREE.Vector3(cx, cy - s, WHITE_OUTLINE_Z));
        crosshairPoints.push(new THREE.Vector3(cx, cy + s, WHITE_OUTLINE_Z));
      });
      const crosshairGeom = new THREE.BufferGeometry().setFromPoints(crosshairPoints);

      return {
        geom: g,
        borderGeom: bg,
        metrics: { fmtM2, fmtFt2, centerX, centerY },
        worldPos: [x + centerX, 0.5, -(y + centerY)] as [number, number, number],
        boundaryGeom,
        crosshairGeom,
        wCorners,
        dimAnchors: {
          right: rightAnchor,
          top: topAnchor,
          left: leftAnchor,
          bot: botAnchor,
        },
      };
    }, [plot, x, y]);

  useEffect(() => {
    registerPlotPosition(plot.id, worldPos);
    registerPlotCorners(plot.id, wCorners);
  }, [plot.id, worldPos, wCorners]);

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
  const defaultBgColor = isSold ? '#8c3a3a' : '#b89b6b';
  const hoverBgColor = isSold ? '#a04848' : '#9e8254';
  const selectedBgColor = isSold ? '#6b2828' : '#1a66cc';
  const currentColor = isSelected ? selectedBgColor : hovered ? hoverBgColor : defaultBgColor;

  // ── Plot number string ────────────────────────────────────────────────────
  const plotNumberStr = plot.id.toString();

  // ── Font sizes & strict vertical spacing (guarantees NO text overlap) ──────
  const H = plot.frontage;
  const avgDepth = (plot.depthB + plot.depthT) / 2;
  const minDim = Math.min(H, avgDepth);

  const baseNumFontSize = 3.8;
  let numFontSize = isSelected ? baseNumFontSize * 0.65 : baseNumFontSize;

  let areaM2FontSize = numFontSize * 0.42;
  let areaFt2FontSize = numFontSize * 0.36;
  let dimFontSize = Math.min(1.0, Math.max(0.65, minDim * 0.085));

  let gap1 = numFontSize * 0.85;
  let gap2 = areaM2FontSize * 1.10;

  if (isSelected) {
    const totalHalfHeight = (gap1 + gap2 + numFontSize * 0.5) / 2;
    const maxHalfHeight = H * 0.42;

    if (totalHalfHeight > maxHalfHeight && totalHalfHeight > 0) {
      const scale = maxHalfHeight / totalHalfHeight;
      numFontSize *= scale;
      areaM2FontSize *= scale;
      areaFt2FontSize *= scale;
      dimFontSize *= scale;
      gap1 *= scale;
      gap2 *= scale;
    }
  }

  const blockCenterY = metrics.centerY;
  const numY = blockCenterY + gap1 * 0.90;
  const area1Y = numY - gap1;
  const area2Y = area1Y - gap2;

  // Dynamic road-facing detection: If the point slightly outward from the edge does NOT fall inside ANY other plot, it's a road edge.
  const checkOuterEdge = (anchor: { x: number, y: number, angle: number }) => {
    if (!isSelected) return false;
    const wx = x + anchor.x;
    const wy = y + anchor.y;
    // Outward normal is angle - PI/2
    const outwardAngle = anchor.angle - Math.PI / 2;
    const testX = wx + Math.cos(outwardAngle) * 0.5; // Push 0.5m outward
    const testY = wy + Math.sin(outwardAngle) * 0.5;

    const allPlots = getAllPlotCorners();
    for (const poly of allPlots) {
      if (isPointInPolygon([testX, testY], poly)) {
        return false; // Touches another plot, NOT an outer/road edge
      }
    }
    return true; // Not inside any plot -> road/park facing!
  };

  const rightIsOuter = isSelected && checkOuterEdge(dimAnchors.right);
  const topIsOuter = isSelected && checkOuterEdge(dimAnchors.top);
  const leftIsOuter = isSelected && checkOuterEdge(dimAnchors.left);
  const botIsOuter = isSelected && checkOuterEdge(dimAnchors.bot);

  return (
    <group position={[x, y, 0]} renderOrder={isSelected ? 100 : 0}>
      {/* ── Plot mesh ── */}
      <mesh
        geometry={geom}
        material={getPlotMaterial(currentColor)}
        onClick={(e) => {
          if (e.delta > 2) return;
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
        {/* Solid hardware line border — zero Z-fighting, zero shimmering */}
        <lineLoop
          geometry={borderGeom}
          material={borderMaterial}
          raycast={() => null}
          renderOrder={10}
        />
      </mesh>

      {/* ── Native WebGL Sharp White Dashed Line & Crosshairs ── */}
      {isSelected && (
        <group renderOrder={105}>
          {/* Main dashed border */}
          <primitive
            object={(() => {
              const line = new THREE.Line(
                boundaryGeom,
                dashedMaterial
              );
              line.computeLineDistances();
              return line;
            })()}
          />

          {/* Corner crosshair markers (+) */}
          <primitive
            object={new THREE.LineSegments(
              crosshairGeom,
              crosshairMaterial
            )}
          />
        </group>
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
        outlineWidth={isSelected ? numFontSize * 0.04 : numFontSize * 0.05}
        outlineColor={isSelected ? '#000000' : '#ffffff'}
        renderOrder={110}
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
        <group renderOrder={110}>
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
            outlineWidth={0}
            renderOrder={110}
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
            outlineWidth={0}
            renderOrder={110}
          >
            {metrics.fmtFt2}
          </Text>

          {/* ── Dimension labels along edges ── */}

          {/* Right edge (frontage) */}
          <Text
            {...commonTextProps}
            position={[dimAnchors.right.x, dimAnchors.right.y, rightIsOuter ? 0.85 : LABEL_Z]}
            rotation={[0, 0, dimAnchors.right.angle]}
            fontSize={dimFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={dimFontSize * 0.15}
            outlineColor="#000000"
            renderOrder={rightIsOuter ? 200 : 120}
          >
            {formatDimension(dimAnchors.right.dim)}
          </Text>

          {/* Top edge (depthT) */}
          <Text
            {...commonTextProps}
            position={[dimAnchors.top.x, dimAnchors.top.y, topIsOuter ? 0.85 : LABEL_Z]}
            rotation={[0, 0, dimAnchors.top.angle]}
            fontSize={dimFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={dimFontSize * 0.15}
            outlineColor="#000000"
            renderOrder={topIsOuter ? 200 : 120}
          >
            {formatDimension(dimAnchors.top.dim)}
          </Text>

          {/* Left edge (slanted back boundary) */}
          <Text
            {...commonTextProps}
            position={[dimAnchors.left.x, dimAnchors.left.y, leftIsOuter ? 0.85 : LABEL_Z]}
            rotation={[0, 0, dimAnchors.left.angle]}
            fontSize={dimFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={dimFontSize * 0.15}
            outlineColor="#000000"
            renderOrder={leftIsOuter ? 200 : 120}
          >
            {formatDimension(dimAnchors.left.dim)}
          </Text>

          {/* Bottom edge (depthB) */}
          <Text
            {...commonTextProps}
            position={[dimAnchors.bot.x, dimAnchors.bot.y, botIsOuter ? 0.85 : LABEL_Z]}
            rotation={[0, 0, dimAnchors.bot.angle]}
            fontSize={dimFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={dimFontSize * 0.15}
            outlineColor="#000000"
            renderOrder={botIsOuter ? 200 : 120}
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
    prevProps.status === nextProps.status &&
    prevProps.plot.id === nextProps.plot.id
  );
});