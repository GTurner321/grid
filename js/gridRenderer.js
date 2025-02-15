// gridRenderer.js

/**
 * Renders the game grid based on the provided grid entries
 * @param {Array} gridEntries - Array of cell entries to render
 */
export function renderGrid(gridEntries) {
    try {
        // Validate input
        if (!Array.isArray(gridEntries)) {
            console.error('Invalid grid entries: Expected an array');
            return;
        }

        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) {
            console.error('Grid container not found');
            return;
        }

        // Clear existing grid
        gridContainer.innerHTML = '';

        // Create grid cells
        gridEntries.forEach((entry, index) => {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.index = index;

            // Handle different types of entries
            if (entry) {
                // Simplified rendering based on type
                if (entry.type === 'number') {
                    cell.textContent = entry.value.toString();
                    cell.classList.add('number');
                } else if (entry.type === 'operator') {
                    cell.textContent = entry.value;
                    cell.classList.add('operator');
                }
            } else {
                // Empty cell
                cell.textContent = '';
            }

            gridContainer.appendChild(cell);
        });

        // Ensure grid layout
        gridContainer.style.gridTemplateColumns = 'repeat(10, 1fr)';
    } catch (error) {
        console.error('Error rendering grid:', error);
    }
}

/**
 * Updates a specific cell in the grid
 * @param {number} index - Index of the cell to update
 * @param {*} value - New value for the cell
 */
export function updateCell(index, value) {
    try {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (!cell) {
            console.warn(`Cell at index ${index} not found`);
            return;
        }

        if (value === null) {
            // Remove cell content
            cell.textContent = '';
            cell.classList.add('removed');
        } else {
            // Update cell content
            const displayValue = value.display || 
                (value instanceof Object ? value.toString() : value);
            cell.textContent = displayValue;
        }
    } catch (error) {
        console.error('Error updating cell:', error);
    }
}

/**
 * Highlights a specific path on the grid
 * @param {Array} path - Array of coordinates to highlight
 */
export function highlightPath(path) {
    try {
        // Remove existing highlights
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('highlight');
        });

        // Highlight path cells
        path.forEach(coord => {
            const index = coord[1] * 10 + coord[0];
            const cell = document.querySelector(`[data-index="${index}"]`);
            if (cell) {
                cell.classList.add('highlight');
            }
        });
    } catch (error) {
        console.error('Error highlighting path:', error);
    }
}

/**
 * Provides additional debugging information about the grid
 */
export function debugGridInfo(gridEntries) {
    console.group('Grid Renderer Debug Info');
    console.log('Total grid entries:', gridEntries.length);
    
    const filledCells = gridEntries.filter(entry => entry !== null);
    console.log('Filled cells:', filledCells.length);
    
    // Log a sample of entries
    console.log('Sample entries:', filledCells.slice(0, 5));
    
    console.groupEnd();
}
