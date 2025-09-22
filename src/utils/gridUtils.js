import { GRID_CONFIG, FENCE_ORIENTATIONS } from './constants';

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

// Generate grid cells data
export const generateGridCells = () => {
  const cells = [];
  for (let x = -GRID_CONFIG.GRID_SIZE_X; x <= GRID_CONFIG.GRID_SIZE_X; x++) {
    for (let y = -GRID_CONFIG.GRID_SIZE_Y; y <= GRID_CONFIG.GRID_SIZE_Y; y++) {
      cells.push({
        id: `${x},${y}`,
        x,
        y,
        layers: [],
        style: {
          left: x * GRID_CONFIG.GRID_SIZE,
          top: y * GRID_CONFIG.GRID_SIZE,
          width: GRID_CONFIG.GRID_SIZE,
          height: GRID_CONFIG.GRID_SIZE
        }
      });
    }
  }
  return cells;
};

// Generate grid lines data
export const generateGridLines = () => {
  const lines = [];
  
  // Horizontal lines
  for (let i = -GRID_CONFIG.GRID_SIZE_X; i <= GRID_CONFIG.GRID_SIZE_X; i++) {
    lines.push({
      id: `h-${i}`,
      type: 'horizontal',
      style: {
        top: i * GRID_CONFIG.GRID_SIZE,
        left: 0,
        width: '100%',
        height: '1px'
      }
    });
  }

  // Vertical lines
  for (let i = -GRID_CONFIG.GRID_SIZE_Y; i <= GRID_CONFIG.GRID_SIZE_Y; i++) {
    lines.push({
      id: `v-${i}`,
      type: 'vertical',
      style: {
        left: i * GRID_CONFIG.GRID_SIZE,
        top: 0,
        width: '1px',
        height: '100%'
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
