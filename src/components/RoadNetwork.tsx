import { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Line, Instances, Instance } from '@react-three/drei';

export default function RoadNetwork() {
  const { geometry, shape } = useMemo(() => {
    const shape = new THREE.Shape();
    
    // Overall Layout Bounds
    // Center of roundabout is (0,0)
    const minX = -220.5; // Left edge of far-left park
    
    const minY = -51.30; // Slightly lower than -51.26 to avoid Earcut shared-edge bug
    

    // Draw solid outer boundary of the road network
    shape.moveTo(-220.5, minY); // Left bottom
    shape.lineTo(175.79, minY); // All the way across bottom road
    shape.lineTo(175.79, 94.68); // Up right 18m road
    shape.lineTo(157.77, 94.68); // Top-right of plot 201
    shape.lineTo(139.50, 94.68); // Top-left of plot 201 (prevents road above 201 while avoiding Earcut bug)
    shape.lineTo(136.50, 94.68); // Across pathway top to Park top right corner
    shape.lineTo(136.50, 66.80); // Down Park right edge
    shape.lineTo(3.00, 66.80);   // Across Park bottom edge (3m pathway)
    
    // UP the right side of the center road along Park left edge
    shape.lineTo(3.00, 89.90); // Up to Park top-left corner (aligned with restored Y-height + offset)
    
    // Across the 12m center road connecting to CA Site top-right corner
    shape.lineTo(-6.00, 89.52); // Aligned with CA Site top-right corner + offset 
    
    // DOWN the left side of the center road (along CA site)
    shape.lineTo(-6.00, 63.84); // Aligned with CA Site bottom + offset
    
    // Left side boundary tracing the CA site and left plots (flat at the same Y level to make roads level)
    shape.lineTo(-193.5, 63.84);
    shape.lineTo(-193.5, -4.61); // Down left edge of 12m road to 9m road
    shape.lineTo(-220.5, -4.61); // Across top of 9m road (above Park)
    shape.lineTo(-220.5, minY); // Down left edge of layout
    
    // Helper function to punch a rectangular hole (a block of plots/parks)
    const addBlock = (x: number, y: number, w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      const hole = new THREE.Path();
      hole.moveTo(x, y);
      hole.lineTo(x + w, y);
      hole.lineTo(x + w, y + h);
      hole.lineTo(x, y + h);
      hole.lineTo(x, y);
      shape.holes.push(hole);
    };

    // Helper function to punch a hole with ONE chamfered corner (for the roundabout)
    const addChamferedBlock = (
      x: number, y: number, w: number, h: number, 
      chamferCorner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
      chamferRadius: number
    ) => {
      const hole = new THREE.Path();
      
      if (chamferCorner === 'top-left') {
        hole.moveTo(x + chamferRadius, y + h);
        hole.lineTo(x + w, y + h);
        hole.lineTo(x + w, y);
        hole.lineTo(x, y);
        hole.lineTo(x, y + h - chamferRadius);
        hole.quadraticCurveTo(x, y + h, x + chamferRadius, y + h);
      } else if (chamferCorner === 'top-right') {
        hole.moveTo(x, y + h);
        hole.lineTo(x + w - chamferRadius, y + h);
        hole.quadraticCurveTo(x + w, y + h, x + w, y + h - chamferRadius);
        hole.lineTo(x + w, y);
        hole.lineTo(x, y);
      } else if (chamferCorner === 'bottom-right') {
        hole.moveTo(x, y + h);
        hole.lineTo(x + w, y + h);
        hole.lineTo(x + w, y + chamferRadius);
        hole.quadraticCurveTo(x + w, y, x + w - chamferRadius, y);
        hole.lineTo(x, y);
      } else if (chamferCorner === 'bottom-left') {
        hole.moveTo(x, y + h);
        hole.lineTo(x + w, y + h);
        hole.lineTo(x + w, y);
        hole.lineTo(x + chamferRadius, y);
        hole.quadraticCurveTo(x, y, x, y + chamferRadius);
      }
      
      shape.holes.push(hole);
    };

    // ==========================================
    // 1. MACRO BOUNDARY HOLES (Parks & Amenities)
    // ==========================================

    // Far-Left Bottom Park
    addBlock(minX, minY, 27.0, 37.65); // y=-51.26 to -13.61

    // Far-Left Top Plots hole is removed because the road network boundary avoids this area entirely.

    // ==========================================
    // 2. MAIN BLOCKS
    // ==========================================
    const topBlockBottomY = 27.65;
    const topBlockH = 54.0 - 27.65;
    const bottomBlockTopY = 15.65;
    const bottomBlockY = -51.26; // Adjusted to match the exact bottom edge of the plots
    const bottomBlockH = bottomBlockTopY - bottomBlockY;

    // --- LEFT SIDE BLOCKS ---
    let currentRightX = -6.0;
    const leftBlockWidths = [28.5, 27.0, 27.0, 27.0, 30.0];
    const leftRoadWidths = [9.0, 9.0, 9.0, 9.0, 12.0];
    
    // Custom heights for top blocks to match plot boundaries (leaving 2m pathway under CA Site)
    const leftTopBlockHeights = [
      61.80 - 27.65, // Block 1 (aligned with shortened top boundary Y=61.80)
      61.80 - 27.65, // Block 2 (aligned with shortened top boundary Y=61.80)
      61.80 - 27.65, // Block 3 (aligned with shortened top boundary Y=61.80)
      60.65 - 27.65, // Block 4
      59.30 - 27.65  // Block 5
    ];

    leftBlockWidths.forEach((width, index) => {
      const currentLeftX = currentRightX - width;
      const h = leftTopBlockHeights[index];
      
      // Top Block
      if (index === 0) {
        addChamferedBlock(currentLeftX, topBlockBottomY, width, h, 'bottom-right', 6.0);
      } else {
        addBlock(currentLeftX, topBlockBottomY, width, h);
      }
      
      // Bottom Block
      if (index === 0) {
        addChamferedBlock(currentLeftX, bottomBlockY, width, bottomBlockH, 'top-right', 6.0);
      } else {
        addBlock(currentLeftX, bottomBlockY, width, bottomBlockH);
      }
      
      currentRightX = currentLeftX - leftRoadWidths[index];
    });

    // --- RIGHT SIDE BLOCKS ---
    let currentLeftX = 6.0;
    const rightBlockWidths = [31.5, 30.0, 30.0, 33.27];
    const rightRoadWidths = [9.0, 9.0, 9.0, 18.0];

    rightBlockWidths.forEach((width, index) => {
      const currentRightX = currentLeftX + width;
      
      if (index === 1 || index === 2) {
        // Block 2 and 3: Split into Bottom and Top blocks separated by 12m road (15.65 to 27.65)
        addBlock(currentLeftX, -51.26, width, 15.65 - (-51.26));
        addBlock(currentLeftX, 27.65, width, 63.80 - 27.65);
      } else if (index === 3) {
        // Block 4: Split into Bottom and Top blocks.
        // Left part
        addBlock(currentLeftX, -51.26, 14.98, 15.65 - (-51.26));
        addBlock(currentLeftX, 27.65, 14.98, 63.80 - 27.65);
        // Right part
        addBlock(currentLeftX + 15.0, -51.26, 18.27, 15.65 - (-51.26));
        addBlock(currentLeftX + 15.0, 27.65, 18.27, 94.64 - 27.65); // Merged top plots 195-201
      } else {
        // Top Block
        if (index === 0) {
          addChamferedBlock(currentLeftX, topBlockBottomY, width, 63.80 - topBlockBottomY, 'bottom-left', 6.0);
        } else {
          addBlock(currentLeftX, topBlockBottomY, width, topBlockH);
        }
        
        // Bottom Block
        if (index === 0) {
          addChamferedBlock(currentLeftX, bottomBlockY, width, bottomBlockH, 'top-left', 6.0);
        } else {
          addBlock(currentLeftX, bottomBlockY, width, bottomBlockH);
        }
      }
      
      currentLeftX = currentRightX + rightRoadWidths[index];
    });

    // ==========================================
    // 3. ROUNDABOUT ISLAND
    // ==========================================
    const islandHole = new THREE.Path();
    islandHole.absarc(0, 21.65, 3.5, 0, Math.PI * 2, false);
    shape.holes.push(islandHole);

    // ==========================================
    // EXTRUSION SETTINGS
    // ==========================================
    const extrudeSettings = {
      steps: 1,
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 4
    };
    
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    return { geometry: geom, shape };
  }, []);

  // Helper function to collect dashed line transforms
  const dashedLineInstances = useMemo(() => {
    const dashes: { key: string; pos: [number, number, number]; rot: [number, number, number] }[] = [];
    const renderDashedLine = (startX: number, startY: number, endX: number, endY: number) => {
      const dashLength = 2.0;
      const gapLength = 2.0;
      const dx = endX - startX;
      const dy = endY - startY;
      const totalLength = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(totalLength / (dashLength + gapLength));
      const angle = Math.atan2(dy, dx);
      for (let i = 0; i < steps; i++) {
        const cx = startX + Math.cos(angle) * (i * (dashLength + gapLength) + dashLength / 2);
        const cy = startY + Math.sin(angle) * (i * (dashLength + gapLength) + dashLength / 2);
        dashes.push({ key: `${startX}-${startY}-${i}`, pos: [cx, cy, 0.71], rot: [0, 0, angle] });
      }
    };

    renderDashedLine(-187.5, 21.65, -6.0, 21.65);
    renderDashedLine(6.0, 21.65, 157.77, 21.65);
    renderDashedLine(-220.5, -9.11, -193.5, -9.11);
    renderDashedLine(-187.5, -51.26, -187.5, 54.0);
    renderDashedLine(-147.0, -51.26, -147.0, 54.0);
    renderDashedLine(-111.0, -51.26, -111.0, 54.0);
    renderDashedLine(-75.0, -51.26, -75.0, 54.0);
    renderDashedLine(-39.0, -51.26, -39.0, 54.0);
    renderDashedLine(0, -51.26, 0, 15.65);
    renderDashedLine(0, 27.65, 0, 89.5);
    renderDashedLine(42.0, -51.26, 42.0, 54.0);
    renderDashedLine(81.0, -51.26, 81.0, 57.0);
    renderDashedLine(120.0, -51.26, 120.0, 57.0);
    renderDashedLine(166.77, -51.26, 166.77, 94.64);

    // Roundabout Circular Dashed Line
    const r = 4.75;
    const circ = 2 * Math.PI * r;
    const dashL = 1.5;
    const gapL = 1.5;
    const steps = Math.floor(circ / (dashL + gapL));
    const angleStep = (Math.PI * 2) / steps;
    for(let i=0; i<steps; i++) {
      const angle = i * angleStep;
      const cx = Math.cos(angle) * r;
      const cy = Math.sin(angle) * r + 21.65;
      const tangent = angle + Math.PI / 2;
      dashes.push({ key: `roundabout-${i}`, pos: [cx, cy, 0.71], rot: [0, 0, tangent] });
    }

    return dashes;
  }, []);

  // Helper function to collect zebra crossing transforms
  const zebraInstances = useMemo(() => {
    const stripes: { key: string; pos: [number, number, number]; rot: [number, number, number] }[] = [];
    const renderZebraCrossing = (x: number, y: number, roadWidth: number, _length: number, rotation: number) => {
      const numStripes = Math.floor(roadWidth / 1.0);
      for (let i = 0; i < numStripes; i++) {
        const offset = (i - numStripes / 2 + 0.5) * 1.0;
        const cx = x + Math.cos(rotation + Math.PI/2) * offset;
        const cy = y + Math.sin(rotation + Math.PI/2) * offset;
        stripes.push({ key: `zebra-${x}-${y}-${i}`, pos: [cx, cy, 0.71], rot: [0, 0, rotation] });
      }
    };

    renderZebraCrossing(-8.5, 21.65, 12.0, 3.0, 0);
    renderZebraCrossing(8.5, 21.65, 12.0, 3.0, 0);
    renderZebraCrossing(0, 30.15, 12.0, 3.0, Math.PI / 2);
    renderZebraCrossing(0, 13.15, 12.0, 3.0, Math.PI / 2);
    return stripes;
  }, []);

  // Extract boundary and holes for continuous edge lines
  const { shapeLines, holeLines } = useMemo(() => {
    const points = shape.extractPoints(5); // Adjust divisions for smoothness
    
    // Helper to map Vector2 array to [x, y, z] tuples
    const toPoints3D = (vec2Array: THREE.Vector2[]) => 
      vec2Array.map(p => [p.x, p.y, 0.71] as [number, number, number]);

    return {
      shapeLines: toPoints3D(points.shape),
      holeLines: points.holes.map(hole => toPoints3D(hole))
    };
  }, [shape]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry} receiveShadow castShadow={false} raycast={() => null}>
        <meshStandardMaterial 
          attach="material-0" 
          color="#2a2b30" // Realistic dark asphalt color
          roughness={0.95} 
          metalness={0.1}
        />
        <meshStandardMaterial 
          attach="material-1" 
          color="#a0a0a0" // Realistic concrete kerb color
          roughness={1.0} 
          metalness={0.0}
        />
      </mesh>

      {/* Solid Continuous Edge Lines (Road Borders) */}
      <Line points={shapeLines} color="#ffffff" lineWidth={1.5} opacity={0.8} transparent raycast={() => null} />
      {holeLines.map((pts, i) => (
        <Line key={`hole-${i}`} points={pts} color="#ffffff" lineWidth={1.5} opacity={0.8} transparent raycast={() => null} />
      ))}

      {/* Road Markings - Instanced Dashed Lines */}
      <Instances limit={dashedLineInstances.length} raycast={() => null}>
        <planeGeometry args={[2.0, 0.25]} />
        <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
        {dashedLineInstances.map(d => (
          <Instance key={d.key} position={d.pos} rotation={d.rot} />
        ))}
      </Instances>

      {/* Road Markings - Instanced Zebra Crossings */}
      <Instances limit={zebraInstances.length} raycast={() => null}>
        <planeGeometry args={[3.0, 0.5]} />
        <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
        {zebraInstances.map(z => (
          <Instance key={z.key} position={z.pos} rotation={z.rot} />
        ))}
      </Instances>

      {/* Road Name Labels */}
      {[
        // Main Horizontal Road (Left Side) - Offset Y from 21.65 to 20.15
        { text: "12.0 Meter Road", pos: [-135.0, 20.15], rot: 0, size: 2.0 },
        { text: "12.0 Meter Road", pos: [-55.0, 20.15], rot: 0, size: 2.0 },
        // Main Horizontal Road (Right Side) - Offset Y from 21.65 to 20.15
        { text: "12.0 Meter Road", pos: [35.0, 20.15], rot: 0, size: 2.0 },
        { text: "12.0 Meter Road", pos: [85.0, 20.15], rot: 0, size: 2.0 },
        { text: "12.0 Meter Road", pos: [135.0, 20.15], rot: 0, size: 2.0 },

        // Top Horizontal Road (Left Side) - Offset Y from -9.11 to -10.61
        { text: "9.0 Meter Road", pos: [-207.0, -10.61], rot: 0, size: 1.5 },

        // Vertical 12m Road (Far Left) - Center X is -187.5, offset to -186.0
        { text: "12.0 Meter Road", pos: [-186.0, 35], rot: Math.PI / 2, size: 2.0 },
        { text: "12.0 Meter Road", pos: [-186.0, -25], rot: Math.PI / 2, size: 2.0 },

        // Vertical 9m Roads (Left side) - Offset X by +1.5
        { text: "9.0 Meter Road", pos: [-145.5, 35], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [-145.5, -25], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [-109.5, 35], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [-109.5, -25], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [-73.5, 35], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [-73.5, -25], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [-37.5, 35], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [-37.5, -25], rot: Math.PI / 2, size: 1.5 },

        // Center 12m Road - Center X is 0, offset to +1.5
        { text: "12.0 Meter Road", pos: [1.5, 35], rot: Math.PI / 2, size: 2.0 },
        { text: "12.0 Meter Road", pos: [1.5, -25], rot: Math.PI / 2, size: 2.0 },

        // Vertical 9m Roads (Right side) - Offset X by +1.5
        { text: "9.0 Meter Road", pos: [43.5, 35], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [43.5, -25], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [82.5, 35], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [82.5, -25], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [121.5, 35], rot: Math.PI / 2, size: 1.5 },
        { text: "9.0 Meter Road", pos: [121.5, -25], rot: Math.PI / 2, size: 1.5 },

        // Vertical 18m Road (Far Right) - Center X is 166.77, offset to 168.27
        { text: "18.0 Meter Road", pos: [168.27, 35], rot: Math.PI / 2, size: 3.0 },
        { text: "18.0 Meter Road", pos: [168.27, -25], rot: Math.PI / 2, size: 3.0 },

        // Pathway
        { text: "3.0 Meter Pathway", pos: [85, 65.30], rot: 0, size: 0.8 },
      ].map((label, index) => (
        <Text
          key={`label-${index}`}
          position={[label.pos[0], label.pos[1], 0.72]}
          rotation={[0, 0, label.rot]}
          fontSize={label.size}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          raycast={() => null}
        >
          {label.text}
        </Text>
      ))}
    </group>
  );
}
