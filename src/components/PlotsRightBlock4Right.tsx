import { useMemo, useCallback } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsRightBlock4Right({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Right Block 4 Right is at 157.77
    // They face RIGHT.
    const roadRightX = 157.77; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 188, depthB: 18.27, depthT: 18.27, frontage: 9.91 },
      { id: 189, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 190, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 191, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 192, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 193, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 194, depthB: 18.27, depthT: 18.27, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 195, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 196, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 197, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 198, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 199, depthB: 18.27, depthT: 18.27, frontage: 9.00 },
      { id: 200, depthB: 18.27, depthT: 18.27, frontage: 12.00 },
      { id: 201, depthB: 18.27, depthT: 18.27, frontage: 9.99 },
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
