// gameLogic.js
import { generatePath } from './pathGenerator.js';
import { generateSequence, sequenceToEntries, formatNumber } from './sequenceGenerator.js';
import { renderGrid, updateCell, debugGridInfo } from './gridRenderer.js';
import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';

class GameState {
    constructor() {
        this.currentLevel = null;
        this.path = [];
        this.sequence = [];
        this.sequenceEntries = []; // Flat list of entries
        this.userPath = [];
        this.gridEntries = new Array(100).fill(null);
        this.removedCells = new Set();
        this.gameActive = false;
    }

    reset() {
        try {
            this.userPath = [];
            this.path = [];
            this.sequence = [];
            this.sequenceEntries = [];
            this.gridEntries = new Array(100).fill(null);
            this.removedCells.clear();
            this.gameActive = false;
            this.updateUI();
        } catch (error) {
            console.error('Error resetting game state:', error);
        }
    }

    updateUI() {
    try {
        const scoreComponentElement = document.getElementById('score-component');
        
        if (scoreComponentElement) {
            // Calculate bonus points
            const bonusPoints = scoreManager.calculateBonusPoints();
            const scoreForRound = scoreManager.remainingPoints + bonusPoints;

            // Create the container
            const scoreBoxContainer = document.createElement('div');
            scoreBoxContainer.className = 'fixed top-2 right-2 z-50 scale-75 origin-top-right';

            // Create the card
            const card = document.createElement('div');
            card.className = 'p-2 bg-yellow-200 border-4 border-black shadow-lg';

            // Create content
            card.innerHTML = `
                <div class="font-['Orbitron'] text-center">
                    <div class="grid grid-cols-2 gap-1 mb-1">
                        <div class="bg-yellow-300 p-1 border border-black">
                            <div class="text-[0.6rem] font-bold">POSSIBLE POINTS</div>
                            <div class="text-xl font-black">${scoreManager.remainingPoints}</div>
                        </div>
                        <div class="bg-yellow-300 p-1 border border-black">
                            <div class="text-[0.6rem] font-bold">BONUS</div>
                            <div class="text-xl font-black">${bonusPoints}</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-1">
                        <div class="bg-yellow-300 p-1 border border-black">
                            <div class="text-[0.6rem] font-bold">SCORE FOR ROUND</div>
                            <div class="text-xl font-black">${scoreForRound}</div>
                        </div>
                        <div class="bg-yellow-300 p-1 border border-black">
                            <div class="text-[0.6rem] font-bold">SCORE TOTAL</div>
                            <div class="text-xl font-black">${scoreManager.totalScore}</div>
                        </div>
                    </div>
                </div>
            `;

            // Append card to container
            scoreBoxContainer.appendChild(card);

            // Clear previous content and add new
            scoreComponentElement.innerHTML = '';
            scoreComponentElement.appendChild(scoreBoxContainer);
        }
        
        // Update button states
        const checkSolutionBtn = document.getElementById('check-solution');
        const removeSpareBtn = document.getElementById('remove-spare');
        
        if (checkSolutionBtn) checkSolutionBtn.disabled = !this.gameActive;
        if (removeSpareBtn) removeSpareBtn.disabled = !this.gameActive;
        
        // Update level buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.toggle('active', 
                parseInt(btn.dataset.level) === this.currentLevel
            );
        });
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}
}

