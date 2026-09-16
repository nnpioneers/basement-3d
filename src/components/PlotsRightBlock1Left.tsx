import { useEffect, useMemo, useCallback, memo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';
import { registerPlotsInfoOutlines } from '../data/plotLookup';

function PlotsRightBlock1Left({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    const roadRightX = 22.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 121, depthB: 16.50, depthT: 16.50, frontage: 9.91 },
      { id: 120, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 119, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 118, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 117, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 116, depthB: 16.50, depthT: 16.50, frontage: 11.30 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 115, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 114, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 113, depthB: 16.50, depthT: 16.50, frontage: 9.15 },
    ];

    let currentYBottom = -51.26;
    const bottomPlots = plotSpecsBottom.map((spec) => {
      const y = currentYBottom;
      currentYBottom += spec.frontage;
      return { spec, x: roadRightX, y };
    });

    let currentYTop = 36.65;
    const topPlots = plotSpecsTop.map((spec) => {
      const y = currentYTop;
      currentYTop += spec.frontage;
      return { spec, x: roadRightX, y };
    });

    return [...bottomPlots, ...topPlots];
  }, []);

  useEffect(() => {
    registerPlotsInfoOutlines('PlotsRightBlock1Left', plotsInfo);
  }, [plotsInfo]);

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

export default memo(PlotsRightBlock1Left);
