import { useMemo, useCallback, memo } from 'react';
import InteractivePlot, { type PlotSpec } from './InteractivePlot';
import type { PlotStatusMap } from '../types/plot';

function PlotsBlock5Right({
  selectedPlotId,
  onPlotSelect,
  plotStatusMap,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
  plotStatusMap?: PlotStatusMap;
}) {

  const plotsInfo = useMemo(() => {
    const roadRightX = -151.5;

    const specsBottom: PlotSpec[] = [
      { id: 17, depthB: 15.00, depthT: 15.00, frontage: 9.91 },
      { id: 18, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 19, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 20, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 21, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 22, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 23, depthB: 15.00, depthT: 15.00, frontage: 12.00 },
    ];

    let currentYBottom = -51.26;
    const bottomPlots = specsBottom.map((spec) => {
      const y = currentYBottom;
      currentYBottom += spec.frontage;
      return { spec, x: roadRightX, y };
    });

    const specsTop: PlotSpec[] = [
      { id: 24, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 25, depthB: 15.00, depthT: 15.00, frontage: 9.00 },
      { id: 26, depthB: 15.00, depthT: 15.00, frontage: 13.65 },
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

export default memo(PlotsBlock5Right);
