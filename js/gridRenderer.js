// gridRenderer.js
import PuzzleSymbols from './puzzleSymbols.js';

export function renderGrid(gridEntries, options = {}) {
    try {
        console.error('🎲 RENDERING GRID - ULTRA VERBOSE');
        
        // Validate input
        if (!Array.isArray(gridEntries)) {
            console.error('❌ Invalid grid entries: Expected an array');
            return;
        }

        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) {
            console.error('❌ Grid container not found');
            return;
        }

        // Clear existing grid
        gridContainer.innerHTML = '';
        
        // Ensure grid is set up for proper layout
        gridContainer.classList.add('grid');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(10, 1fr)';
        gridContainer.style.gap = '2px';

        // Create grid cells with enhanced debugging
        gridEntries.forEach((entry, index) => {
            const cell = document.createElement('div');
            
            // Ensure cell is fully clickable
            cell.style.cursor = 'pointer';
            cell.style.userSelect = 'none';
            cell.style.position = 'relative';
            
            // Critical: Add grid-cell class and index
            cell.classList.add('grid-cell');
            cell.dataset.index = index;
            
            // Enhanced cell creation logging
            console.error(`Creating cell ${index}:`, {
                entryType: entry ? entry.type : 'null',
                entryValue: entry ? entry.value : 'null'
            });

            if (entry) {
                if (entry.type === 'number') {
                    const symbolContainer = document.createElement('div');
                    symbolContainer.classList.add('symbol-container');
                    
                    // IMPORTANT: Remove pointer-events: none
                    symbolContainer.style.pointerEvents = 'auto';
                    
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
                        
                        // Preserve original value for calculations
                        cell.dataset.value = symbolValue;
                    } else {
                        cell.textContent = symbolValue;
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

            // Add debug attribute
            cell.setAttribute('data-debug', `Cell ${index}`);

            // Add click logging
            cell.addEventListener('click', (e) => {
                console.error('🎯 CELL CLICKED', {
                    index: cell.dataset.index,
                    value: cell.dataset.value,
                    classes: Array.from(cell.classList)
                });
            }, { capture: true });

            gridContainer.appendChild(cell);
        });

        // Highlight start square
        if (options.startCoord) {
            const startIndex = options.startCoord[1] * 10 + options.startCoord[0];
            const startCell = gridContainer.querySelector(`[data-index="${startIndex}"]`);
            if (startCell) {
                startCell.classList.add('start-cell');
                console.error('🟢 Start cell identified:', startIndex);
            }
        }

        // Highlight end square
        if (options.endCoord) {
            const endIndex = options.endCoord[1] * 10 + options.endCoord[0];
            const endCell = gridContainer.querySelector(`[data-index="${endIndex}"]`);
            if (endCell) {
                endCell.classList.add('end-cell');
                console.error('🏁 End cell identified:', endIndex);
            }
        }

        // Final verification log
        console.error('🧩 Grid Rendering Complete', {
            totalCells: gridEntries.length,
            gridCells: gridContainer.querySelectorAll('.grid-cell').length
        });

    } catch (error) {
        console.error('❌ Error rendering grid:', error);
        console.error('Error stack:', error.stack);
    }
}

/**
 * Creates an SVG symbol for a given value
 * @param {number|string} value - Value to convert to a symbol
 * @param {number} size - Size of the symbol (default 40)
 * @returns {SVGSVGElement|null} Created SVG element or null
 */
// Modify createSymbolSVG function
function createSymbolSVG(value, size = 40) {
    console.log('Creating symbol for value:', value, 'Type:', typeof value);
    
    // Expanded validation to include fraction strings
    const isValidSymbol = PuzzleSymbols.validSymbols.includes(value) || 
        (Number.isInteger(value) && value >= 1 && value <= 9) ||
        (typeof value === 'string' && value.includes('/'));

    console.log('Is valid symbol:', isValidSymbol);

    if (isValidSymbol) {
        const symbol = PuzzleSymbols.createSymbol(value, size);
        console.log('Created symbol:', symbol);
        return symbol;
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