class GameController {
    constructor() {
        console.log('Initializing GameController');
        this.state = new GameState();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
    try {
        console.log('Setting up event listeners');
        
        // Level selection
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.dataset.level);
                console.log(`Selected Level: ${level}`);
                this.startLevel(level);
            });
        });

        // Game controls
        const checkSolutionBtn = document.getElementById('check-solution');
        const removeSpareBtn = document.getElementById('remove-spare');

        if (checkSolutionBtn) {
            checkSolutionBtn.addEventListener('click', () => this.checkSolution());
        }

        if (removeSpareBtn) {
            removeSpareBtn.addEventListener('click', () => this.removeAllSpareCells());
        }

        // Grid cell interactions
        const gridContainer = document.getElementById('grid-container');
        if (gridContainer) {
            // Mouse/click events
            gridContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('grid-cell')) {
                    this.handleCellClick(e.target);
                }
            });

            // Touch support
            let touchStartCell = null;
            
            gridContainer.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const cell = document.elementFromPoint(
                    e.touches[0].clientX, 
                    e.touches[0].clientY
                );
                
                if (cell && cell.classList.contains('grid-cell')) {
                    touchStartCell = cell;
                    this.handleCellClick(cell);
                }
            });

            gridContainer.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const cell = document.elementFromPoint(
                    e.touches[0].clientX, 
                    e.touches[0].clientY
                );
                
                if (cell && cell.classList.contains('grid-cell')) {
                    this.handleCellClick(cell);
                }
            });
        }
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}
    
    async startLevel(level) {
        try {
            console.log(`Starting Level ${level}`);
            
            // Reset game state
            this.state.reset();
            this.state.currentLevel = level;
            this.state.gameActive = true;

            // Initialize scoring for this level
            scoreManager.initializeLevel(level);

            // Generate path
            this.state.path = await generatePath();
            console.log('Generated Path:', this.state.path);

            // Generate sequence
            this.state.sequence = await generateSequence(level);
            
            // Convert sequence to flat list of entries
            this.state.sequenceEntries = sequenceToEntries(this.state.sequence);
            console.log('Sequence Entries:', this.state.sequenceEntries);

            // Place sequence entries along the path
            this.placeMathSequence();

            // Fill remaining cells
            this.fillRemainingCells();

            // Render the grid with start and end coordinates
            renderGrid(this.state.gridEntries, {
                startCoord: this.state.path[0],
                endCoord: this.state.path[this.state.path.length - 1]
            });

            // Display the sequence of sums
            this.displaySequenceSums();

            // Debug grid information
            debugGridInfo(this.state.gridEntries);

            // Update UI
            this.updateRemoveButtonText();
            this.state.updateUI();

            this.showMessage('Game started! Find the path by following the mathematical sequence.');
        } catch (error) {
            console.error('Error starting level:', error);
            this.showMessage('Error starting game. Please try again.', 'error');
        }
    }

    displaySequenceSums() {
        const sumsContainer = document.getElementById('sequence-sums');
        if (sumsContainer) {
            // Clear previous sums
            sumsContainer.innerHTML = '';

            // Create a list of sums
            const sumsList = document.createElement('ul');
            this.state.sequence.forEach(sum => {
                const sumItem = document.createElement('li');
                sumItem.textContent = `${formatNumber(sum.num1)} ${sum.operator} ${formatNumber(sum.num2)} = ${formatNumber(sum.result)}`;
                sumsList.appendChild(sumItem);
            });

            sumsContainer.appendChild(sumsList);
        }
    }

    placeMathSequence() {
    try {
        // Use the path coordinates to place sequence entries
        this.state.path.forEach((coord, index) => {
            // Ensure we don't exceed available sequence entries
            if (index < this.state.sequenceEntries.length) {
                const cellIndex = coord[1] * 10 + coord[0];
                
                // Convert value to string for fraction rendering
                const value = this.state.sequenceEntries[index].value;
                const formattedValue = value instanceof Object 
                    ? (value.numerator && value.denominator 
                        ? `${value.numerator}/${value.denominator}` 
                        : value.toString()) 
                    : value;

                this.state.gridEntries[cellIndex] = {
                    ...this.state.sequenceEntries[index],
                    value: formattedValue,
                    isPartOfPath: true,
                    pathIndex: index
                };
            }
        });
    } catch (error) {
        console.error('Error placing math sequence:', error);
    }
}

    fillRemainingCells() {
        try {
            // Get remaining sequence entries not used in the path
            const remainingEntries = this.state.sequenceEntries.slice(this.state.path.length);
            
            // Get empty cell indices
            const emptyCells = this.state.gridEntries
                .map((entry, index) => entry === null ? index : null)
                .filter(index => index !== null);

            // Shuffle remaining entries and empty cells
            const shuffledEntries = [...remainingEntries].sort(() => Math.random() - 0.5);
            const shuffledEmptyCells = emptyCells.sort(() => Math.random() - 0.5);

            // Fill empty cells with remaining entries
            shuffledEmptyCells.forEach((cellIndex, i) => {
                if (i < shuffledEntries.length) {
                    this.state.gridEntries[cellIndex] = {
                        ...shuffledEntries[i],
                        isPartOfPath: false
                    };
                } else {
                    // If we run out of entries, generate random entries
                    this.state.gridEntries[cellIndex] = this.generateRandomEntry();
                }
            });
        } catch (error) {
            console.error('Error filling remaining cells:', error);
        }
    }

    generateRandomEntry() {
        // Generate a random number or simple math entry
        return {
            type: 'number',
            value: Math.floor(Math.random() * 20) + 1
        };
    }

    removeAllSpareCells() {
    try {
        // Get removal info from score manager
        const removalResult = scoreManager.reducePointsOnRemoveSpareCells();
        
        if (!removalResult.success) {
            this.showMessage(removalResult.message, 'error');
            return;
        }

        // Find all spare cells that haven't been removed yet
        const spareCells = this.state.gridEntries
            .map((entry, index) => (!entry?.isPartOfPath && !this.state.removedCells.has(index)) ? index : null)
            .filter(index => index !== null);

        if (spareCells.length === 0) {
            this.showMessage('No spare cells to remove!', 'info');
            return;
        }

        // For first removal, randomly select 50% of spare cells
        if (removalResult.isFirstRemoval) {
            const numCellsToRemove = Math.ceil(spareCells.length * 0.5);
            const shuffledCells = spareCells.sort(() => Math.random() - 0.5);
            const cellsToRemove = shuffledCells.slice(0, numCellsToRemove);

            cellsToRemove.forEach(cellIndex => {
                this.state.removedCells.add(cellIndex);
                updateCell(cellIndex, null);
            });

            this.showMessage(`Removed ${cellsToRemove.length} spare cells (50%). One more removal available.`, 'info');
        } 
        // For second removal, remove all remaining spare cells
        else if (removalResult.isSecondRemoval) {
            spareCells.forEach(cellIndex => {
                this.state.removedCells.add(cellIndex);
                updateCell(cellIndex, null);
            });

            this.showMessage(`Removed remaining ${spareCells.length} spare cells. No more removals available.`, 'info');
        }

        // Update UI to reflect new score
        this.state.updateUI();
        
        // Update remove button text
        this.updateRemoveButtonText();
    } catch (error) {
        console.error('Error removing spare cells:', error);
    }
}

