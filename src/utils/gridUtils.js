import { GRID_CONFIG, FENCE_ORIENTATIONS } from './constants';

// =====================================================
// NEW MATRIX-BASED SYSTEM FOR INFINITE GRID
// =====================================================

// Create empty cell data structure
export const createEmptyCell = (x, y) => ({
  id: `${x},${y}`,
  x,
  y,
  layers: [],
  fences: [],
  style: {
    left: x * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_X,
    top: y * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_Y,
    width: GRID_CONFIG.GRID_SIZE,
    height: GRID_CONFIG.GRID_SIZE
  }
});

// Data matrix - infinite virtual storage
export class DataMatrix {
  constructor() {
    this.data = new Map(); // Map<string, cellData>
  }
  
  // Get cell data by coordinates (creates empty if doesn't exist)
  getCell(x, y) {
    const key = `${x},${y}`;
    if (!this.data.has(key)) {
      this.data.set(key, createEmptyCell(x, y));
    }
    return this.data.get(key);
  }
  
  // Set cell data
  setCell(x, y, cellData) {
    const key = `${x},${y}`;
    this.data.set(key, { ...cellData, x, y, id: key });
  }
  
  // Update cell layers
  updateCellLayers(x, y, layers) {
    const cell = this.getCell(x, y);
    cell.layers = [...layers];
    this.setCell(x, y, cell);
  }
  
  // Update cell fences
  updateCellFences(x, y, fences) {
    const cell = this.getCell(x, y);
    cell.fences = [...fences];
    this.setCell(x, y, cell);
  }
  
  // Get all data (for debugging)
  getAllData() {
    return Array.from(this.data.entries());
  }
}

// Viewport matrix - fixed size for rendering with FIXED DOM elements
export class ViewportMatrix {
  constructor(sizeX = GRID_CONFIG.VIEWPORT_SIZE_X, sizeY = GRID_CONFIG.VIEWPORT_SIZE_Y) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.centerX = Math.floor(sizeX / 2);
    this.centerY = Math.floor(sizeY / 2);
    this.viewportOffsetX = 0; // World coordinates of viewport center
    this.viewportOffsetY = 0;
    this.fixedTiles = []; // Fixed DOM tiles that never change count
    this.lines = [];
    this.initializeFixedViewport();
  }
  
  // Initialize FIXED viewport with permanent tiles
  initializeFixedViewport() {
    this.fixedTiles = [];
    
    // Create fixed tiles with viewport coordinates (never change)
    for (let vx = 0; vx < this.sizeX; vx++) {
      for (let vy = 0; vy < this.sizeY; vy++) {
        // Create fixed tile with stable ID and viewport position
        const fixedTile = {
          // Fixed viewport coordinates (for DOM positioning)
          viewportX: vx,
          viewportY: vy,
          id: `viewport-${vx}-${vy}`, // Stable ID that never changes
          
          // Fixed style that never changes
          style: {
            left: vx * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_X,
            top: vy * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_Y,
            width: GRID_CONFIG.GRID_SIZE,
            height: GRID_CONFIG.GRID_SIZE
          },
          
          // Content that gets updated (initially empty)
          worldX: vx - this.centerX,
          worldY: vy - this.centerY,
          layers: [],
          fences: []
        };
        
        this.fixedTiles.push(fixedTile);
      }
    }
    
    this.generateFixedViewportLines();
  }
  
  // Generate FIXED grid lines that never move
  generateFixedViewportLines() {
    // Only generate lines once - they never change position
    if (this.lines.length > 0) return;
    
    this.lines = [];
    
    // Fixed horizontal lines covering the viewport
    for (let vy = 0; vy <= this.sizeY; vy++) {
      this.lines.push({
        id: `h-${vy}`,
        type: 'horizontal',
        style: {
          top: vy * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_Y,
          left: GRID_CONFIG.VIEWPORT_OFFSET_X,
          width: this.sizeX * GRID_CONFIG.GRID_SIZE,
          height: '1px'
        }
      });
    }
    
    // Fixed vertical lines covering the viewport
    for (let vx = 0; vx <= this.sizeX; vx++) {
      this.lines.push({
        id: `v-${vx}`,
        type: 'vertical',
        style: {
          left: vx * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_X,
          top: GRID_CONFIG.VIEWPORT_OFFSET_Y,
          width: '1px',
          height: this.sizeY * GRID_CONFIG.GRID_SIZE
        }
      });
    }
  }
  
  // Sync viewport with data matrix - UPDATE existing tiles, don't create new ones
  syncWithData(dataMatrix, worldCenterX, worldCenterY) {
    this.viewportOffsetX = Math.round(worldCenterX);
    this.viewportOffsetY = Math.round(worldCenterY);
    
    // Update content of EXISTING tiles (no DOM creation/destruction)
    for (let i = 0; i < this.fixedTiles.length; i++) {
      const tile = this.fixedTiles[i];
      
      // Calculate world coordinates for this tile
      const worldX = tile.viewportX - this.centerX + this.viewportOffsetX;
      const worldY = tile.viewportY - this.centerY + this.viewportOffsetY;
      
      // Get data from matrix
      const cellData = dataMatrix.getCell(worldX, worldY);
      
      // Update tile content (same object reference, just update properties)
      tile.worldX = worldX;
      tile.worldY = worldY;
      tile.layers = cellData.layers || [];
      tile.fences = cellData.fences || [];
      tile.worldId = `${worldX},${worldY}`; // ID for data operations
    }
    
    // Grid lines only generated once (already fixed)
    this.generateFixedViewportLines();
  }
  
  // Get FIXED tiles array (same references always)
  getFixedTiles() {
    return this.fixedTiles;
  }
  
  // Get viewport lines array  
  getLines() {
    return this.lines;
  }
}

