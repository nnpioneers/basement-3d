import { useMemo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsRightBlock2Left({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Right Block 2 Left is at 61.5 (46.5 + 15.0 depth)
    // They face LEFT.
    const roadRightX = 61.5; 
    
    const plotSpecsBottom: PlotSpec[] = [
      { id: 143, depthB: 15.00, depthT: 15.00, frontage: 10.19 },
      { id: 142, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 141, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 140, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 139, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 138, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 137, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];
    
    const plotSpecsTop: PlotSpec[] = [
      { id: 136, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 135, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 134, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 133, depthB: 15.00, depthT: 15.00, frontage: 9.15 },
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
