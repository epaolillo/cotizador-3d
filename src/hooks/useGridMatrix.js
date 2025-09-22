import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DataMatrix, ViewportMatrix } from '../utils/gridUtils';
import { GRID_CONFIG } from '../utils/constants';

// Custom hook for grid management using matrix-based infinite system
export const useGridMatrix = (transform = { translateX: 0, translateY: 0 }) => {
  const [selectedTool, setSelectedTool] = useState('move');
  
  // Create persistent matrix instances
  const dataMatrix = useRef(new DataMatrix()).current;
  const viewportMatrix = useRef(new ViewportMatrix()).current;
  
  // State to trigger re-renders when viewport changes
  const [viewportVersion, setViewportVersion] = useState(0);
  
  // Convert pan transform to world coordinates
  const getWorldCoordinates = useCallback((transform) => {
    // Convert cartesian screen pan to isometric world coordinates
    const cellsPerPixel = 1 / GRID_CONFIG.GRID_SIZE;
    
    // Raw cartesian pan values
    const panX = -transform.translateX * cellsPerPixel;
    const panY = -transform.translateY * cellsPerPixel;
    
    // Convert cartesian pan to isometric coordinates
    // This compensates for the 45° rotation of the isometric view
    // Using inverse isometric transformation matrix
    const cos45 = Math.cos(Math.PI / 4); // cos(45°) ≈ 0.707
    const sin45 = Math.sin(Math.PI / 4); // sin(45°) ≈ 0.707
    
    const worldX = (panX * cos45 + panY * sin45);
    const worldY = (-panX * sin45 + panY * cos45);
    
    return { worldX, worldY };
  }, []);
  
  // Sync viewport with data matrix based on current transform
  const syncViewport = useCallback((force = false) => {
    const { worldX, worldY } = getWorldCoordinates(transform);
    
    // Round to avoid excessive syncing
    const roundedX = Math.round(worldX);
    const roundedY = Math.round(worldY);
    
    // Only sync if position changed significantly or forced
    if (force || 
        Math.abs(roundedX - viewportMatrix.viewportOffsetX) >= 1 || 
        Math.abs(roundedY - viewportMatrix.viewportOffsetY) >= 1) {
      
      viewportMatrix.syncWithData(dataMatrix, roundedX, roundedY);
      setViewportVersion(prev => prev + 1); // Trigger re-render
    }
  }, [transform, getWorldCoordinates, viewportMatrix, dataMatrix]);
  
  // Initial sync and sync on transform changes
  useEffect(() => {
    syncViewport(true);
  }, [transform.translateX, transform.translateY, syncViewport]);
  
  // Get FIXED tiles (same DOM elements always)
  const fixedTiles = useMemo(() => {
    return viewportMatrix.getFixedTiles();
  }, [viewportMatrix]); // No viewportVersion dependency - tiles are always same objects
  
  const gridLines = useMemo(() => {
    return viewportMatrix.getLines();
  }, [viewportMatrix]); // Lines are fixed, no version dependency needed
  
  // Apply tool to a specific cell
  const applyToolToCell = useCallback((cellId, toolId) => {
    // Find the tile in viewport to get world coordinates
    const tile = viewportMatrix.getFixedTiles().find(t => t.worldId === cellId);
    if (!tile) return;
    
    // Use world coordinates for data matrix
    const { worldX, worldY } = tile;
    
    // Get current cell from data matrix
    const dataCell = dataMatrix.getCell(worldX, worldY);
    const layers = [...dataCell.layers];
    
    if (toolId === 'erase') {
      // Remove the last layer
      if (layers.length > 0) {
        layers.pop();
      }
    } else if (toolId !== 'fence' && toolId !== 'move') {
      // Add new material layer
      layers.push(toolId);
    }
    
    // Update data matrix with world coordinates
    dataMatrix.updateCellLayers(worldX, worldY, layers);
    
    // Re-sync viewport to show changes
    syncViewport(true);
  }, [dataMatrix, viewportMatrix, syncViewport]);
  
  // Apply tool to multiple cells (selection)
  const applyToolToSelection = useCallback((startCell, endCell, toolId) => {
    // Get world coordinates from tiles
    const fixedTiles = viewportMatrix.getFixedTiles();
    const startTile = fixedTiles.find(t => t.worldId === startCell.id);
    const endTile = fixedTiles.find(t => t.worldId === endCell.id);
    
    if (!startTile || !endTile) return;
    
    const startX = startTile.worldX;
    const startY = startTile.worldY;
    const endX = endTile.worldX;
    const endY = endTile.worldY;

    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    // Apply tool to all cells in selection using world coordinates
    for (let worldX = minX; worldX <= maxX; worldX++) {
      for (let worldY = minY; worldY <= maxY; worldY++) {
        const cellId = `${worldX},${worldY}`;
        applyToolToCell(cellId, toolId);
      }
    }
  }, [viewportMatrix, applyToolToCell]);
  
  // Add fence between two cells
  const addFence = useCallback((startCell, endCell, orientation) => {
    // Get world coordinates from viewport tiles
    const fixedTiles = viewportMatrix.getFixedTiles();
    const endTile = fixedTiles.find(t => t.worldId === endCell.id);
    
    if (!endTile) return;
    
    const fenceId = `fence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFence = {
      id: fenceId,
      startCell,
      endCell,
      orientation,
      cellId: endCell.id
    };
    
    // Use world coordinates for data matrix
    const { worldX, worldY } = endTile;
    
    // Get current cell fences
    const cell = dataMatrix.getCell(worldX, worldY);
    const fences = [...cell.fences, newFence];
    
    // Update data matrix with world coordinates
    dataMatrix.updateCellFences(worldX, worldY, fences);
    
    // Re-sync viewport to show changes
    syncViewport(true);
  }, [dataMatrix, viewportMatrix, syncViewport]);
  
  // Get cell layers for budget calculation
  const getCellLayers = useCallback(() => {
    const layers = {};
    const allData = dataMatrix.getAllData();
    
    for (const [cellId, cellData] of allData) {
      if (cellData.layers && cellData.layers.length > 0) {
        layers[cellId] = cellData.layers;
      }
    }
    
    return layers;
  }, [dataMatrix]);
  
  // Get all fences for budget calculation  
  const getAllFences = useCallback(() => {
    const allFences = [];
    const allData = dataMatrix.getAllData();
    
    for (const [, cellData] of allData) {
      if (cellData.fences && cellData.fences.length > 0) {
        allFences.push(...cellData.fences);
      }
    }
    
    return allFences;
  }, [dataMatrix]);
  
  // Clear all data (reset grid)
  const clearGrid = useCallback(() => {
    dataMatrix.data.clear();
    syncViewport(true);
  }, [dataMatrix, syncViewport]);
  
  // Get viewport configuration for debugging
  const getViewportInfo = useCallback(() => ({
    sizeX: viewportMatrix.sizeX,
    sizeY: viewportMatrix.sizeY,
    offsetX: viewportMatrix.viewportOffsetX,
    offsetY: viewportMatrix.viewportOffsetY,
    tileCount: fixedTiles.length, // Fixed tiles count
    dataSize: dataMatrix.data.size
  }), [viewportMatrix, fixedTiles.length, dataMatrix]);
  
  return {
    // State
    selectedTool,
    fixedTiles, // Fixed DOM elements
    gridLines,
    
    // Computed for compatibility
    cellLayers: getCellLayers(),
    fences: getAllFences(),
    
    // Actions
    setSelectedTool,
    applyToolToCell,
    applyToolToSelection,
    addFence,
    clearGrid,
    
    // Matrix system utilities
    syncViewport,
    getViewportInfo,
    
    // Direct access to matrices (for advanced usage)
    dataMatrix,
    viewportMatrix
  };
};
