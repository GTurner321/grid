// gameLogic.js
import { generatePath } from './pathGenerator.js';
import { generateSequence, sequenceToEntries } from './sequenceGenerator.js';
import { renderGrid, updateCell, highlightPath, debugGridInfo } from './gridRenderer.js';

class GameState {
    constructor() {
        this.currentLevel = null;
        this.score = 0;
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
            this.score = 0;
            this.gameActive = false;
            this.updateUI();
        } catch (error) {
            console.error('Error resetting game state:', error);
        }
    }

    updateUI() {
        try {
            // Update score display
            const scoreElement = document.getElementById('score');
            if (scoreElement) {
                scoreElement.textContent = this.score;
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
                removeSpareBtn.addEventListener('click', () => this.removeSpareCell());
            }

            // Grid cell clicks
            const gridContainer = document.getElementById('grid-container');
            if (gridContainer) {
                gridContainer.addEventListener('click', (e) => {
                    if (e.target.classList.contains('grid-cell')) {
                        this.handleCellClick(e.target);
                    }
                });
            }

            // Instructions modal
            this.setupInstructionsModal();
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    setupInstructionsModal() {
        const instructionsBtn = document.getElementById('instructions-btn');
        const modal = document.getElementById('instructions-modal');
        const closeModalBtn = document.querySelector('.close-modal');

        if (instructionsBtn && modal && closeModalBtn) {
            instructionsBtn.addEventListener('click', () => {
                modal.style.display = 'block';
            });

            closeModalBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Close modal if clicked outside of content
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    async startLevel(level) {
        try {
            console.log(`Starting Level ${level}`);
            
            // Reset game state
            this.state.reset();
            this.state.currentLevel = level;
            this.state.gameActive = true;

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

            // Render the grid
            renderGrid(this.state.gridEntries);

            // Debug grid information
            debugGridInfo(this.state.gridEntries);

            // Update UI
            this.state.updateUI();

            this.showMessage('Game started! Find the path by following the mathematical sequence.');
        } catch (error) {
            console.error('Error starting level:', error);
            this.showMessage('Error starting game. Please try again.', 'error');
        }
    }

    placeMathSequence() {
        try {
            // Use the path coordinates to place sequence entries
            this.state.path.forEach((coord, index) => {
                // Ensure we don't exceed available sequence entries
                if (index < this.state.sequenceEntries.length) {
                    const cellIndex = coord[1] * 10 + coord[0];
                    this.state.gridEntries[cellIndex] = {
                        ...this.state.sequenceEntries[index],
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

    handleCellClick(cell) {
        try {
            if (!this.state.gameActive) return;

            const cellIndex = parseInt(cell.dataset.index);
            const cellCoord = [cellIndex % 10, Math.floor(cellIndex / 10)];

            // Toggle cell selection
            if (this.state.userPath.includes(cellIndex)) {
                // Remove this cell and all subsequent cells from the path
                const index = this.state.userPath.indexOf(cellIndex);
                this.state.userPath = this.state.userPath.slice(0, index);
            } else {
                // Add cell to path if it's a valid move
                if (this.isValidNextCell(cellCoord)) {
                    this.state.userPath.push(cellIndex);
                }
            }

            // Update visual state
            this.updatePathDisplay();
        } catch (error) {
            console.error('Error handling cell click:', error);
        }
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
            this.state.userPath.forEach(cellIndex => {
                const cell = document.querySelector(`[data-index="${cellIndex}"]`);
                if (cell) cell.classList.add('selected');
            });
        } catch (error) {
            console.error('Error updating path display:', error);
        }
    }

    checkSolution() {
        try {
            const isCorrect = this.validatePath();
            
            if (isCorrect) {
                this.state.score += 100;
                this.showMessage('Congratulations! You found the correct path!', 'success');
                this.state.gameActive = false;
                
                // Highlight the correct path
                highlightPath(this.state.path);
            } else {
                this.state.score -= 10;
                this.showMessage('That\'s not the correct path. Try again!', 'error');
            }

            this.state.updateUI();
        } catch (error) {
            console.error('Error checking solution:', error);
        }
    }

    validatePath() {
        try {
            if (this.state.userPath.length !== this.state.path.length) return false;

            return this.state.userPath.every((cellIndex, i) => {
                const userCoord = [cellIndex % 10, Math.floor(cellIndex / 10)];
                const pathCoord = this.state.path[i];
                return userCoord[0] === pathCoord[0] && userCoord[1] === pathCoord[1];
            });
        } catch (error) {
            console.error('Error validating path:', error);
            return false;
        }
    }

    removeSpareCell() {
        try {
            if (this.state.removedCells.size >= 20) {
                this.showMessage('Maximum number of cells removed', 'error');
                return;
            }

            // Find a random cell that's not part of the path
            const availableCells = this.state.gridEntries
                .map((entry, index) => (!entry || !entry.isPartOfPath) && 
                     !this.state.removedCells.has(index) ? index : null)
                .filter(index => index !== null);

            if (availableCells.length === 0) {
                this.showMessage('No more spare cells to remove', 'error');
                return;
            }

            const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
            this.state.removedCells.add(randomIndex);
            
            // Update visual state
            updateCell(randomIndex, null);
            
            // Update score
            this.state.score -= 5;
            this.state.updateUI();
        } catch (error) {
            console.error('Error removing spare cell:', error);
        }
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
