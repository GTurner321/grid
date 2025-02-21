import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';
import { updateCell } from './gridRenderer.js';

class GridEventHandler {
    constructor(gameState) {
        console.error('🔨 GridEventHandler CONSTRUCTOR CALLED');
        
        // Defensive check
        if (!gameState) {
            console.error('❌ NO GAME STATE PROVIDED TO GRID EVENT HANDLER');
            throw new Error('Game state is required for GridEventHandler');
        }

        this.state = gameState;
        
        // Comprehensive method binding
        this._bindMethodsSafely([
            'setupGridInteractions',
            'handleCellClick',
            'isValidMove',
            'updatePath',
            'updatePathDisplay',
            'validateSolution'
        ]);

        // Global event debugging
        this._setupGlobalEventDebugging();
    }

    _bindMethodsSafely(methods) {
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            } else {
                console.error(`❌ Method ${method} not found for binding`);
            }
        });
    }

    _setupGlobalEventDebugging() {
        // Add global event listeners to catch all interactions
        document.addEventListener('click', this._globalClickDebugger, true);
        document.addEventListener('mousedown', this._globalClickDebugger, true);
        document.addEventListener('touchstart', this._globalTouchDebugger, true);
    }

    _globalClickDebugger = (event) => {
        console.error('🌍 GLOBAL CLICK INTERCEPTED', {
            target: event.target,
            currentTarget: event.currentTarget,
            path: event.composedPath(),
            gameActive: this.state?.gameActive,
            isGridCell: event.target.classList.contains('grid-cell')
        });
    }

    _globalTouchDebugger = (event) => {
        console.error('📱 GLOBAL TOUCH INTERCEPTED', {
            touches: event.touches,
            target: event.target,
            gameActive: this.state?.gameActive
        });
    }

    setupGridInteractions() {
    console.error('🔍 ULTRA VERBOSE Grid Interactions Setup');
    
    const gridContainer = document.getElementById('grid-container');
    if (!gridContainer) {
        console.error('❌ NO GRID CONTAINER FOUND');
        return;
    }

    // Remove any existing listeners first
    gridContainer.removeEventListener('click', this._gridContainerClickHandler);
    
    // Add new click listener with capture
    gridContainer.addEventListener('click', this._gridContainerClickHandler, true);

    // Detailed grid cell listener setup
    const gridCells = gridContainer.querySelectorAll('.grid-cell');
    console.error(`🧩 Found ${gridCells.length} Grid Cells`);

    gridCells.forEach((cell, index) => {
        // Remove existing listeners to prevent duplicates
        cell.removeEventListener('click', this._cellClickHandler);
        
        // Add new click listener to each cell
        cell.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            
            console.error(`🎯 Direct Cell ${index} Click`, {
                cellIndex: cell.dataset.index,
                event: event
            });
            
            this.handleCellClick(cell);
        }, true);

        console.error(`Cell ${index} Detailed Inspection:`, {
            dataset: cell.dataset,
            index: cell.dataset.index,
            classList: Array.from(cell.classList)
        });
    });
}
    
    console.error('Grid Container Found - Detailed Inspection', {
        innerHTML: gridContainer.innerHTML,
        childElementCount: gridContainer.children.length
    });

    const gridCells = gridContainer.querySelectorAll('.grid-cell');
    console.error(`🧩 Found ${gridCells.length} Grid Cells`);

    gridCells.forEach((cell, index) => {
        console.error(`Cell ${index} Detailed Inspection:`, {
            dataset: cell.dataset,
            index: cell.dataset.index,
            classList: Array.from(cell.classList),
            isStartCell: cell.classList.contains('start-cell')
        });
    });
    }

    _gridContainerClickHandler = (event) => {
        event.stopPropagation();
        event.preventDefault();

        console.error('🎯 Grid Container Click', {
            target: event.target,
            isGridCell: event.target.classList.contains('grid-cell'),
            cellIndex: event.target.dataset?.index
        });

        const cell = event.target.closest('.grid-cell');
        if (cell) {
            this.handleCellClick(cell);
        }
    }

    _gridContainerTouchHandler = (event) => {
        event.stopPropagation();
        event.preventDefault();

        const touch = event.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.grid-cell');

        console.error('📱 Grid Container Touch', {
            cell: cell,
            coordinates: cell ? { x: touch.clientX, y: touch.clientY } : null
        });

        if (cell) {
            this.handleCellClick(cell);
        }
    }

    _cellClickHandler = (event) => {
        event.stopPropagation();
        event.preventDefault();

        console.error('🔸 Direct Cell Click', {
            target: event.target,
            currentTarget: event.currentTarget,
            cellIndex: event.currentTarget.dataset.index
        });

        this.handleCellClick(event.currentTarget);
    }

    _cellTouchHandler = (event) => {
        event.stopPropagation();
        event.preventDefault();

        const touch = event.touches[0];
        const cell = event.currentTarget;

        console.error('🔸 Direct Cell Touch', {
            cell: cell,
            cellIndex: cell.dataset.index
        });

        this.handleCellClick(cell);
    }

    handleCellClick(cell) {
    console.error('🎲 ULTRA VERBOSE Cell Click Diagnostics', {
        cellElement: cell,
        cellIndex: cell.dataset.index,
        gameActive: this.state.gameActive,
        currentUserPath: [...this.state.userPath],
        startCoord: this.state.path[0],
        endCoord: this.state.path[this.state.path.length - 1]
    });

    // Defensive checks
    if (!this.state.gameActive) {
        console.error('❌ Game not active. Click ignored.');
        return;
    }

    const cellIndex = parseInt(cell.dataset.index);

    console.error('Pre-Path Update Checks', {
        cellIndex: cellIndex,
        userPathLength: this.state.userPath.length,
        isStartSquare: this.isStartSquare(cellIndex)
    });

    // First click logic
    if (this.state.userPath.length === 0) {
        if (this.isStartSquare(cellIndex)) {
            console.error(`✅ Attempting to add start square: ${cellIndex}`);
            this.state.userPath.push(cellIndex);
            
            console.error('Path after first click', {
                userPath: [...this.state.userPath]
            });
            
            this.updatePathDisplay();
            console.error(`✅ Start square selected: ${cellIndex}`);
        } else {
            console.error(`❌ Invalid first cell: ${cellIndex}`);
            this.state.showMessage('You must start at the green square!', 'error');
        }
        return;
    }

    // Debug previous move validation
    const lastCellIndex = this.state.userPath[this.state.userPath.length - 1];
    console.error('Move Validation Debug', {
        currentCellIndex: cellIndex,
        lastCellIndex: lastCellIndex,
        isValidMove: this.isValidMove(cellIndex)
    });

    // Subsequent move validation
    if (!this.isValidMove(cellIndex)) {
        console.error(`❌ Invalid move to cell: ${cellIndex}`);
        this.state.showMessage('You can only move to adjacent squares!', 'error');
        return;
    }

    // Update path
    if (this.state.userPath.includes(cellIndex)) {
        const index = this.state.userPath.indexOf(cellIndex);
        this.state.userPath = this.state.userPath.slice(0, index + 1);
        console.error(`🔙 Backtracking to cell: ${cellIndex}`);
    } else {
        this.state.userPath.push(cellIndex);
        console.error(`➕ Adding new cell to path: ${cellIndex}`);
    }

    console.error('Path after update', {
        userPath: [...this.state.userPath]
    });

    this.updatePathDisplay();

    // Check for end square
    if (this.isEndSquare(cellIndex)) {
        console.error(`🏁 End square reached: ${cellIndex}`);
        this.validateSolution();
    }
}
    
    isValidMove(cellIndex) {
        const lastCellIndex = this.state.userPath[this.state.userPath.length - 1];
        const [x1, y1] = this.getCellCoordinates(cellIndex);
        const [x2, y2] = this.getCellCoordinates(lastCellIndex);

        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);

        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    getCellCoordinates(cellIndex) {
        return [cellIndex % 10, Math.floor(cellIndex / 10)];
    }

    updatePathDisplay() {
    console.error('🎨 Updating Path Display', {
        userPath: [...this.state.userPath]
    });

    // Clear previous highlights
    this._clearPathHighlights();
    
    // Highlight current path
    this.state.userPath.forEach((cellIndex, index) => {
        const cell = document.querySelector(`[data-index="${cellIndex}"]`);
        if (cell) {
            console.error(`Highlighting cell ${cellIndex}`, {
                isFirstCell: index === 0,
                isLastCell: index === this.state.userPath.length - 1
            });

            cell.classList.add('selected');
            
            // Special highlights for start and end
            if (index === 0) cell.classList.add('start-cell-selected');
            if (index === this.state.userPath.length - 1) cell.classList.add('end-cell-selected');
        } else {
            console.error(`❌ Cell not found for index: ${cellIndex}`);
        }
    });
}
    
    _clearPathHighlights() {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('selected', 'start-cell-selected', 'end-cell-selected');
        });
    }

    validateSolution() {
        try {
            // Reduce points for checking solution
            scoreManager.reducePointsOnCheck();
            
            // Validate the current path
            const validationResult = validatePath({
                userPath: this.state.userPath,
                gridEntries: this.state.gridEntries,
                originalPath: this.state.path
            });

            // Handle validation result
            if (validationResult.isValid) {
                this.handleValidPath(validationResult);
            } else {
                this.handleMathematicalError(validationResult);
            }

            // Update UI
            this.state.updateUI();
        } catch (error) {
            console.error('Error validating solution:', error);
            this.state.showMessage('Error checking solution', 'error');
        }
    }

    handleValidPath(validationResult) {
        if (validationResult.isValidLength && validationResult.endsAtEndSquare) {
            this.handlePuzzleSolved();
        } else if (!validationResult.endsAtEndSquare && validationResult.isValidLength) {
            this.state.showMessage('Path is mathematically correct! Continue to the end square.', 'info');
        } else if (!validationResult.isValidLength) {
            this.state.showMessage('Path is mathematically correct so far. Keep going!', 'info');
        }
    }

    handlePuzzleSolved() {
        // Calculate points for completing puzzle
        const pointsBreakdown = scoreManager.completePuzzle();
        
        // Highlight the solved path
        this._highlightSolvedPath();
        
        // Update UI with completion details
        this.state.updateUI({
            roundComplete: true,
            pointsBreakdown: pointsBreakdown
        });

        // Deactivate game
        this.state.gameActive = false;
    }

    _highlightSolvedPath() {
        this.state.userPath.forEach(cellIndex => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) cell.classList.add('user-solved-path');
        });
    }

    handleMathematicalError(validationResult) {
        // Truncate path to error point
        const errorIndex = validationResult.errorStep * 3;
        this.state.userPath = this.state.userPath.slice(0, errorIndex);
        
        // Update path display
        this.updatePathDisplay();
        
        // Show error message
        this.state.showMessage(`Mathematical error: ${validationResult.errorDetails}`, 'error');
    }

    isStartSquare(cellIndex) {
    const coord = this.getCellCoordinates(cellIndex);
    const startCoord = this.state.path[0];
    
    console.error('Start Square Verification', {
        currentCoord: coord,
        startCoord: startCoord,
        coordMatch: coord[0] === startCoord[0] && coord[1] === startCoord[1]
    });

    return coord[0] === startCoord[0] && coord[1] === startCoord[1];
}

    isEndSquare(cellIndex) {
        const coord = this.getCellCoordinates(cellIndex);
        const endCoord = this.state.path[this.state.path.length - 1];
        return coord[0] === endCoord[0] && coord[1] === endCoord[1];
    }
}

export default GridEventHandler;
