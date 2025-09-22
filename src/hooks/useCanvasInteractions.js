import { useState, useCallback, useRef, useEffect } from 'react';
import { INTERACTION_MODES } from '../utils/constants';
import { getFenceOrientation } from '../utils/gridUtils';

// Custom hook for canvas interactions (pan, zoom, selection)
export const useCanvasInteractions = () => {
  // Canvas transform state
  const [transform, setTransform] = useState({
    translateX: 0,
    translateY: 0,
    scale: 1
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
    if (interactionMode !== INTERACTION_MODES.PAN) return;
    
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

  // Handle panning
  const handlePan = useCallback((event) => {
    if (!isPanning) return;

    const deltaX = event.clientX - panStartRef.current.x;
    const deltaY = event.clientY - panStartRef.current.y;

    setTransform(prev => ({
      ...prev,
      translateX: transformStartRef.current.translateX + deltaX,
      translateY: transformStartRef.current.translateY + deltaY
    }));
  }, [isPanning]);

  // End panning
  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle zoom
  const handleZoom = useCallback((event, containerRect) => {
    event.preventDefault();
    
    // Get mouse position relative to container
    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;

    // Calculate position in grid space
    const gridX = (mouseX - transform.translateX) / transform.scale;
    const gridY = (mouseY - transform.translateY) / transform.scale;

    const delta = event.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    
    // Limit zoom level
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.5), 2);
    
    if (newScale !== transform.scale) {
      // Calculate new translation to keep mouse point fixed
      const newTranslateX = mouseX - (gridX * newScale);
      const newTranslateY = mouseY - (gridY * newScale);
      
      setTransform({
        translateX: newTranslateX,
        translateY: newTranslateY,
        scale: newScale
      });
    }
  }, [transform]);

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

  // Update interaction mode
  const setMode = useCallback((mode) => {
    clearInteractions();
    setInteractionMode(mode);
  }, [clearInteractions]);

  // Get transform string for CSS
  const getTransformString = useCallback(() => {
    return `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale}) rotateX(60deg) rotateZ(45deg)`;
  }, [transform]);

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
    startPan,
    handlePan,
    endPan,
    handleZoom,
    startSelection,
    updateSelection,
    startFencePlacement,
    updateFencePreview,
    clearInteractions
  };
};
