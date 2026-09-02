import { useMemo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsRightBlock3Left({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Right Block 3 Left is at 100.5 (85.5 + 15.0 depth)
    // They face LEFT.
    const roadRightX = 100.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 165, depthB: 15.00, depthT: 15.00, frontage: 10.48 },
      { id: 164, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 163, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 162, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 161, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 160, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 159, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 158, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 157, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 156, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 155, depthB: 15.00, depthT: 15.00, frontage: 9.15 },
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
