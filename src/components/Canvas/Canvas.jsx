import React, { useRef, useCallback, useState, useEffect } from 'react';
import Tile from '../Tile/Tile';
import CanvasInstructions from './CanvasInstructions';
import { useCanvasInteractions } from '../../hooks/useCanvasInteractions';
import { INTERACTION_MODES, TOOLS_CONFIG } from '../../utils/constants';
import { getCellsInSelection } from '../../utils/gridUtils';
import './Canvas.css';

const Canvas = ({
  fixedTiles,
  gridLines,
  cellLayers,
  fences,
  selectedTool,
  onApplyTool,
  onApplyToolToSelection,
  onAddFence,
  canvasInteractions
}) => {
  const containerRef = useRef(null);
  
  // Use provided canvas interactions or create new ones (backwards compatibility)
  const localCanvasInteractions = useCanvasInteractions();
  const interactions = canvasInteractions || localCanvasInteractions;
  
  const {
    getTransformString,
    isPanning,
    isSelecting,
    isPlacingFence,
    selectionStart,
    selectionEnd,
    fencePreview,
    startPan,
    handlePan,
    endPan,
    startSelection,
    updateSelection,
    startFencePlacement,
    updateFencePreview,
    setMode,
    resetView
  } = interactions;

  // Determine interaction mode based on selected tool
  React.useEffect(() => {
    if (selectedTool === 'move') {
      setMode(INTERACTION_MODES.PAN);
    } else if (selectedTool === 'fence') {
      setMode(INTERACTION_MODES.PLACE_FENCE);
    } else {
      setMode(INTERACTION_MODES.SELECT);
    }
  }, [selectedTool, setMode]);

  // Handle container mouse events
  const handleContainerMouseDown = useCallback((event) => {
    // Allow pan with left click when move tool is selected OR with right click always
    if (selectedTool === 'move' && event.button === 0) {
      startPan(event);
    } else if (event.button === 2) { // Right click for pan
      event.preventDefault(); // Prevent context menu
      startPan(event);
    }
  }, [selectedTool, startPan]);

  const handleContainerMouseMove = useCallback((event) => {
    handlePan(event);
  }, [handlePan]);

  const handleContainerMouseUp = useCallback(() => {
    endPan();
  }, [endPan]);

  const handleContainerMouseLeave = useCallback(() => {
    endPan();
  }, [endPan]);


  // Handle tile interactions
  const handleTileMouseDown = useCallback((cell, event) => {
    event.stopPropagation();
    
    // Right click always starts pan, regardless of selected tool
    if (event.button === 2) {
      event.preventDefault(); // Prevent context menu
      startPan(event);
      return;
    }
    
    // Left click behavior depends on selected tool
    if (selectedTool === 'fence') {
      const result = startFencePlacement(cell);
      if (result && onAddFence) {
        onAddFence(result.start, result.end, result.orientation);
      }
    } else if (selectedTool !== 'move') {
      const result = startSelection(cell);
      if (result && onApplyToolToSelection) {
        onApplyToolToSelection(result.start, result.end, selectedTool);
      }
    }
  }, [selectedTool, startFencePlacement, startSelection, onAddFence, onApplyToolToSelection, startPan]);

  const handleTileMouseEnter = useCallback((cell) => {
    if (selectedTool === 'fence') {
      updateFencePreview(cell);
    } else if (isSelecting) {
      updateSelection(cell);
    }
  }, [selectedTool, isSelecting, updateFencePreview, updateSelection]);

  // Get cells in current selection
  const getCellsInCurrentSelection = useCallback(() => {
    if (!isSelecting || !selectionStart || !selectionEnd) return [];
    return getCellsInSelection(selectionStart, selectionEnd);
  }, [isSelecting, selectionStart, selectionEnd]);

  const cellsInSelection = getCellsInCurrentSelection();

  // Prevent context menu on right click
  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
  }, []);
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    // Reset view on 'R' key or 'Home' key
    if (event.key === 'r' || event.key === 'R' || event.key === 'Home') {
      event.preventDefault();
      resetView();
    }
  }, [resetView]);
  
  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Get cursor style
  const getCursorStyle = () => {
    if (isPanning) {
      return 'grabbing';
    }
    if (selectedTool === 'move') {
      return 'grab';
    }
    return 'default';
  };

  return (
    <div className="canvas">
      <CanvasInstructions />
      <div
        ref={containerRef}
        className="canvas__container"
        style={{ cursor: getCursorStyle() }}
        onMouseDown={handleContainerMouseDown}
        onMouseMove={handleContainerMouseMove}
        onMouseUp={handleContainerMouseUp}
        onMouseLeave={handleContainerMouseLeave}
        onContextMenu={handleContextMenu}
      >
        <div className="canvas__grid">
          {/* Grid Lines */}
          {gridLines.map((line) => (
            <div
              key={line.id}
              className={`canvas__grid-line canvas__grid-line--${line.type}`}
              style={line.style}
            />
          ))}

          {/* FIXED Tiles - same DOM elements always, only content changes */}
          {fixedTiles.map((tile) => {
            // Get data for this world position
            const worldId = tile.worldId;
            const topLayer = tile.layers && tile.layers.length > 0 
              ? tile.layers[tile.layers.length - 1] 
              : null;
            
            const tileFences = tile.fences || [];
            const isInSelection = cellsInSelection.some(selCell => selCell.id === worldId);

            return (
              <Tile
                key={tile.id} // Stable viewport ID - never changes
                cell={{
                  id: worldId, // World ID for logic
                  x: tile.worldX,
                  y: tile.worldY,
                  style: tile.style // Fixed position
                }}
                topLayer={topLayer}
                fences={tileFences}
                isSelected={false}
                isInSelection={isInSelection}
                onMouseDown={handleTileMouseDown}
                onMouseEnter={handleTileMouseEnter}
              />
            );
          })}

          {/* Fence Preview */}
          {fencePreview && (
            <div
              className={`canvas__fence-preview canvas__fence-preview--${fencePreview.orientation}`}
              style={{
                left: `${fencePreview.cell.style.left}px`,
                top: `${fencePreview.cell.style.top}px`,
                width: `${fencePreview.cell.style.width}px`,
                height: `${fencePreview.cell.style.height}px`
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
