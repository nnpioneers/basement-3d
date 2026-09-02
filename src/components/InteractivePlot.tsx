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
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.05,
  bevelSegments: 1,
};

function formatDimension(val: number): string {
  return Math.abs(val - Math.round(val)) < 0.05 ? `${Math.round(val)} m` : `${val.toFixed(1)} m`;
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
    matCache[color] = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.0 });
  }
  return matCache[color];
}

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
  onClick: (worldPos: [number, number, number]) => void;
  status?: PlotStatus;
}) => {
  const { geom, metrics, worldPos, linePoints } = useMemo(() => {
    const g = getPlotGeom(plot);

    // Area calculations
    const areaSqM = ((plot.depthB + plot.depthT) / 2) * plot.frontage;
    const areaSqFt = areaSqM * 10.7639;

    const leftEdgeLength = Math.hypot(plot.depthB - plot.depthT, plot.frontage);
    const leftEdgeAngle = Math.atan2(plot.frontage, plot.depthB - plot.depthT);

    const centerX = -(plot.depthB + plot.depthT) / 4;
    const centerY = plot.frontage / 2;

    const formattedAreaSqM = Math.abs(areaSqM - Math.round(areaSqM)) < 0.05 
      ? `${Math.round(areaSqM)} m²` 
      : `${areaSqM.toFixed(1)} m²`;

    const formattedAreaSqFt = `${(areaSqFt).toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} ft²`;

    return {
      geom: g,
      metrics: {
        areaSqM: formattedAreaSqM,
        areaSqFt: formattedAreaSqFt,
        centerX,
        centerY,
        leftEdgeLength,
        leftEdgeAngle,
      },
      worldPos: [
        x + centerX,
        0.5,
        -(y + centerY),
      ] as [number, number, number],
      linePoints: [
        new THREE.Vector3(0, 0, 0.16),
        new THREE.Vector3(0, plot.frontage, 0.16),
        new THREE.Vector3(-plot.depthT, plot.frontage, 0.16),
        new THREE.Vector3(-plot.depthB, 0, 0.16),
        new THREE.Vector3(0, 0, 0.16),
      ],
    };
  }, [plot, x, y]);

  // Register the plot's exact world position for instant camera navigation
  useEffect(() => {
    registerPlotPosition(plot.id, worldPos);
  }, [plot.id, worldPos]);

  const [hovered, setHovered] = useState(false);

  const isSold = status === 'sold';

  // Professional color palette matching modern reference master plan
  const defaultBgColor = isSold ? '#8c3a3a' : '#faeed9'; // Warm premium cream / sand background matching reference, or muted red for sold
  const hoverBgColor = isSold ? '#a04848' : '#ebdcc2';    // Subtle warm hover
  const selectedBgColor = isSold ? '#6b2828' : '#0052cc'; // Rich, deep, saturated electric Royal Blue, or deep crimson for sold
  
  const currentColor = isSelected ? selectedBgColor : hovered ? hoverBgColor : defaultBgColor;

  // 3-digit plot numbering (e.g. 050, 067, 132, 201)
  const plotNumberStr = plot.id.toString().padStart(3, '0');

  // Dynamic layout & proportional typography calculations based on plot frontage & depth
  const H = plot.frontage;
  const avgDepth = (plot.depthB + plot.depthT) / 2;
  const edgeMargin = Math.min(0.75, Math.max(0.5, H * 0.08));

  // Dynamic font sizing proportional to plot geometry
  const numFontSize = isSelected
    ? Math.min(3.8, Math.max(2.0, H * 0.29))
    : Math.min(3.8, Math.max(2.2, Math.min(H * 0.35, avgDepth * 0.28)));

  const areaM2FontSize = Math.min(1.65, Math.max(1.05, H * 0.135));
  const areaFt2FontSize = Math.min(1.35, Math.max(0.85, H * 0.105));
  const dimFontSize = Math.min(1.4, Math.max(0.95, Math.min(H * 0.12, avgDepth * 0.1)));

  // Proportional vertical positioning (guarantees zero overlap on 6m, 9m, 12m, 15m plots)
  const numY = metrics.centerY + (H * 0.17);
  const area1Y = metrics.centerY - (H * 0.05);
  const area2Y = metrics.centerY - (H * 0.24);

  const commonTextProps = {
    characters: '0123456789. m²ftSOLD',
    matrixAutoUpdate: false,
    onUpdate: (c: any) => c.updateMatrix(),
    raycast: () => null,
  };

  return (
    <group position={[x, y, 0]} matrixAutoUpdate={false} onUpdate={(c) => c.updateMatrix()}>
      {/* Plot Geometry Mesh */}
      <mesh
        geometry={geom}
        material={getPlotMaterial(currentColor)}
        matrixAutoUpdate={false}
        onUpdate={(c) => c.updateMatrix()}
        onClick={(e) => {
          e.stopPropagation();
          onClick(worldPos);
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
        {/* Crisp Deep Black Border around the plot */}
        <Line 
          points={linePoints} 
          color="#000000" 
          lineWidth={isSelected ? 3.0 : 2.0} 
        />
      </mesh>

      {/* Main Plot Number (Large Bold Black when unselected; Solid Thick Pure White when selected or sold) */}
      <Text
        {...commonTextProps}
        position={[metrics.centerX, isSelected || (isSold && !isSelected) ? numY : metrics.centerY, 0.4]}
        rotation={[0, 0, 0]}
        fontSize={numFontSize}
        color={isSelected || isSold ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {plotNumberStr}
      </Text>

      {/* Simple SOLD status indication when plot is sold */}
      {isSold && !isSelected && (
        <Text
          {...commonTextProps}
          position={[metrics.centerX, area1Y, 0.4]}
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


      {/* Detailed Metrics Overlay (When Plot is Selected - Pure Solid Bold White) */}
      {isSelected && (
        <group>
          {/* Area Line 1: m² */}
          <Text
            {...commonTextProps}
            position={[metrics.centerX, area1Y, 0.4]}
            rotation={[0, 0, 0]}
            fontSize={areaM2FontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {metrics.areaSqM}
          </Text>

          {/* Area Line 2: ft² */}
          <Text
            {...commonTextProps}
            position={[metrics.centerX, area2Y, 0.4]}
            rotation={[0, 0, 0]}
            fontSize={areaFt2FontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {metrics.areaSqFt}
          </Text>

          {/* Right Edge Dimension (Frontage / East edge) */}
          <Text
            {...commonTextProps}
            position={[-edgeMargin, metrics.centerY, 0.42]}
            rotation={[0, 0, Math.PI / 2]}
            fontSize={dimFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {formatDimension(plot.frontage)}
          </Text>

          {/* Left Edge Dimension (Back Boundary / West edge) */}
          <Text
            {...commonTextProps}
            position={[-(plot.depthB + plot.depthT) / 2 + edgeMargin, metrics.centerY, 0.42]}
            rotation={[0, 0, metrics.leftEdgeAngle]}
            fontSize={dimFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {formatDimension(metrics.leftEdgeLength)}
          </Text>

          {/* Bottom Edge Dimension (South edge) */}
          <Text
            {...commonTextProps}
            position={[-plot.depthB / 2, edgeMargin, 0.42]}
            rotation={[0, 0, 0]}
            fontSize={dimFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {formatDimension(plot.depthB)}
          </Text>

          {/* Top Edge Dimension (North edge) */}
          <Text
            {...commonTextProps}
            position={[-plot.depthT / 2, H - edgeMargin, 0.42]}
            rotation={[0, 0, 0]}
            fontSize={dimFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {formatDimension(plot.depthT)}
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
