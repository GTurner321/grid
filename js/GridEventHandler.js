import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';
import { updateCell } from './gridRenderer.js';

class GridEventHandler {
    constructor(gameState) {
        this.state = gameState;
        
        // Bind methods to ensure proper 'this' context
        this.setupGridInteractions = this.setupGridInteractions.bind(this);
        this.setupMouseEvents = this.setupMouseEvents.bind(this);
        this.setupTouchEvents = this.setupTouchEvents.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleTouchEvent = this.handleTouchEvent.bind(this);
        this.getActualCell = this.getActualCell.bind(this);
        this.processClick = this.processClick.bind(this);
        this.handleInitialClick = this.handleInitialClick.bind(this);
        this.isValidMove = this.isValidMove.bind(this);
        this.getCellCoordinates = this.getCellCoordinates.bind(this);
        this.updatePath = this.updatePath.bind(this);
        this.updatePathDisplay = this.updatePathDisplay.bind(this);
        this.clearAllHighlights = this.clearAllHighlights.bind(this);
        this.highlightSelectedPath = this.highlightSelectedPath.bind(this);
        this.validateSolution = this.validateSolution.bind(this);
        this.handleValidPath = this.handleValidPath.bind(this);
        this.handlePuzzleSolved = this.handlePuzzleSolved.bind(this);
        this.handleMathematicalError = this.handleMathematicalError.bind(this);
        this.highlightSolvedPath = this.highlightSolvedPath.bind(this);
        this.isStartSquare = this.isStartSquare.bind(this);
        this.isEndSquare = this.isEndSquare.bind(this);
        this.removeSpareCells = this.removeSpareCells.bind(this);
    }

    setupGridInteractions() {
        const gridContainer = document.getElementById('grid-container');
        if (gridContainer) {
            console.error('Setting up grid interactions on container:', gridContainer);
            this.setupMouseEvents(gridContainer);
            this.setupTouchEvents(gridContainer);
        } else {
            console.warn('Grid container not found');
        }
    }

    setupMouseEvents(gridContainer) {
        // Remove any existing click handlers
        gridContainer.removeEventListener('click', this._clickHandler);
        
        // Define a click handler function
        this._clickHandler = (e) => {
            console.error('Grid cell clicked:', e.target);
            if (e.target.classList.contains('grid-cell')) {
                this.handleCellClick(e.target);
            }
        };
        
        // Add the click handler
        gridContainer.addEventListener('click', this._clickHandler);
        console.error('Grid click handler added');
    }

    setupTouchEvents(gridContainer) {
        // Remove any existing touch handlers
        gridContainer.removeEventListener('touchstart', this._touchstartHandler);
        gridContainer.removeEventListener('touchmove', this._touchmoveHandler);
        
        // Define touch handler functions
        this._touchstartHandler = (e) => {
            e.preventDefault();
            this.handleTouchEvent(e);
        };
        
        this._touchmoveHandler = (e) => {
            e.preventDefault();
            this.handleTouchEvent(e);
        };
        
        // Add the touch handlers
        gridContainer.addEventListener('touchstart', this._touchstartHandler);
        gridContainer.addEventListener('touchmove', this._touchmoveHandler);
        console.error('Grid touch handlers added');
    }

    handleTouchEvent(e) {
        const cell = document.elementFromPoint(
            e.touches[0].clientX, 
            e.touches[0].clientY
        );
        
        if (cell?.classList.contains('grid-cell')) {
            this.handleCellClick(cell);
        }
    }

    handleCellClick(cell) {
        if (!this.state.gameActive) {
            console.error('Game not active, ignoring cell click');
            return;
        }

        try {
            console.error('Handling cell click for', cell.dataset.index);
            const cellIndex = parseInt(cell.dataset.index);
            const actualCell = this.getActualCell(cell);
            
            if (!actualCell) {
                console.warn('No grid cell found for selection');
                return;
            }

            this.processClick(cellIndex);
        } catch (error) {
            console.error('Error handling cell click:', error);
            console.error('Error stack:', error.stack);
        }
    }

    getActualCell(cell) {
        return cell.classList.contains('grid-cell') ? cell : cell.closest('.grid-cell');
    }

    processClick(cellIndex) {
        console.error('Processing click for cell', cellIndex, 'Current path:', this.state.userPath);
        
        if (this.state.userPath.length === 0) {
            this.handleInitialClick(cellIndex);
            return;
        }

        if (!this.isValidMove(cellIndex)) {
            this.state.showMessage('You can only move to adjacent squares!', 'error');
            return;
        }

        if (this.isEndSquare(cellIndex) && this.state.userPath.includes(cellIndex)) {
            this.validateSolution();
            return;
        }

        this.updatePath(cellIndex);
    }

    handleInitialClick(cellIndex) {
        if (this.isStartSquare(cellIndex)) {
            this.state.userPath.push(cellIndex);
            this.updatePathDisplay();
            console.error('Start square selected:', cellIndex);
        } else {
            this.state.showMessage('You must start at the green square!', 'error');
            console.error('Non-start square selected as first cell:', cellIndex);
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

    updatePath(cellIndex) {
        if (this.state.userPath.includes(cellIndex)) {
            const index = this.state.userPath.indexOf(cellIndex);
            this.state.userPath = this.state.userPath.slice(0, index + 1);
        } else {
            this.state.userPath.push(cellIndex);
        }
        console.error('Path updated:', this.state.userPath);
        this.updatePathDisplay();
    }

    updatePathDisplay() {
        try {
            this.clearAllHighlights();
            this.highlightSelectedPath();
            console.error('Path display updated');
        } catch (error) {
            console.error('Error updating path display:', error);
            console.error('Error stack:', error.stack);
        }
    }

    clearAllHighlights() {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('selected', 'start-cell-selected', 'end-cell-selected');
        });
    }

    highlightSelectedPath() {
        this.state.userPath.forEach(cellIndex => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) {
                cell.classList.add('selected');
                
                if (this.isStartSquare(cellIndex)) {
                    cell.classList.add('start-cell-selected');
                }
                if (this.isEndSquare(cellIndex)) {
                    cell.classList.add('end-cell-selected');
                }
            }
        });
    }

    validateSolution() {
        try {
            scoreManager.reducePointsOnCheck();
            
            const validationResult = validatePath({
                userPath: this.state.userPath,
                gridEntries: this.state.gridEntries,
                originalPath: this.state.path
            });

            if (validationResult.isValid) {
                this.handleValidPath(validationResult);
            } else {
                this.handleMathematicalError(validationResult);
            }

            this.state.updateUI();
        } catch (error) {
            console.error('Error validating solution:', error);
            console.error('Error stack:', error.stack);
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
        const pointsBreakdown = scoreManager.completePuzzle();
        
        this.highlightSolvedPath();
        
        this.state.updateUI({
            roundComplete: true,
            pointsBreakdown: pointsBreakdown
        });

        this.state.gameActive = false;
    }

    highlightSolvedPath() {
        this.state.userPath.forEach(cellIndex => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) cell.classList.add('user-solved-path');
        });
    }

    handleMathematicalError(validationResult) {
        const errorIndex = validationResult.errorStep * 3;
        this.state.userPath = this.state.userPath.slice(0, errorIndex);
        this.updatePathDisplay();
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

    removeSpareCells(removedCells) {
        removedCells.forEach(cellIndex => {
            this.state.removedCells.add(cellIndex);
            updateCell(cellIndex, null);
        });
    }
}

export default GridEventHandler;
