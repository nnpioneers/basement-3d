import { useMemo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsCenterLeft({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Plots 7 to 16 are on the right side of the 12m road.
    const roadRightX = -166.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 16, depthB: 15.00, depthT: 15.00, frontage: 9.91 },
      { id: 15, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 14, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 13, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 12, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 11, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 10, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 9, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 8, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 7, depthB: 15.00, depthT: 15.00, frontage: 13.65 },
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
