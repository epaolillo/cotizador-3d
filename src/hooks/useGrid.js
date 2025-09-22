import { useState, useCallback, useMemo } from 'react';
import { generateGridCells, generateGridLines, getCellsInSelection } from '../utils/gridUtils';

// Custom hook for grid management
export const useGrid = () => {
  const [cellLayers, setCellLayers] = useState({});
  const [fences, setFences] = useState([]);
  const [selectedTool, setSelectedTool] = useState('move');
  
  // Generate grid data - memoized for performance
  const gridCells = useMemo(() => generateGridCells(), []);
  const gridLines = useMemo(() => generateGridLines(), []);

  // Apply tool to a specific cell
  const applyToolToCell = useCallback((cellId, toolId) => {
    setCellLayers(prevLayers => {
      const newLayers = { ...prevLayers };
      
      // Initialize layers array if it doesn't exist
      if (!newLayers[cellId]) {
        newLayers[cellId] = [];
      }
      
      const layers = [...newLayers[cellId]];
      
      if (toolId === 'erase') {
        // Remove the last layer
        if (layers.length > 0) {
          layers.pop();
        }
      } else if (toolId !== 'fence' && toolId !== 'move') {
        // Add new material layer
        layers.push(toolId);
      }
      
      newLayers[cellId] = layers;
      return newLayers;
    });
  }, []);

  // Apply tool to multiple cells (selection)
  const applyToolToSelection = useCallback((startCell, endCell, toolId) => {
    const cellsInSelection = getCellsInSelection(startCell, endCell);
    
    cellsInSelection.forEach(cell => {
      applyToolToCell(cell.id, toolId);
    });
  }, [applyToolToCell]);

  // Add fence between two cells
  const addFence = useCallback((startCell, endCell, orientation) => {
    const fenceId = `fence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFence = {
      id: fenceId,
      startCell,
      endCell,
      orientation,
      cellId: endCell.id // Position fence on end cell
    };
    
    setFences(prevFences => [...prevFences, newFence]);
  }, []);

  // Remove all fences from a specific cell
  const removeFencesFromCell = useCallback((cellId) => {
    setFences(prevFences => prevFences.filter(fence => fence.cellId !== cellId));
  }, []);

  // Get top layer for a cell
  const getCellTopLayer = useCallback((cellId) => {
    const layers = cellLayers[cellId];
    return layers && layers.length > 0 ? layers[layers.length - 1] : null;
  }, [cellLayers]);

  // Get all fences for a specific cell
  const getCellFences = useCallback((cellId) => {
    return fences.filter(fence => fence.cellId === cellId);
  }, [fences]);

  // Clear all data (reset grid)
  const clearGrid = useCallback(() => {
    setCellLayers({});
    setFences([]);
  }, []);

  return {
    // State
    cellLayers,
    fences,
    selectedTool,
    gridCells,
    gridLines,
    
    // Actions
    setSelectedTool,
    applyToolToCell,
    applyToolToSelection,
    addFence,
    removeFencesFromCell,
    clearGrid,
    
    // Getters
    getCellTopLayer,
    getCellFences
  };
};
