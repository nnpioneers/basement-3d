import { useMemo, useCallback, memo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

function PlotsRightBlock2Right({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    const roadRightX = 76.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 144, depthB: 15.00, depthT: 15.00, frontage: 10.19 },
      { id: 145, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 146, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 147, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 148, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 149, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 150, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 151, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 152, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 153, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 154, depthB: 15.00, depthT: 15.00, frontage: 9.15 },
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

export default memo(PlotsRightBlock2Right);
