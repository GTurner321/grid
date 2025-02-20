import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';
import { updateCell } from './gridRenderer.js';

class GridEventHandler {
    constructor(gameState) {
        this.state = gameState;
    }

    setupGridInteractions() {
        const gridContainer = document.getElementById('grid-container');
        if (gridContainer) {
            this.setupMouseEvents(gridContainer);
            this.setupTouchEvents(gridContainer);
        } else {
            console.warn('Grid container not found');
        }
    }

    setupMouseEvents(gridContainer) {
        gridContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('grid-cell')) {
                this.handleCellClick(e.target);
            }
        });
    }

    setupTouchEvents(gridContainer) {
        gridContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchEvent(e);
        });

        gridContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouchEvent(e);
        });
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
        if (!this.state.gameActive) return;

        try {
            const cellIndex = parseInt(cell.dataset.index);
            const actualCell = this.getActualCell(cell);
            
            if (!actualCell) {
                console.warn('No grid cell found for selection');
                return;
            }

            this.processClick(cellIndex);
        } catch (error) {
            console.error('Error handling cell click:', error);
        }
    }

    getActualCell(cell) {
        return cell.classList.contains('grid-cell') ? cell : cell.closest('.grid-cell');
    }

    processClick(cellIndex) {
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
        } else {
            this.state.showMessage('You must start at the green square!', 'error');
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
        this.updatePathDisplay();
    }

    updatePathDisplay() {
        try {
            this.clearAllHighlights();
            this.highlightSelectedPath();
        } catch (error) {
            console.error('Error updating path display:', error);
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
