import { useMemo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsLeft({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    const roadRightX = -193.5;
    const baseBottomY = -4.61;

    const plotSpecs: PlotSpec[] = [
      { id: 1, depthB: 26.72, depthT: 26.85, frontage: 9.00 },
      { id: 2, depthB: 26.85, depthT: 27.04, frontage: 12.00 },
      { id: 3, depthB: 27.04, depthT: 27.22, frontage: 12.00 },
      { id: 4, depthB: 27.22, depthT: 27.36, frontage: 9.00 },
      { id: 5, depthB: 27.36, depthT: 27.49, frontage: 9.00 },
      { id: 6, depthB: 27.49, depthT: 27.68, frontage: 12.91 },
    ];

    let currentY = baseBottomY;
    return plotSpecs.map((spec) => {
      const y = currentY;
      currentY += spec.frontage;
      return { spec, x: roadRightX, y };
    });
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
