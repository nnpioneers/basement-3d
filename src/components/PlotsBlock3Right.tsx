import { useMemo, useCallback } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsBlock3Right({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Block 3 Right is at -79.5
    // They face RIGHT.
    const roadRightX = -79.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 60, depthB: 15.00, depthT: 15.00, frontage: 9.91 },
      { id: 61, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 62, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 63, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 64, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 65, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 66, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 67, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 68, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 69, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 70, depthB: 15.00, depthT: 15.00, frontage: 7.15 },
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
