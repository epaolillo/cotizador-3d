import React, { useEffect } from 'react';
import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar';
import BudgetPanel from '../BudgetPanel/BudgetPanel';
import { useGridMatrix } from '../../hooks/useGridMatrix';
import { useBudget } from '../../hooks/useBudget';
import { useCanvasInteractions } from '../../hooks/useCanvasInteractions';
import './Home.css';

const Home = () => {
  // Get canvas transform state  
  const canvasInteractions = useCanvasInteractions();
  const { transform } = canvasInteractions;
  
  // Use the new matrix-based grid system (much more efficient!)
  const {
    cellLayers,
    fences,
    selectedTool,
    fixedTiles,
    gridLines,
    setSelectedTool,
    applyToolToCell,
    applyToolToSelection,
    addFence,
    getViewportInfo
  } = useGridMatrix(transform);

  const { budget } = useBudget(cellLayers, fences);
  
  // Debug viewport info (can be removed in production)
  useEffect(() => {
    const info = getViewportInfo();
    console.log('🎯 CARTESIAN PAN SYSTEM:', {
      '📏 Grid': 'FIXED isometric visualization',
      '🔲 Fixed Tiles': `${info.sizeX}x${info.sizeY} = ${info.tileCount} DOM elements (CONSTANT)`,
      '🌍 World Center': `(${info.offsetX}, ${info.offsetY})`,
      '🎮 Pan Mode': 'CARTESIAN (mouse ↓ = content ↓)',
      '🔄 Transform': 'Cartesian → Isometric coordinates',
      '💾 Data Storage': `${info.dataSize} cells with content`,
      '⚡ Performance': 'ZERO DOM creation/destruction'
    });
  }, [transform, getViewportInfo]);

  // Handle tool selection
  const handleToolSelect = (toolId) => {
    setSelectedTool(toolId);
  };

  // Handle applying tool to single cell
  const handleApplyTool = (cellId, toolId) => {
    applyToolToCell(cellId, toolId);
  };

  // Handle applying tool to selection
  const handleApplyToolToSelection = (startCell, endCell, toolId) => {
    applyToolToSelection(startCell, endCell, toolId);
  };

  // Handle fence addition
  const handleAddFence = (startCell, endCell, orientation) => {
    addFence(startCell, endCell, orientation);
  };

  return (
    <div className="home">
      <div className="home__main-container">
        <Canvas
          fixedTiles={fixedTiles}
          gridLines={gridLines}
          cellLayers={cellLayers}
          fences={fences}
          selectedTool={selectedTool}
          onApplyTool={handleApplyTool}
          onApplyToolToSelection={handleApplyToolToSelection}
          onAddFence={handleAddFence}
          canvasInteractions={canvasInteractions}
        />
        <BudgetPanel budget={budget} />
      </div>
      <Toolbar
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
      />
    </div>
  );
};

export default Home;
