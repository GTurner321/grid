// gridRenderer.js
import PuzzleSymbols from './puzzleSymbols.js';

/**
 * Renders the game grid based on the provided grid entries
 * @param {Array} gridEntries - Array of cell entries to render
 * @param {Object} options - Additional rendering options
 */
export function renderGrid(gridEntries, options = {}) {
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
        if (entry.type === 'number') {
            // Create symbol element
            const symbolContainer = document.createElement('div');
            symbolContainer.classList.add('symbol-container');
            
            // Convert value to string for symbol rendering
            const symbolValue = entry.value.toString().includes('/') 
                ? entry.value 
                : parseInt(entry.value);
            
            // Create SVG element for the symbol
            const symbolSvg = createSymbolSVG(symbolValue);
            
            if (symbolSvg) {
                symbolContainer.appendChild(symbolSvg);
                cell.appendChild(symbolContainer);
                
                // Ensure the original value is preserved for calculations
                cell.dataset.value = entry.value;
            } else {
                // Fallback to text if symbol creation fails
                cell.textContent = entry.value.toString();
            }
            
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

        // Highlight start square if coordinates are provided
        if (options.startCoord) {
            const startIndex = options.startCoord[1] * 10 + options.startCoord[0];
            const startCell = gridContainer.querySelector(`[data-index="${startIndex}"]`);
            if (startCell) {
                startCell.classList.add('start-cell');
            }
        }

        // Highlight end square if coordinates are provided
        if (options.endCoord) {
            const endIndex = options.endCoord[1] * 10 + options.endCoord[0];
            const endCell = gridContainer.querySelector(`[data-index="${endIndex}"]`);
            if (endCell) {
                endCell.classList.add('end-cell');
            }
        }

        // Ensure grid layout
        gridContainer.style.gridTemplateColumns = 'repeat(10, 1fr)';
    } catch (error) {
        console.error('Error rendering grid:', error);
    }
}

/**
 * Creates an SVG symbol for a given value
 * @param {number|string} value - Value to convert to a symbol
 * @param {number} size - Size of the symbol (default 40)
 * @returns {SVGSVGElement|null} Created SVG element or null
 */
function createSymbolSVG(value, size = 40) {
    // Check if the value is a valid symbol
    if (PuzzleSymbols.validSymbols.includes(value) || 
        (Number.isInteger(value) && value >= 1 && value <= 9)) {
        
        // Use the new createSymbol method
        return PuzzleSymbols.createSymbol(value, size);
    }

    return null;
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
            cell.innerHTML = '';
            cell.classList.add('removed');
        } else {
            // Update cell content
            const symbolContainer = document.createElement('div');
            symbolContainer.classList.add('symbol-container');
            
            // Convert value to string for symbol rendering
            const symbolValue = value.value ? 
                (value.value.toString().includes('/') ? value.value : parseInt(value.value)) : 
                value;
            
            // Create SVG element for the symbol
            const symbolSvg = createSymbolSVG(symbolValue);
            
            if (symbolSvg) {
                symbolContainer.appendChild(symbolSvg);
                cell.innerHTML = '';
                cell.appendChild(symbolContainer);
            } else {
                // Fallback to text if symbol creation fails
                cell.textContent = value.toString();
            }
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
