import React from 'react';
import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar';
import BudgetPanel from '../BudgetPanel/BudgetPanel';
import { useGrid } from '../../hooks/useGrid';
import { useBudget } from '../../hooks/useBudget';
import { INTERACTION_MODES } from '../../utils/constants';
import './Home.css';

const Home = () => {
  const {
    cellLayers,
    fences,
    selectedTool,
    gridCells,
    gridLines,
    setSelectedTool,
    applyToolToCell,
    applyToolToSelection,
    addFence
  } = useGrid();

  const { budget } = useBudget(cellLayers, fences);

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
          gridCells={gridCells}
          gridLines={gridLines}
          cellLayers={cellLayers}
          fences={fences}
          selectedTool={selectedTool}
          onApplyTool={handleApplyTool}
          onApplyToolToSelection={handleApplyToolToSelection}
          onAddFence={handleAddFence}
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
