import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';
import { updateCell } from './gridRenderer.js';

class GridEventHandler {
    constructor(gameState) {
        console.error('🔨 GridEventHandler constructor called');
        
        if (!gameState) {
            console.error('❌ No game state provided');
            throw new Error('Game state is required for GridEventHandler');
        }

        this.state = gameState;
        
        // Bind methods
        this.setupGridInteractions = this.setupGridInteractions.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.isValidMove = this.isValidMove.bind(this);
        this.updatePathDisplay = this.updatePathDisplay.bind(this);
        this.validateSolution = this.validateSolution.bind(this);
        this.isStartSquare = this.isStartSquare.bind(this);
        this.isEndSquare = this.isEndSquare.bind(this);
        this.getCellCoordinates = this.getCellCoordinates.bind(this);
        this.handleValidPath = this.handleValidPath.bind(this);
        this.handlePuzzleSolved = this.handlePuzzleSolved.bind(this);
        this.handleMathematicalError = this.handleMathematicalError.bind(this);
        
        console.error('GridEventHandler initialized successfully');
    }

    setupGridInteractions() {
        console.error('Setting up grid interactions');
        
        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) {
            console.error('Grid container not found');
            return;
        }

        // Direct and global approach to ensure clicks work
        document.addEventListener('click', (e) => {
            const cell = e.target.closest('.grid-cell');
            if (cell) {
                console.error(`Cell clicked via global handler: ${cell.dataset.index}`);
                this.handleCellClick(cell);
                e.stopPropagation();
            }
        }, true);
        
        console.error('Grid interactions setup complete with global handler');
    }

    handleCellClick(cell) {
        if (!cell) {
            console.error('No cell provided to handleCellClick');
            return;
        }
        
        if (!this.state.gameActive) {
            console.error('Game not active, ignoring click');
            return;
        }

        const cellIndex = parseInt(cell.dataset.index);
        console.error(`Processing click on cell ${cellIndex}`);
        
        // First click logic
        if (this.state.userPath.length === 0) {
            if (this.isStartSquare(cellIndex)) {
                this.state.userPath.push(cellIndex);
                this.updatePathDisplay();
                console.error(`Start square selected: ${cellIndex}`);
                this.state.showMessage('Path started! Now continue by selecting connected cells.', 'info');
            } else {
                this.state.showMessage('You must start at the green square!', 'error');
            }
            return;
        }

        // Not a valid move
        if (!this.isValidMove(cellIndex)) {
            this.state.showMessage('You can only move to adjacent squares!', 'error');
            return;
        }

        // Update path - handle backtracking
        if (this.state.userPath.includes(cellIndex)) {
            const index = this.state.userPath.indexOf(cellIndex);
            this.state.userPath = this.state.userPath.slice(0, index + 1);
            console.error(`Backtracked to cell: ${cellIndex}`);
        } else {
            this.state.userPath.push(cellIndex);
            console.error(`Added new cell to path: ${cellIndex}`);
        }

        this.updatePathDisplay();
        
        // Enable check solution button if path is started
        const checkSolutionBtn = document.getElementById('check-solution');
        if (checkSolutionBtn) {
            checkSolutionBtn.disabled = false;
        }

        // Check for end square
        if (this.isEndSquare(cellIndex)) {
            console.error(`End square reached: ${cellIndex}`);
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
        console.error('Updating path display');

        // Clear previous highlights
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('selected', 'start-cell-selected', 'end-cell-selected');
        });
        
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
        this.state.userPath.forEach(cellIndex => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) cell.classList.add('user-solved-path');
        });
        
        // Update UI with completion details
        this.state.updateUI({
            roundComplete: true,
            pointsBreakdown: pointsBreakdown
        });

        // Deactivate game
        this.state.gameActive = false;
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
