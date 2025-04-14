angular.module('gridApp', [])
    .controller('GridController', ['$scope', function($scope) {
        // Grid configuration
        const GRID_SIZE = 40; // Aumentamos el tamaño de cada celda
        const GRID_SIZE_X = 15; // Reducimos la cantidad de celdas para compensar
        const GRID_SIZE_Y = 15; // Reducimos la cantidad de celdas para compensar

        // Price configuration per square meter
        const PRICES = {
            ground: 15000,    // Movimiento de suelo
            plate: 25000,     // Platea
            grass: 8000,      // Grama
            water: 35000,     // Espejo de agua
            fence: 12000      // Cerca por metro lineal
        };

        // Budget tracking
        $scope.budget = {
            items: {},
            total: 0
        };

        // Calculate area in square meters (assuming each cell is 1m²)
        function calculateArea(cells) {
            return cells.length;
        }

        // Calculate fence length in meters
        function calculateFenceLength(startCell, endCell) {
            const startX = parseInt(startCell.dataset.x);
            const startY = parseInt(startCell.dataset.y);
            const endX = parseInt(endCell.dataset.x);
            const endY = parseInt(endCell.dataset.y);
            
            // Calculate distance using Pythagorean theorem
            const dx = endX - startX;
            const dy = endY - startY;
            return Math.sqrt(dx * dx + dy * dy);
        }

        // Update budget
        function updateBudget() {
            $scope.budget.items = {};
            $scope.budget.total = 0;

            // Count cells for each layer type
            const cellCounts = {};
            cellLayers.forEach((layers, cellId) => {
                if (layers.length > 0) {
                    const layerType = layers[layers.length - 1];
                    cellCounts[layerType] = (cellCounts[layerType] || 0) + 1;
                }
            });

            // Calculate costs
            Object.entries(cellCounts).forEach(([type, count]) => {
                if (type !== 'fence') {
                    $scope.budget.items[type] = {
                        quantity: count,
                        unit: 'm²',
                        price: PRICES[type],
                        total: count * PRICES[type]
                    };
                    $scope.budget.total += count * PRICES[type];
                }
            });

            // Calculate fence costs
            const fences = document.querySelectorAll('.fence-element');
            if (fences.length > 0) {
                $scope.budget.items.fence = {
                    quantity: fences.length,
                    unit: 'm',
                    price: PRICES.fence,
                    total: fences.length * PRICES.fence
                };
                $scope.budget.total += fences.length * PRICES.fence;
            }

            // Force Angular to update the view
            $scope.$apply();
        }

        let grid = document.getElementById('grid');
        let isSelecting = false;
        let selectedCells = new Set();
        let startCell = null;
        let cellLayers = new Map(); // Map to store layers for each cell

        // Fence placement variables
        let fenceStartCell = null;
        let fencePreview = null;
        let isFirstClick = true;

        // Selection variables
        let selectionStartCell = null;
        let selectionPreview = null;

        // Initialize scope variables
        $scope.selectedTool = 'ground';

        // Tool selection
        $scope.selectTool = function(tool) {
            $scope.selectedTool = tool;
            clearFencePreview();
            if (isSelecting) {
                clearSelectionPreview();
                isSelecting = false;
                selectionStartCell = null;
            }
        };

        // Create grid lines
        function createGridLines() {
            // Create horizontal lines
            for (let i = -GRID_SIZE_X; i <= GRID_SIZE_X; i++) {
                const line = document.createElement('div');
                line.className = 'grid-line horizontal';
                line.style.top = (i * GRID_SIZE) + 'px';
                grid.appendChild(line);
            }

            // Create vertical lines
            for (let i = -GRID_SIZE_Y; i <= GRID_SIZE_Y; i++) {
                const line = document.createElement('div');
                line.className = 'grid-line vertical';
                line.style.left = (i * GRID_SIZE) + 'px';
                grid.appendChild(line);
            }
        }

        // Create grid cells
        function createGridCells() {
            for (let x = -GRID_SIZE_X; x <= GRID_SIZE_X; x++) {
                for (let y = -GRID_SIZE_Y; y <= GRID_SIZE_Y; y++) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    cell.style.left = (x * GRID_SIZE) + 'px';
                    cell.style.top = (y * GRID_SIZE) + 'px';
                    cell.style.width = GRID_SIZE + 'px';
                    cell.style.height = GRID_SIZE + 'px';
                    
                    // Add mouse events
                    cell.addEventListener('mousedown', handleMouseDown);
                    cell.addEventListener('mouseenter', handleMouseEnter);
                    cell.addEventListener('mouseup', handleMouseUp);
                    
                    grid.appendChild(cell);
                }
            }
        }

        // Handle mouse down event
        function handleMouseDown(event) {
            if ($scope.selectedTool === 'fence') {
                if (isFirstClick) {
                    // First click - set start point
                    fenceStartCell = event.target;
                    isFirstClick = false;
                } else {
                    // Second click - place fence
                    const orientation = getFenceOrientation(fenceStartCell, event.target);
                    createFenceElement(event.target, orientation);
                    clearFencePreview();
                    isFirstClick = true;
                }
            } else {
                const cell = event.target;
                if (!isSelecting) {
                    // First click - start selection
                    selectionStartCell = cell;
                    isSelecting = true;
                    updateSelectionPreview(cell);
                } else {
                    // Second click - apply tool to selection
                    const startX = parseInt(selectionStartCell.dataset.x);
                    const startY = parseInt(selectionStartCell.dataset.y);
                    const endX = parseInt(cell.dataset.x);
                    const endY = parseInt(cell.dataset.y);

                    // Calculate selection area
                    const minX = Math.min(startX, endX);
                    const maxX = Math.max(startX, endX);
                    const minY = Math.min(startY, endY);
                    const maxY = Math.max(startY, endY);

                    // Apply tool to each cell in the selection
                    for (let x = minX; x <= maxX; x++) {
                        for (let y = minY; y <= maxY; y++) {
                            const targetCell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                            if (targetCell) {
                                applyToolToCell(targetCell);
                            }
                        }
                    }
                    clearSelectionPreview();
                    isSelecting = false;
                    selectionStartCell = null;
                }
            }
        }

        // Handle mouse enter event
        function handleMouseEnter(event) {
            if ($scope.selectedTool === 'fence') {
                updateFencePreview(event.target);
            } else if (isSelecting) {
                updateSelectionPreview(event.target);
            }
        }

        // Handle mouse up event
        function handleMouseUp(event) {
            if ($scope.selectedTool === 'fence') {
                // ... existing fence code ...
            }
        }

        // Apply tool to cell
        function applyToolToCell(cell) {
            const cellId = `${cell.dataset.x},${cell.dataset.y}`;
            
            // Initialize layers array if it doesn't exist
            if (!cellLayers.has(cellId)) {
                cellLayers.set(cellId, []);
            }
            
            const layers = cellLayers.get(cellId);
            
            if ($scope.selectedTool === 'erase') {
                // Remove the last layer
                if (layers.length > 0) {
                    layers.pop();
                    updateCellAppearance(cell, layers);
                }
            } else {
                // Add new layer
                layers.push($scope.selectedTool);
                updateCellAppearance(cell, layers);
            }

            // Update budget after changes
            updateBudget();
        }

        // Update cell appearance based on layers
        function updateCellAppearance(cell, layers) {
            // Remove all layer classes and containers
            cell.classList.remove('layer-ground', 'layer-plate', 'layer-grass', 'layer-water', 'layer-fence');
            const existingContainer = cell.querySelector('.layer-container');
            if (existingContainer) {
                existingContainer.remove();
            }
            
            // Apply the topmost layer
            if (layers.length > 0) {
                const topLayer = layers[layers.length - 1];
                cell.classList.add(`layer-${topLayer}`);
                
                // Create 3D layer structure
                const container = document.createElement('div');
                container.className = 'layer-container';
                
                // Create top face
                const top = document.createElement('div');
                top.className = 'layer-top';
                container.appendChild(top);
                
                // Create front face
                const front = document.createElement('div');
                front.className = 'layer-front';
                container.appendChild(front);
                
                // Create side face
                const side = document.createElement('div');
                side.className = 'layer-side';
                container.appendChild(side);
                
                cell.appendChild(container);
            }
        }

        // Toggle cell selection
        function toggleCellSelection(cell) {
            const cellId = `${cell.dataset.x},${cell.dataset.y}`;
            if (selectedCells.has(cellId)) {
                selectedCells.delete(cellId);
                cell.classList.remove('selected');
            } else {
                selectedCells.add(cellId);
                cell.classList.add('selected');
            }
        }

        function clearFencePreview() {
            if (fencePreview) {
                fencePreview.remove();
                fencePreview = null;
            }
            fenceStartCell = null;
            isFirstClick = true;
        }

        function createFenceElement(cell, orientation) {
            const fence = document.createElement('div');
            fence.className = `fence-element fence-${orientation}`;
            cell.appendChild(fence);
            
            // Update budget after adding fence
            updateBudget();
            
            return fence;
        }

        function getFenceOrientation(startCell, endCell) {
            const startX = parseInt(startCell.dataset.x);
            const startY = parseInt(startCell.dataset.y);
            const endX = parseInt(endCell.dataset.x);
            const endY = parseInt(endCell.dataset.y);

            if (startX === endX) return 'vertical';
            if (startY === endY) return 'horizontal';
            if (endX - startX === endY - startY) return 'diagonal1';
            if (endX - startX === startY - endY) return 'diagonal2';
            return 'horizontal';
        }

        function updateFencePreview(cell) {
            if (!fenceStartCell || !cell) return;

            clearFencePreview();
            const orientation = getFenceOrientation(fenceStartCell, cell);
            fencePreview = createFenceElement(cell, orientation);
        }

        function clearSelectionPreview() {
            // Remove ALL selection preview elements
            document.querySelectorAll('.selection-preview').forEach(preview => {
                preview.remove();
            });
        }

        function createSelectionPreview(cell) {
            const preview = document.createElement('div');
            preview.className = 'selection-preview';
            cell.appendChild(preview);
            return preview;
        }

        function updateSelectionPreview(cell) {
            if (!selectionStartCell || !cell) return;

            // Clear ALL previous previews
            clearSelectionPreview();

            const startX = parseInt(selectionStartCell.dataset.x);
            const startY = parseInt(selectionStartCell.dataset.y);
            const endX = parseInt(cell.dataset.x);
            const endY = parseInt(cell.dataset.y);

            // Calculate selection area
            const minX = Math.min(startX, endX);
            const maxX = Math.max(startX, endX);
            const minY = Math.min(startY, endY);
            const maxY = Math.max(startY, endY);

            // Create preview for each cell in the selection
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const targetCell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                    if (targetCell) {
                        createSelectionPreview(targetCell);
                    }
                }
            }
        }

        // Item names mapping
        $scope.getItemName = function(type) {
            const names = {
                ground: 'Movimiento de suelo',
                plate: 'Platea',
                grass: 'Grama',
                water: 'Espejo de agua',
                fence: 'Cerca'
            };
            return names[type] || type;
        };

        // Initialize the grid
        createGridLines();
        createGridCells();
    }]); 