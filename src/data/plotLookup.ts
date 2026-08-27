// Dynamic registry of Plot ID to Exact World Positions [x, y, z]

const plotRegistry = new Map<number, [number, number, number]>();

export function registerPlotPosition(id: number, pos: [number, number, number]) {
  plotRegistry.set(id, pos);
}

export function getPlotPosition(id: number): [number, number, number] | null {
  return plotRegistry.get(id) || null;
}
