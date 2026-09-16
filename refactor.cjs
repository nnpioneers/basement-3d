const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.startsWith('Plots') && f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace component signature and local state
  content = content.replace(
    /export default function (\w+)\(\{\s*onPlotSelect,\s*\}\:\s*\{\s*onPlotSelect\?\:\s*\(pos\:\s*\[number\,\s*number\,\s*number\]\s*\|\s*null\)\s*\=\>\s*void;\s*\}\)\s*\{\s*const\s*\[selectedPlotId\,\s*setSelectedPlotId\]\s*\=\s*useState\<number\s*\|\s*null\>\(null\);/g,
    `export default function $1({
  selectedPlotId,
  onPlotSelect,
}: {
  selectedPlotId?: number | null;
  onPlotSelect?: (id: number | null, pos: [number, number, number] | null) => void;
}) {`
  );

  // Replace onClick handler
  content = content.replace(
    /onClick\=\{\(worldPos\)\s*\=\>\s*\{\s*if\s*\(selectedPlotId\s*\=\=\=\s*spec\.id\)\s*\{\s*setSelectedPlotId\(null\);\s*onPlotSelect\?\.\(null\);\s*\}\s*else\s*\{\s*setSelectedPlotId\(spec\.id\);\s*onPlotSelect\?\.\(worldPos\);\s*\}\s*\}\}/g,
    `onClick={(worldPos) => {
            if (selectedPlotId === spec.id) {
              onPlotSelect?.(null, null);
            } else {
              onPlotSelect?.(spec.id, worldPos);
            }
          }}`
  );

  // Remove the unused useState import if it's there
  content = content.replace(/import { useMemo, useState } from 'react';/, "import { useMemo } from 'react';");
  content = content.replace(/import React, { useMemo, useState } from 'react';/, "import React, { useMemo } from 'react';");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
}
