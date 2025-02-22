// Revised gridRenderer.js
import PuzzleSymbols from './puzzleSymbols.js';

export function renderGrid(gridEntries, options = {}) {
    try {
        console.error('🎲 RENDERING GRID');
        
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
        
        // Ensure grid is set up for proper layout
        gridContainer.classList.add('grid');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(10, 1fr)';
        gridContainer.style.gap = '2px';
        gridContainer.style.pointerEvents = 'auto';

        // Create grid cells
        gridEntries.forEach((entry, index) => {
            const cell = document.createElement('div');
            
            // Critical cell setup for interactions
            cell.classList.add('grid-cell');
            cell.dataset.index = index;
            cell.style.pointerEvents = 'auto';
            cell.style.cursor = 'pointer';
            cell.style.position = 'relative';
            cell.style.zIndex = '10';
            
            if (entry) {
                if (entry.type === 'number') {
                    const symbolContainer = document.createElement('div');
                    symbolContainer.classList.add('symbol-container');
                    // Important: Make sure symbol container passes through clicks
                    symbolContainer.style.pointerEvents = 'none';
                    
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

            // Add a direct click handler just to debug
            cell.addEventListener('click', (e) => {
                console.error(`Direct click on cell ${index}`);
                // Don't handle the click here, just log it
            });

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

        // Add click handling to grid container as a fallback
        gridContainer.addEventListener('click', (e) => {
            const cell = e.target.closest('.grid-cell');
            if (cell) {
                console.error(`Grid container delegated click for cell ${cell.dataset.index}`);
            }
        });

        console.error('Grid rendering complete');

    } catch (error) {
        console.error('Error rendering grid:', error);
    }
}

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
            symbolContainer.style.pointerEvents = 'none';
            
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
                cell.dataset.value = symbolValue;
            } else {
                // Fallback to text if symbol creation fails
                cell.textContent = value.toString();
            }
        }
    } catch (error) {
        console.error('Error updating cell:', error);
    }
}

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
