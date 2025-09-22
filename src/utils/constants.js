// Grid configuration constants
export const GRID_CONFIG = {
  GRID_SIZE: 40,
  GRID_SIZE_X: 20,
  GRID_SIZE_Y: 20,
  // Viewport configuration
  VIEWPORT_SIZE_X: 25, // Fixed viewport width (configurable)
  VIEWPORT_SIZE_Y: 25, // Fixed viewport height (configurable)
  
  // Calculated viewport center for screen centering
  get VIEWPORT_CENTER_PIXELS_X() {
    return (this.VIEWPORT_SIZE_X * this.GRID_SIZE) / 2;
  },
  get VIEWPORT_CENTER_PIXELS_Y() {
    return (this.VIEWPORT_SIZE_Y * this.GRID_SIZE) / 2;
  },
  
  // Screen centering offsets (will be calculated dynamically)
  get VIEWPORT_OFFSET_X() {
    return  this.VIEWPORT_CENTER_PIXELS_X;
  },
  get VIEWPORT_OFFSET_Y() {
    return this.VIEWPORT_CENTER_PIXELS_Y;
  }
};

// Price configuration per square meter
export const PRICES = {
  ground: 15000,    // Movimiento de suelo
  plate: 25000,     // Platea
  grass: 8000,      // Grama
  water: 35000,     // Espejo de agua
  fence: 12000      // Cerca por metro lineal
};

// Tool configuration - extensible system
export const TOOLS_CONFIG = [
  {
    id: 'ground',
    name: 'Movimiento de suelo',
    type: 'material',
    icon: 'ground',
    price: PRICES.ground,
    unit: 'm²',
    layer: {
      height: 35,
      colors: {
        top: 'linear-gradient(45deg, #8d6e63, #5d4037)',
        sides: 'linear-gradient(45deg, #5d4037, #3e2723)'
      }
    }
  },
  {
    id: 'plate',
    name: 'Platea',
    type: 'material',
    icon: 'plate',
    price: PRICES.plate,
    unit: 'm²',
    layer: {
      height: 25,
      colors: {
        top: 'linear-gradient(45deg, #78909c, #455a64)',
        sides: 'linear-gradient(45deg, #455a64, #263238)'
      }
    }
  },
  {
    id: 'grass',
    name: 'Grama',
    type: 'material',
    icon: 'grass',
    price: PRICES.grass,
    unit: 'm²',
    layer: {
      height: 15,
      colors: {
        top: 'linear-gradient(45deg, #81c784, #388e3c)',
        sides: 'linear-gradient(45deg, #388e3c, #1b5e20)'
      }
    }
  },
  {
    id: 'water',
    name: 'Espejo de agua',
    type: 'material',
    icon: 'water',
    price: PRICES.water,
    unit: 'm²',
    layer: {
      height: 10,
      colors: {
        top: 'linear-gradient(45deg, #4fc3f7, #0288d1)',
        sides: 'linear-gradient(45deg, #0288d1, #01579b)'
      }
    }
  },
  {
    id: 'fence',
    name: 'Cerca',
    type: 'fence',
    icon: 'fence',
    price: PRICES.fence,
    unit: 'm',
    layer: {
      height: 35,
      colors: {
        top: 'linear-gradient(45deg, #795548, #4e342e)',
        sides: 'linear-gradient(45deg, #4e342e, #3e2723)'
      }
    }
  },
  {
    id: 'erase',
    name: 'Borrar',
    type: 'eraser',
    icon: 'erase'
  },
  {
    id: 'move',
    name: 'Mover',
    type: 'navigation',
    icon: 'move'
  }
];

// Fence orientations
export const FENCE_ORIENTATIONS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  DIAGONAL1: 'diagonal1',
  DIAGONAL2: 'diagonal2'
};

// Item name mappings for Spanish display
export const ITEM_NAMES = {
  ground: 'Movimiento de suelo',
  plate: 'Platea',
  grass: 'Grama',
  water: 'Espejo de agua',
  fence: 'Cerca'
};

// Canvas interaction modes
export const INTERACTION_MODES = {
  SELECT: 'select',
  PLACE_FENCE: 'placeFence',
  PAN: 'pan'
};
