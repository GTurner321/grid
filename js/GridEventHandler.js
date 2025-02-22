import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';
import { updateCell } from './gridRenderer.js';

class GridEventHandler {
    constructor(gameState) {
        console.error('🔨 FIXED GridEventHandler constructor called');
        
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
        
        // Make this available globally for emergency fix scripts
        window._gridEventHandler = this;
        
        console.error('✅ FIXED GridEventHandler initialized successfully');
    }

    setupGridInteractions() {
        console.error('🛠️ FIXED VERSION: Setting up grid interactions');
        
        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) {
            console.error('Grid container not found');
            return;
        }

        // Replace the entire grid container with a fresh one
        const newGridContainer = document.createElement('div');
        newGridContainer.id = 'grid-container';
        newGridContainer.className = gridContainer.className;
        newGridContainer.style.cssText = gridContainer.style.cssText + `
            display: grid !important;
            grid-template-columns: repeat(10, 1fr) !important;
            gap: 2px !important;
            background-color: #cbd5e1 !important;
            padding: 2px !important;
            border-radius: 8px !important;
            margin: 20px 0 !important;
            pointer-events: auto !important;
            position: relative !important;
            z-index: 5 !important;
        `;
        
        // Clone all children
        Array.from(gridContainer.children).forEach(cell => {
            const newCell = document.createElement('div');
            newCell.className = cell.className;
            newCell.dataset.index = cell.dataset.index;
            newCell.innerHTML = cell.innerHTML;
            
            // Apply critical styles
            newCell.style.cssText = `
                aspect-ratio: 1 !important;
                background-color: white !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 1.2rem !important;
                cursor: pointer !important;
                transition: background-color 0.2s !important;
                user-select: none !important;
                border: 1px solid #e5e7eb !important;
                pointer-events: auto !important;
                position: relative !important;
                z-index: 100 !important;
            `;
            
            // Make sure all children don't block clicks
            Array.from(newCell.children).forEach(child => {
                child.style.pointerEvents = 'none';
            });
            
            // Add direct click handler
            newCell.addEventListener('click', (e) => {
                console.error(`DIRECT CLICK: Cell ${newCell.dataset.index} clicked`);
                e.stopPropagation();
                e.preventDefault();
                
                // Visual feedback
                newCell.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
                setTimeout(() => {
                    newCell.style.boxShadow = '';
                }, 300);
                
                // Handle the click directly
                this.handleCellClick(newCell);
            });
            
            newGridContainer.appendChild(newCell);
        });
        
        // Replace the old container
        gridContainer.parentNode.replaceChild(newGridContainer, gridContainer);
        
        // Listen for clicks on the container as a backup
        newGridContainer.addEventListener('click', (e) => {
            const cell = e.target.closest('.grid-cell');
            if (cell) {
                console.error(`DELEGATED: Cell ${cell.dataset.index} clicked via container`);
                e.stopPropagation();
                
                // Call handler
                this.handleCellClick(cell);
            }
        });

        console.error('✅ FIXED VERSION: Grid interactions setup complete');
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
        console.error(`HANDLING CLICK: Cell ${cellIndex}`);
        
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

        // Update path display
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
        console.error('FIXED: Updating path display');

        // First, clear all previous highlights
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('selected', 'start-cell-selected', 'end-cell-selected');
            cell.style.backgroundColor = '';
            cell.style.color = '';
            cell.style.boxShadow = '';
            cell.style.zIndex = '';
            
            // Restore appropriate background for start/end cells
            if (cell.classList.contains('start-cell')) {
                cell.style.backgroundColor = 'green';
                cell.style.color = 'white';
            }
            if (cell.classList.contains('end-cell')) {
                cell.style.backgroundColor = 'red';
                cell.style.color = 'white';
            }
        });
        
        // Highlight current path using both classes and direct styling
        this.state.userPath.forEach((cellIndex, index) => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) {
                // Add classes
                cell.classList.add('selected');
                
                // Apply direct styling for more reliability
                cell.style.backgroundColor = '#60a5fa';
                cell.style.color = 'white';
                cell.style.zIndex = '200';
                cell.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.5)';
                
                // Special highlights for start and end
                if (index === 0) {
                    cell.classList.add('start-cell-selected');
                    cell.style.backgroundColor = 'darkgreen';
                }
                if (index === this.state.userPath.length - 1) {
                    cell.classList.add('end-cell-selected');
                    cell.style.backgroundColor = '#4f46e5';
                }
            }
        });
        
        console.error('Path display updated with styling');
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
        
        // Highlight the solved path with direct styling for reliability
        this.state.userPath.forEach(cellIndex => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) {
                cell.classList.add('user-solved-path');
                // Add direct styling as backup
                cell.style.backgroundColor = '#fef08a';
                cell.style.border = '2px solid #facc15';
                cell.style.zIndex = '200';
                cell.style.boxShadow = '0 0 10px rgba(250, 204, 21, 0.5)';
            }
        });
        
        // Update UI with completion details
        this.state.updateUI({
            roundComplete: true,
            pointsBreakdown: pointsBreakdown
        });

        // Deactivate game
        this.state.gameActive = false;
        
        // Show congratulatory message with direct DOM manipulation for reliability
        const messageElement = document.getElementById('game-messages');
        if (messageElement) {
            messageElement.textContent = 'Congratulations! Puzzle solved!';
            messageElement.className = 'message-box success';
            messageElement.style.backgroundColor = '#dcfce7';
            messageElement.style.color = '#166534';
            messageElement.style.padding = '15px';
            messageElement.style.borderRadius = '6px';
            messageElement.style.margin = '15px 0';
            messageElement.style.fontWeight = 'bold';
            messageElement.style.fontSize = '1.2rem';
            messageElement.style.textAlign = 'center';
        }
    }

    handleMathematicalError(validationResult) {
        // Truncate path to error point
        const errorIndex = validationResult.errorStep * 3;
        this.state.userPath = this.state.userPath.slice(0, errorIndex);
        
        // Update path display
        this.updatePathDisplay();
        
        // Show error message with direct styling for reliability
        const messageElement = document.getElementById('game-messages');
        if (messageElement) {
            messageElement.textContent = `Mathematical error: ${validationResult.errorDetails}`;
            messageElement.className = 'message-box error';
            messageElement.style.backgroundColor = '#fee2e2';
            messageElement.style.color = '#991b1b';
            messageElement.style.padding = '15px';
            messageElement.style.borderRadius = '6px';
            messageElement.style.margin = '15px 0';
            messageElement.style.fontWeight = 'bold';
            messageElement.style.fontSize = '1.2rem';
            messageElement.style.textAlign = 'center';
        }
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
