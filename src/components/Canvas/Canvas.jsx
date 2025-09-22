import React, { useRef, useCallback } from 'react';
import Tile from '../Tile/Tile';
import CanvasInstructions from './CanvasInstructions';
import { useCanvasInteractions } from '../../hooks/useCanvasInteractions';
import { INTERACTION_MODES, TOOLS_CONFIG } from '../../utils/constants';
import { getCellsInSelection } from '../../utils/gridUtils';
import './Canvas.css';

const Canvas = ({
  gridCells,
  gridLines,
  cellLayers,
  fences,
  selectedTool,
  onApplyTool,
  onApplyToolToSelection,
  onAddFence
}) => {
  const containerRef = useRef(null);
  
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
    handleZoom,
    startSelection,
    updateSelection,
    startFencePlacement,
    updateFencePreview,
    setMode
  } = useCanvasInteractions();

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

  const handleWheel = useCallback((event) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      handleZoom(event, containerRect);
    }
  }, [handleZoom]);

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
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      >
        <div 
          className="canvas__grid" 
          style={{ transform: getTransformString() }}
        >
          {/* Grid Lines */}
          {gridLines.map((line) => (
            <div
              key={line.id}
              className={`canvas__grid-line canvas__grid-line--${line.type}`}
              style={line.style}
            />
          ))}

          {/* Grid Cells (Tiles) */}
          {gridCells.map((cell) => {
            const topLayer = cellLayers[cell.id] && cellLayers[cell.id].length > 0 
              ? cellLayers[cell.id][cellLayers[cell.id].length - 1] 
              : null;
            
            const cellFences = fences.filter(fence => fence.cellId === cell.id);
            const isInSelection = cellsInSelection.some(selCell => selCell.id === cell.id);

            return (
              <Tile
                key={cell.id}
                cell={cell}
                topLayer={topLayer}
                fences={cellFences}
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
