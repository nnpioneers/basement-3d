import { useMemo, useCallback } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsRightBlock4Left({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Right Block 4 Left is at 139.5 (124.5 + 15.0 depth)
    // They face LEFT.
    const roadRightX = 139.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 187, depthB: 15.00, depthT: 15.00, frontage: 9.91 },
      { id: 186, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 185, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 184, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 183, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 182, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 181, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 180, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 179, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 178, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 177, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
    ];

    let currentYBottom = -51.26;
    const bottomSpecs = plotSpecsBottom.map((spec) => {
      const y = currentYBottom;
      currentYBottom += spec.frontage;
      return { spec, x: roadRightX, y };
    });

    let currentYTop = 27.65;
    const topSpecs = plotSpecsTop.map((spec) => {
      const y = currentYTop;
      currentYTop += spec.frontage;
      return { spec, x: roadRightX, y };
    });

    return [...bottomSpecs, ...topSpecs];
  }, []);
  const handleClick = useCallback((id: number, worldPos: [number, number, number]) => {
    onPlotSelect?.(selectedPlotId === id ? null : id, selectedPlotId === id ? null : worldPos);
  }, [onPlotSelect, selectedPlotId]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
      {plotsInfo.map(({ spec, x, y }) => (
        <InteractivePlot
          key={spec.id}
          plot={spec}
          x={x}
          y={y}
          isSelected={selectedPlotId === spec.id}
          status={plotStatusMap?.[spec.id] || 'available'}
          onClick={handleClick}
        />
      ))}
    </group>
  );
}
