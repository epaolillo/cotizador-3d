import { useState, useCallback, useRef, useEffect } from 'react';
import { INTERACTION_MODES } from '../utils/constants';
import { getFenceOrientation } from '../utils/gridUtils';

// Custom hook for canvas interactions (pan, zoom, selection)
export const useCanvasInteractions = () => {
  // Canvas transform state - only pan (no zoom)
  const [transform, setTransform] = useState({
    translateX: 0,
    translateY: 0
  });

  // Interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [interactionMode, setInteractionMode] = useState(INTERACTION_MODES.SELECT);

  // Fence placement state
  const [fenceStart, setFenceStart] = useState(null);
  const [fencePreview, setFencePreview] = useState(null);
  const [isPlacingFence, setIsPlacingFence] = useState(false);

  // Refs for pan calculations
  const panStartRef = useRef({ x: 0, y: 0 });
  const transformStartRef = useRef({ translateX: 0, translateY: 0 });

  // Start panning
  const startPan = useCallback((event) => {
    // Allow pan with move tool (any button) or right click regardless of mode
    const allowPan = interactionMode === INTERACTION_MODES.PAN || event.button === 2;
    if (!allowPan) return;
    
    setIsPanning(true);
    panStartRef.current = {
      x: event.clientX,
      y: event.clientY
    };
    transformStartRef.current = {
      translateX: transform.translateX,
      translateY: transform.translateY
    };
  }, [interactionMode, transform.translateX, transform.translateY]);

  // Handle panning - infinite canvas, no constraints
  const handlePan = useCallback((event) => {
    if (!isPanning) return;

    const deltaX = event.clientX - panStartRef.current.x;
    const deltaY = event.clientY - panStartRef.current.y;
    
    const newTranslateX = transformStartRef.current.translateX + deltaX;
    const newTranslateY = transformStartRef.current.translateY + deltaY;
    
    // No constraints - infinite canvas
    setTransform(prev => ({
      ...prev,
      translateX: newTranslateX,
      translateY: newTranslateY
    }));
  }, [isPanning]);

  // End panning
  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);


  // Start selection
  const startSelection = useCallback((cell) => {
    if (interactionMode !== INTERACTION_MODES.SELECT) return;
    
    if (!isSelecting) {
      setIsSelecting(true);
      setSelectionStart(cell);
      setSelectionEnd(cell);
    } else {
      // End selection
      setIsSelecting(false);
      const start = selectionStart;
      const end = cell;
      
      // Clear selection state
      setSelectionStart(null);
      setSelectionEnd(null);
      
      return { start, end };
    }
  }, [interactionMode, isSelecting, selectionStart]);

  // Update selection preview
  const updateSelection = useCallback((cell) => {
    if (isSelecting) {
      setSelectionEnd(cell);
    }
  }, [isSelecting]);

  // Start fence placement
  const startFencePlacement = useCallback((cell) => {
    if (interactionMode !== INTERACTION_MODES.PLACE_FENCE) return;
    
    if (!isPlacingFence) {
      setIsPlacingFence(true);
      setFenceStart(cell);
      setFencePreview(null);
    } else {
      // Complete fence placement
      setIsPlacingFence(false);
      const start = fenceStart;
      const end = cell;
      const orientation = getFenceOrientation(start, end);
      
      // Clear fence state
      setFenceStart(null);
      setFencePreview(null);
      
      return { start, end, orientation };
    }
  }, [interactionMode, isPlacingFence, fenceStart]);

  // Update fence preview
  const updateFencePreview = useCallback((cell) => {
    if (isPlacingFence && fenceStart) {
      const orientation = getFenceOrientation(fenceStart, cell);
      setFencePreview({ cell, orientation });
    }
  }, [isPlacingFence, fenceStart]);

  // Clear all interaction states
  const clearInteractions = useCallback(() => {
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    setIsPlacingFence(false);
    setFenceStart(null);
    setFencePreview(null);
  }, []);

  // Reset view to center
  const resetView = useCallback(() => {
    setTransform({
      translateX: 0,
      translateY: 0
    });
    clearInteractions();
  }, [clearInteractions]);

  // Update interaction mode
  const setMode = useCallback((mode) => {
    clearInteractions();
    setInteractionMode(mode);
  }, [clearInteractions]);

  // Get transform string for CSS - pan only (no zoom)
  const getTransformString = useCallback(() => {
    // Fixed isometric rotation only - no pan transforms needed since grid is fixed
    return `translate(-50%, -50%) rotateX(60deg) rotateZ(45deg)`;
  }, []);

  return {
    // Transform state
    transform,
    getTransformString,
    
    // Interaction states
    isPanning,
    isSelecting,
    isPlacingFence,
    interactionMode,
    
    // Selection state
    selectionStart,
    selectionEnd,
    
    // Fence state
    fenceStart,
    fencePreview,
    
    // Actions
    setMode,
    resetView,
    startPan,
    handlePan,
    endPan,
    startSelection,
    updateSelection,
    startFencePlacement,
    updateFencePreview,
    clearInteractions
  };
};
