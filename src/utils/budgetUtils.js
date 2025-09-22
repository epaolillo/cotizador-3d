import { PRICES, ITEM_NAMES } from './constants';

// Calculate budget from cells and fences data
export const calculateBudget = (cellLayers, fences = []) => {
  const budget = {
    items: {},
    total: 0
  };

  // Count cells for each layer type
  const cellCounts = {};
  Object.values(cellLayers).forEach(layers => {
    if (layers.length > 0) {
      const layerType = layers[layers.length - 1]; // Get topmost layer
      cellCounts[layerType] = (cellCounts[layerType] || 0) + 1;
    }
  });

  // Calculate costs for materials
  Object.entries(cellCounts).forEach(([type, count]) => {
    if (type !== 'fence' && PRICES[type]) {
      budget.items[type] = {
        quantity: count,
        unit: 'm²',
        price: PRICES[type],
        total: count * PRICES[type],
        name: ITEM_NAMES[type] || type
      };
      budget.total += count * PRICES[type];
    }
  });

  // Calculate fence costs
  if (fences.length > 0) {
    budget.items.fence = {
      quantity: fences.length,
      unit: 'm',
      price: PRICES.fence,
      total: fences.length * PRICES.fence,
      name: ITEM_NAMES.fence
    };
    budget.total += fences.length * PRICES.fence;
  }

  return budget;
};

// Format price for display
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Format number for display
export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-AR').format(number);
};
