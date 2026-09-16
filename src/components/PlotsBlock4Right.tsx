import { useMemo, useCallback } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

export default function PlotsBlock4Right({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    // Right edge of Block 4 Right (x = -115.5)
    // Left edge of these plots is at x = -130.5. 
    // They face RIGHT (road is at x = -115.5).
    const roadRightX = -115.5;

    const specsBottom: PlotSpec[] = [
      { id: 38, depthB: 15.00, depthT: 15.00, frontage: 9.91 },
      { id: 39, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 40, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 41, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 42, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 43, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 44, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];

    let currentYBottom = -51.26;
    const bottomPlots = specsBottom.map((spec) => {
      const y = currentYBottom;
      currentYBottom += spec.frontage;
      return { spec, x: roadRightX, y };
    });

    const specsTop: PlotSpec[] = [
      { id: 45, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 46, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 47, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 48, depthB: 15.00, depthT: 15.00, frontage: 6.00 },
    ];

    let currentYTop = 27.65;
    const topPlots = specsTop.map((spec) => {
      const y = currentYTop;
      currentYTop += spec.frontage;
      return { spec, x: roadRightX, y };
    });

    return [...bottomPlots, ...topPlots];
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