// Calculate area in square meters (assuming each cell is 1m²)
export const calculateArea = (cells) => {
  return cells.length;
};

// Calculate fence length in meters
export const calculateFenceLength = (startCell, endCell) => {
  const startX = parseInt(startCell.x);
  const startY = parseInt(startCell.y);
  const endX = parseInt(endCell.x);
  const endY = parseInt(endCell.y);
  
  // Calculate distance using Pythagorean theorem
  const dx = endX - startX;
  const dy = endY - startY;
  return Math.sqrt(dx * dx + dy * dy);
};

// Get fence orientation between two cells
export const getFenceOrientation = (startCell, endCell) => {
  const startX = parseInt(startCell.x);
  const startY = parseInt(startCell.y);
  const endX = parseInt(endCell.x);
  const endY = parseInt(endCell.y);

  if (startX === endX) return FENCE_ORIENTATIONS.VERTICAL;
  if (startY === endY) return FENCE_ORIENTATIONS.HORIZONTAL;
  if (endX - startX === endY - startY) return FENCE_ORIENTATIONS.DIAGONAL1;
  if (endX - startX === startY - endY) return FENCE_ORIENTATIONS.DIAGONAL2;
  return FENCE_ORIENTATIONS.HORIZONTAL;
};

// Calculate visible grid bounds based on viewport and transform
export const calculateVisibleBounds = (containerWidth, containerHeight, transform) => {
  const { translateX, translateY, scale } = transform;
  
  // Calculate the viewport bounds in grid space
  const margin = 10; // Extra cells around the visible area for smooth panning
  
  // Account for isometric perspective - we need a larger area due to rotation
  const perspectiveMultiplier = 1.8;
  const effectiveWidth = containerWidth * perspectiveMultiplier;
  const effectiveHeight = containerHeight * perspectiveMultiplier;
  
  // Calculate bounds in grid coordinates
  const halfWidth = effectiveWidth / (2 * scale);
  const halfHeight = effectiveHeight / (2 * scale);
  
  // Grid center in screen space (accounting for translation)
  const centerX = -translateX / scale;
  const centerY = -translateY / scale;
  
  // Convert to grid cell coordinates
  const minX = Math.floor((centerX - halfWidth) / GRID_CONFIG.GRID_SIZE) - margin;
  const maxX = Math.ceil((centerX + halfWidth) / GRID_CONFIG.GRID_SIZE) + margin;
  const minY = Math.floor((centerY - halfHeight) / GRID_CONFIG.GRID_SIZE) - margin;
  const maxY = Math.ceil((centerY + halfHeight) / GRID_CONFIG.GRID_SIZE) + margin;
  
  // Limit the grid size for performance (max 100x100 cells visible)
  const maxCells = 50;
  const clampedMinX = Math.max(minX, Math.floor(centerX / GRID_CONFIG.GRID_SIZE) - maxCells);
  const clampedMaxX = Math.min(maxX, Math.ceil(centerX / GRID_CONFIG.GRID_SIZE) + maxCells);
  const clampedMinY = Math.max(minY, Math.floor(centerY / GRID_CONFIG.GRID_SIZE) - maxCells);
  const clampedMaxY = Math.min(maxY, Math.ceil(centerY / GRID_CONFIG.GRID_SIZE) + maxCells);
  
  return { 
    minX: clampedMinX, 
    maxX: clampedMaxX, 
    minY: clampedMinY, 
    maxY: clampedMaxY 
  };
};

