import { useMemo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsBlock3Left({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Block 3 Left is at -94.5
    // They face LEFT.
    const roadRightX = -94.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 59, depthB: 12.00, depthT: 12.00, frontage: 9.91 },
      { id: 58, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 57, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 56, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 55, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 54, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 53, depthB: 12.00, depthT: 12.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 52, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 51, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 50, depthB: 12.00, depthT: 12.00, frontage: 9.00 },
      { id: 49, depthB: 12.00, depthT: 12.00, frontage: 7.15 },
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
