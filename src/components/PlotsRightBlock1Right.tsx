import { useMemo, useCallback, memo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

function PlotsRightBlock1Right({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    const roadRightX = 37.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 122, depthB: 15.00, depthT: 15.00, frontage: 9.91 },
      { id: 123, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 124, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 125, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 126, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 127, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 128, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 129, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 130, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 131, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 132, depthB: 15.00, depthT: 15.00, frontage: 9.15 },
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

export default memo(PlotsRightBlock1Right);
