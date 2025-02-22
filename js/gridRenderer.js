// Fixed gridRenderer.js
import PuzzleSymbols from './puzzleSymbols.js';

export function renderGrid(gridEntries, options = {}) {
    try {
        console.error('Rendering grid');
        
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
            
            // Set cell classes and data
            cell.classList.add('grid-cell');
            cell.dataset.index = index;
            
            // IMPORTANT: No click handlers here - they're handled by GridEventHandler

            if (entry) {
                if (entry.type === 'number') {
                    const symbolContainer = document.createElement('div');
                    symbolContainer.classList.add('symbol-container');
                    
                    const symbolValue = entry.value instanceof Object 
                        ? (entry.value.numerator && entry.value.denominator 
                            ? `${entry.value.numerator}/${entry.value.denominator}` 
                            : entry.value.toString())
                        : (entry.value.toString().includes('/') 
                            ? entry.value 
                            : parseInt(entry.value));
                    
                    const symbolSvg = createSymbolSVG(symbolValue);
                    
                    if (symbolSvg) {
                        symbolContainer.appendChild(symbolSvg);
                        cell.appendChild(symbolContainer);
                        cell.dataset.value = symbolValue;
                    } else {
                        cell.textContent = symbolValue;
                    }
                    
                    cell.classList.add('number');
                } else if (entry.type === 'operator') {
                    cell.textContent = entry.value;
                    cell.classList.add('operator');
                }
            }

            gridContainer.appendChild(cell);
        });

        // Highlight start square
        if (options.startCoord) {
            const startIndex = options.startCoord[1] * 10 + options.startCoord[0];
            const startCell = gridContainer.querySelector(`[data-index="${startIndex}"]`);
            if (startCell) {
                startCell.classList.add('start-cell');
                console.error('Start cell identified:', startIndex);
            }
        }

        // Highlight end square
        if (options.endCoord) {
            const endIndex = options.endCoord[1] * 10 + options.endCoord[0];
            const endCell = gridContainer.querySelector(`[data-index="${endIndex}"]`);
            if (endCell) {
                endCell.classList.add('end-cell');
                console.error('End cell identified:', endIndex);
            }
        }

        console.error('Grid rendering complete');

    } catch (error) {
        console.error('Error rendering grid:', error);
    }
}

/**
 * Creates an SVG symbol for a given value
 */
function createSymbolSVG(value, size = 40) {
    // Expanded validation to include fraction strings
    const isValidSymbol = PuzzleSymbols.validSymbols.includes(value) || 
        (Number.isInteger(value) && value >= 1 && value <= 9) ||
        (typeof value === 'string' && value.includes('/'));

    if (isValidSymbol) {
        const symbol = PuzzleSymbols.createSymbol(value, size);
        return symbol;
    }

    return null;
}

/**
 * Updates a specific cell in the grid
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

export function debugGridInfo(gridEntries) {
    console.group('Grid Renderer Debug Info');
    console.log('Total grid entries:', gridEntries.length);
    
    const filledCells = gridEntries.filter(entry => entry !== null);
    console.log('Filled cells:', filledCells.length);
    
    console.groupEnd();
}