// Generate grid cells for visible area only
export const generateVisibleGridCells = (bounds) => {
  const { minX, maxX, minY, maxY } = bounds;
  const cells = [];
  
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      cells.push({
        id: `${x},${y}`,
        x,
        y,
        layers: [],
        style: {
          left: x * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_X,
          top: y * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_Y,
          width: GRID_CONFIG.GRID_SIZE,
          height: GRID_CONFIG.GRID_SIZE
        }
      });
    }
  }
  return cells;
};

// Generate grid cells data (backwards compatibility)
export const generateGridCells = () => {
  // Default bounds for initial load
  const defaultBounds = {
    minX: -GRID_CONFIG.GRID_SIZE_X,
    maxX: GRID_CONFIG.GRID_SIZE_X,
    minY: -GRID_CONFIG.GRID_SIZE_Y,
    maxY: GRID_CONFIG.GRID_SIZE_Y
  };
  return generateVisibleGridCells(defaultBounds);
};

// Generate grid lines for visible area only
export const generateVisibleGridLines = (bounds) => {
  const { minX, maxX, minY, maxY } = bounds;
  const lines = [];
  
  // Calculate line extents
  const lineMinX = minX * GRID_CONFIG.GRID_SIZE;
  const lineMaxX = maxX * GRID_CONFIG.GRID_SIZE;
  const lineMinY = minY * GRID_CONFIG.GRID_SIZE;
  const lineMaxY = maxY * GRID_CONFIG.GRID_SIZE;
  const lineWidth = lineMaxX - lineMinX;
  const lineHeight = lineMaxY - lineMinY;
  
  // Horizontal lines
  for (let i = minY; i <= maxY; i++) {
    lines.push({
      id: `h-${i}`,
      type: 'horizontal',
      style: {
        top: i * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_Y,
        left: lineMinX + GRID_CONFIG.VIEWPORT_OFFSET_X,
        width: lineWidth,
        height: '1px'
      }
    });
  }

  // Vertical lines
  for (let i = minX; i <= maxX; i++) {
    lines.push({
      id: `v-${i}`,
      type: 'vertical',
      style: {
        left: i * GRID_CONFIG.GRID_SIZE + GRID_CONFIG.VIEWPORT_OFFSET_X,
        top: lineMinY + GRID_CONFIG.VIEWPORT_OFFSET_Y,
        width: '1px',
        height: lineHeight
      }
    });
  }

  return lines;
};

// Generate grid lines data (backwards compatibility)
export const generateGridLines = () => {
  // Default bounds for initial load
  const defaultBounds = {
    minX: -GRID_CONFIG.GRID_SIZE_X,
    maxX: GRID_CONFIG.GRID_SIZE_X,
    minY: -GRID_CONFIG.GRID_SIZE_Y,
    maxY: GRID_CONFIG.GRID_SIZE_Y
  };
  return generateVisibleGridLines(defaultBounds);
};

// Generate background grid for fog of war effect
export const generateBackgroundGrid = () => {
  const lines = [];
  const gridSize = GRID_CONFIG.GRID_SIZE;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Calculate how many grid lines we need to cover the entire screen
  const linesX = Math.ceil(screenWidth / gridSize) + 2;
  const linesY = Math.ceil(screenHeight / gridSize) + 2;
  
  // Start from negative to cover left/top edges
  const startX = -1;
  const startY = -1;
  
  // Horizontal background lines (covering entire screen)
  for (let i = startY; i < linesY + startY; i++) {
    lines.push({
      id: `bg-h-${i}`,
      type: 'horizontal',
      style: {
        top: i * gridSize,
        left: 0,
        width: '100vw',
        height: '1px'
      }
    });
  }

  // Vertical background lines (covering entire screen)
  for (let i = startX; i < linesX + startX; i++) {
    lines.push({
      id: `bg-v-${i}`,
      type: 'vertical', 
      style: {
        left: i * gridSize,
        top: 0,
        width: '1px',
        height: '100vh'
      }
    });
  }

  return lines;
};


// Get cells within selection rectangle
export const getCellsInSelection = (startCell, endCell) => {
  const startX = parseInt(startCell.x);
  const startY = parseInt(startCell.y);
  const endX = parseInt(endCell.x);
  const endY = parseInt(endCell.y);

  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  const cellsInSelection = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      cellsInSelection.push({ x, y, id: `${x},${y}` });
    }
  }
  
  return cellsInSelection;
};
