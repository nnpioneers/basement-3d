// Dynamic registry of Plot ID to Exact World Positions [x, y, z]

const plotRegistry = new Map<number, [number, number, number]>();

export function registerPlotPosition(id: number, pos: [number, number, number]) {
  plotRegistry.set(id, pos);
}

export function getPlotPosition(id: number): [number, number, number] | null {
  return plotRegistry.get(id) || null;
}

export type PlotCorners = [ [number, number], [number, number], [number, number], [number, number] ];
const plotCornersRegistry = new Map<number, PlotCorners>();

export function registerPlotCorners(id: number, corners: PlotCorners) {
  plotCornersRegistry.set(id, corners);
}

export function getAllPlotCorners(): PlotCorners[] {
  return Array.from(plotCornersRegistry.values());
}

// ── Outlines Registry for Single Draw Call Plot Outlines ──
const blockOutlinesMap = new Map<string, number[]>();
type Listener = () => void;
const listeners = new Set<Listener>();

export function registerBlockOutlines(blockId: string, positions: number[]) {
  blockOutlinesMap.set(blockId, positions);
  listeners.forEach(l => l());
}

export function registerPlotsInfoOutlines(blockId: string, plotsInfo: { spec: { depthB: number; depthT: number; frontage: number }; x: number; y: number }[]) {
  const BORDER_Z = 0.235;
  const positions: number[] = [];
  plotsInfo.forEach(({ spec, x, y }) => {
    const c0 = [x, y, BORDER_Z];
    const c1 = [x, y + spec.frontage, BORDER_Z];
    const c2 = [x - spec.depthT, y + spec.frontage, BORDER_Z];
    const c3 = [x - spec.depthB, y, BORDER_Z];

    positions.push(...c0, ...c1);
    positions.push(...c1, ...c2);
    positions.push(...c2, ...c3);
    positions.push(...c3, ...c0);
  });
  registerBlockOutlines(blockId, positions);
}

export function subscribeOutlines(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getAllOutlinePositions(): number[] {
  const result: number[] = [];
  blockOutlinesMap.forEach(posArr => {
    result.push(...posArr);
  });
  return result;
}
