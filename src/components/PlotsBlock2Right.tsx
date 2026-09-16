import { useMemo, useCallback } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsBlock2Right({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Block 2 Right is at -43.5
    // They face RIGHT.
    const roadRightX = -43.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 82, depthB: 15.00, depthT: 15.00, frontage: 9.91 },
      { id: 83, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 84, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 85, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 86, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 87, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 88, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 89, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 90, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 91, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 92, depthB: 15.00, depthT: 15.00, frontage: 7.15 },
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
