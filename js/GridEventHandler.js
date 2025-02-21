import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';
import { updateCell } from './gridRenderer.js';

class GridEventHandler {
    constructor(gameState) {
        // Store game state reference
        this.state = gameState;
        
        // Bind all methods to ensure correct 'this' context
        this._bindMethods();
        
        // Debug logging for constructor
        console.error('GridEventHandler Constructed', {
            hasState: !!this.state,
            stateLevel: this.state.currentLevel
        });
    }

    // Bind all methods to ensure consistent 'this' context
    _bindMethods() {
        const methodsToBind = [
            'setupGridInteractions',
            'handleCellClick',
            'isValidMove',
            'updatePath',
            'updatePathDisplay',
            'validateSolution',
            'handleValidPath',
            'handlePuzzleSolved',
            'handleMathematicalError',
            'getCellCoordinates',
            'isStartSquare',
            'isEndSquare'
        ];

        methodsToBind.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            } else {
                console.error(`Method ${method} not found for binding`);
            }
        });
    }

    setupGridInteractions() {
        const gridContainer = document.getElementById('grid-container');
        
        if (!gridContainer) {
            console.error('🚨 CRITICAL: Grid container not found');
            return;
        }

        console.error('🔍 Setting up Grid Interactions');
        
        // Clear any existing event listeners to prevent duplicates
        this._removeExistingListeners(gridContainer);
        
        // Add click event listener
        gridContainer.addEventListener('click', this._handleGridClick, { capture: true });
        
        // Add touch event listeners for mobile support
        gridContainer.addEventListener('touchstart', this._handleGridTouch, { passive: false });
        
        // Verify grid cells
        this._verifyGridCells(gridContainer);
    }

    _removeExistingListeners(gridContainer) {
        // Remove any existing click and touch listeners
        const oldClickHandler = this._handleGridClick;
        const oldTouchHandler = this._handleGridTouch;
        
        if (oldClickHandler) {
            gridContainer.removeEventListener('click', oldClickHandler, { capture: true });
        }
        if (oldTouchHandler) {
            gridContainer.removeEventListener('touchstart', oldTouchHandler, { passive: false });
        }
    }

    _handleGridClick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Find the closest grid cell
        const cell = event.target.closest('.grid-cell');
        
        if (!cell) {
            console.error('Click not on a grid cell', {
                target: event.target,
                path: event.composedPath()
            });
            return;
        }

        this._processGridCellInteraction(cell);
    }

    _handleGridTouch = (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Handle touch events (typically on mobile)
        const touch = event.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.grid-cell');
        
        if (!cell) {
            console.error('Touch not on a grid cell', {
                touch: { x: touch.clientX, y: touch.clientY }
            });
            return;
        }

        this._processGridCellInteraction(cell);
    }

    _processGridCellInteraction(cell) {
        // Detailed logging of cell interaction
        console.error('Grid Cell Interaction', {
            cellIndex: cell.dataset.index,
            gameActive: this.state.gameActive,
            currentPath: this.state.userPath
        });

        // Check if game is active
        if (!this.state.gameActive) {
            console.error('Game not active - cell interaction ignored');
            this.state.showMessage('Start a level first!', 'error');
            return;
        }

        // Call handleCellClick with comprehensive error handling
        try {
            this.handleCellClick(cell);
        } catch (error) {
            console.error('Error processing cell click:', error);
            this.state.showMessage('Error processing your move', 'error');
        }
    }

    _verifyGridCells(gridContainer) {
        const gridCells = gridContainer.querySelectorAll('.grid-cell');
        
        console.error(`🕵️ Grid Cell Verification: ${gridCells.length} cells found`);
        
        gridCells.forEach((cell, index) => {
            console.error(`Cell ${index} Details:`, {
                hasDataIndex: !!cell.dataset.index,
                index: cell.dataset.index,
                classList: Array.from(cell.classList),
                isVisible: cell.offsetParent !== null,
                computedStyle: {
                    display: window.getComputedStyle(cell).display,
                    visibility: window.getComputedStyle(cell).visibility,
                    pointerEvents: window.getComputedStyle(cell).pointerEvents
                }
            });
        });
    }

    handleCellClick(cell) {
        // Convert cell to numeric index
        const cellIndex = parseInt(cell.dataset.index);
        
        console.error('Handling Cell Click', {
            cellIndex: cellIndex,
            currentUserPath: this.state.userPath
        });

        // First click logic
        if (this.state.userPath.length === 0) {
            this._handleFirstCellClick(cellIndex);
            return;
        }

        // Subsequent move validation
        this._processSubsequentMove(cellIndex);
    }

    _handleFirstCellClick(cellIndex) {
        if (this.isStartSquare(cellIndex)) {
            this.state.userPath.push(cellIndex);
            this.updatePathDisplay();
            console.error('Start square selected:', cellIndex);
        } else {
            this.state.showMessage('You must start at the green square!', 'error');
            console.error('Non-start square selected as first cell:', cellIndex);
        }
    }

    _processSubsequentMove(cellIndex) {
        // Check if move is to an adjacent cell
        if (!this.isValidMove(cellIndex)) {
            this.state.showMessage('You can only move to adjacent squares!', 'error');
            return;
        }

        // Check if cell is already in path (for backtracking)
        if (this.state.userPath.includes(cellIndex)) {
            const index = this.state.userPath.indexOf(cellIndex);
            this.state.userPath = this.state.userPath.slice(0, index + 1);
        } else {
            this.state.userPath.push(cellIndex);
        }

        // Update path display
        this.updatePathDisplay();

        // Check for end square completion
        if (this.isEndSquare(cellIndex)) {
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
        // Clear previous highlights
        this._clearPathHighlights();
        
        // Highlight current path
        this.state.userPath.forEach((cellIndex, index) => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) {
                cell.classList.add('selected');
                
                // Special highlights for start and end
                if (index === 0) cell.classList.add('start-cell-selected');
                if (index === this.state.userPath.length - 1) cell.classList.add('end-cell-selected');
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
        return coord[0] === startCoord[0] && coord[1] === startCoord[1];
    }

    isEndSquare(cellIndex) {
        const coord = this.getCellCoordinates(cellIndex);
        const endCoord = this.state.path[this.state.path.length - 1];
        return coord[0] === endCoord[0] && coord[1] === endCoord[1];
    }
}

export default GridEventHandler;
