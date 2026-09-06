import { useMemo, useCallback } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsBlock1Left({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Block 1 Left is at -22.5
    // They face LEFT.
    const roadRightX = -22.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 103, depthB: 12.00, depthT: 12.00, frontage: 9.91 },
      { id: 102, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 101, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 100, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 99, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 98, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 97, depthB: 12.00, depthT: 12.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 96, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 95, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 94, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 93, depthB: 12.00, depthT: 12.00, frontage: 7.15 },
    ];

    let currentYBottom = -51.26;
    const bottomPlots = plotSpecsBottom.map((spec) => {
      const y = currentYBottom;
      currentYBottom += spec.frontage;
      return { spec, x: roadRightX, y };
    });

    let currentYTop = 27.65;
    const topPlots = plotSpecsTop.map((spec) => {
      const y = currentYTop;
      currentYTop += spec.frontage;
      return { spec, x: roadRightX, y };
    });

    return [...bottomPlots, ...topPlots];
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
