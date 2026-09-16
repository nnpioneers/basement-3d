import { useMemo, useCallback, memo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

function PlotsBlock4Left({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    const roadRightX = -130.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 37, depthB: 12.00, depthT: 12.00, frontage: 9.91 },
      { id: 36, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 35, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 34, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 33, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 32, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 31, depthB: 12.00, depthT: 12.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 30, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 29, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 28, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 27, depthB: 12.00, depthT: 12.00, frontage: 6.00 },
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
    onPlotSelect?.(id, worldPos);
  }, [onPlotSelect]);

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

export default memo(PlotsBlock4Left);