updateRemoveButtonText() {
    const removeSpareBtn = document.getElementById('remove-spare');
    if (!removeSpareBtn) return;

    const spareInfo = scoreManager.getSpareRemovalInfo();
    
    if (spareInfo.remainingAttempts === 2) {
        removeSpareBtn.textContent = 'Remove 50% of Spare Cells';
    } else if (spareInfo.remainingAttempts === 1) {
        removeSpareBtn.textContent = 'Remove Remaining Spare Cells';
    } else {
        removeSpareBtn.textContent = 'No More Removals';
        removeSpareBtn.disabled = true;
    }
}
    
    handleCellClick(cell) {
    try {
        if (!this.state.gameActive) return;

        const cellIndex = parseInt(cell.dataset.index);
        
        // Find the actual clickable element
        const actualCell = cell.classList.contains('grid-cell') 
            ? cell 
            : cell.closest('.grid-cell');

        if (!actualCell) {
            console.warn('No grid cell found for selection');
            return;
        }

        const cellCoord = [cellIndex % 10, Math.floor(cellIndex / 10)];

        // Check if this is the start square
        const isStartSquare = this.isStartSquare(cellIndex);
        const isEndSquare = this.isEndSquare(cellIndex);

        // If no path started, force start with green square
        if (this.state.userPath.length === 0) {
            if (isStartSquare) {
                this.state.userPath.push(cellIndex);
                this.updatePathDisplay();
                return;
            } else {
                this.showMessage('You must start at the green square!', 'error');
                return;
            }
        }

        // Check if move is valid (adjacent to last selected square)
        const lastCellIndex = this.state.userPath[this.state.userPath.length - 1];
        const lastCoord = [lastCellIndex % 10, Math.floor(lastCellIndex / 10)];

        const dx = Math.abs(cellCoord[0] - lastCoord[0]);
        const dy = Math.abs(cellCoord[1] - lastCoord[1]);

        // Validate adjacency
        if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
            this.showMessage('You can only move to adjacent squares!', 'error');
            return;
        }

        // If end square is already selected and clicked again, submit solution
        if (isEndSquare && this.state.userPath.includes(cellIndex)) {
            this.checkSolution();
            return;
        }

        // Handle path selection
        if (this.state.userPath.includes(cellIndex)) {
            // Remove subsequent squares if already selected
            const index = this.state.userPath.indexOf(cellIndex);
            this.state.userPath = this.state.userPath.slice(0, index);
        } else {
            // Add cell to path
            this.state.userPath.push(cellIndex);
        }

        // Update visual state
        this.updatePathDisplay();
    } catch (error) {
        console.error('Error handling cell click:', error);
    }
}
    
