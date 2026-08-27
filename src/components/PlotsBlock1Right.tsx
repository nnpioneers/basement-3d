import { useMemo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsBlock1Right({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Block 1 Right is at -6.0
    // They face RIGHT.
    const roadRightX = -6.0; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 104, depthB: 16.50, depthT: 16.50, frontage: 9.91 },
      { id: 105, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 106, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 107, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 108, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 109, depthB: 16.50, depthT: 16.50, frontage: 11.30 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 110, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 111, depthB: 16.50, depthT: 16.50, frontage: 9.00 },
      { id: 112, depthB: 16.50, depthT: 16.50, frontage: 7.15 },
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
          onClick={(worldPos) => {
            if (selectedPlotId === spec.id) {
              onPlotSelect?.(null, null);
            } else {
              onPlotSelect?.(spec.id, worldPos);
            }
          }}
        />
      ))}
    </group>
  );
}