isStartSquare(cellIndex) {
    const coord = [cellIndex % 10, Math.floor(cellIndex / 10)];
    const startCoord = this.state.path[0];
    return coord[0] === startCoord[0] && coord[1] === startCoord[1];
}

isEndSquare(cellIndex) {
    const coord = [cellIndex % 10, Math.floor(cellIndex / 10)];
    const endCoord = this.state.path[this.state.path.length - 1];
    return coord[0] === endCoord[0] && coord[1] === endCoord[1];
}
    
    isValidNextCell(coord) {
        if (this.state.userPath.length === 0) return true;

        const lastCellIndex = this.state.userPath[this.state.userPath.length - 1];
        const lastCoord = [lastCellIndex % 10, Math.floor(lastCellIndex / 10)];

        const dx = Math.abs(coord[0] - lastCoord[0]);
        const dy = Math.abs(coord[1] - lastCoord[1]);

        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    updatePathDisplay() {
    try {
        // Clear all cell highlights
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('selected');
        });

        // Highlight selected path
        this.state.userPath.forEach((cellIndex, index) => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) {
                cell.classList.add('selected');
                
                // Special styling for start and end squares
                if (this.isStartSquare(cellIndex)) {
                    cell.classList.add('start-cell-selected');
                }
                if (this.isEndSquare(cellIndex)) {
                    cell.classList.add('end-cell-selected');
                }
            }
        });
    } catch (error) {
        console.error('Error updating path display:', error);
    }
}

    checkSolution() {
        try {
            // Reduce points on solution check
            scoreManager.reducePointsOnCheck();
            
            // Validate the path
            const validationResult = validatePath({
                userPath: this.state.userPath,
                gridEntries: this.state.gridEntries,
                originalPath: this.state.path
            });

            if (validationResult.isValid) {
                if (validationResult.isValidLength && validationResult.endsAtEndSquare) {
                    // Puzzle completely solved
                    this.handlePuzzleSolved();
                } else if (!validationResult.endsAtEndSquare && validationResult.isValidLength) {
                    // Path correct but not at end square
                    this.showMessage('Path is mathematically correct! Continue to the end square.', 'info');
                } else if (!validationResult.isValidLength) {
                    this.showMessage('Path is mathematically correct so far. Keep going!', 'info');
                }
            } else {
                // Mathematical error found
                this.handleMathematicalError(validationResult);
            }

            // Update UI to reflect new score
            this.state.updateUI();
        } catch (error) {
            console.error('Error checking solution:', error);
        }
    }

    handlePuzzleSolved() {
        // Complete puzzle and get points breakdown
        const pointsBreakdown = scoreManager.completePuzzle();
        
        // Highlight user path
        this.highlightUserPath();

        // Show detailed message
        this.showMessage(
            `Congratulations! 
            Remaining Points: ${pointsBreakdown.remainingPoints}
            Bonus Points: ${pointsBreakdown.bonusPoints}
            Total Puzzle Points: ${pointsBreakdown.totalPuzzlePoints}
            Total Score: ${pointsBreakdown.totalScore}`, 
            'success'
        );

        // Disable game
        this.state.gameActive = false;
    }

    handleMathematicalError(validationResult) {
        // Truncate user path to the point of error
        const errorIndex = validationResult.errorStep * 3;
        this.state.userPath = this.state.userPath.slice(0, errorIndex);

        // Update path display
        this.updatePathDisplay();

        // Show error message
        this.showMessage(
            `Mathematical error: ${validationResult.errorDetails}`, 
            'error'
        );
    }

    highlightUserPath() {
        this.state.userPath.forEach(cellIndex => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) cell.classList.add('user-solved-path');
        });
    }

    showMessage(message, type = 'info') {
        try {
            const messageElement = document.getElementById('game-messages');
            if (messageElement) {
                messageElement.textContent = message;
                messageElement.className = type;
                
                // Clear message after 3 seconds
                setTimeout(() => {
                    messageElement.textContent = '';
                    messageElement.className = '';
                }, 3000);
            }
        } catch (error) {
            console.error('Error showing message:', error);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM Loaded: Initializing Game');
        window.gameController = new GameController();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});

export default GameController;
