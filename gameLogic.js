// Import required modules
import { generatePath } from './pathGenerator.js';
import { generateSequence } from './sequenceGenerator.js';
import { renderGrid, updateCell, highlightPath } from './gridRenderer.js';

class GameState {
    constructor() {
        this.currentLevel = null;
        this.score = 0;
        this.path = [];
        this.sequence = [];
        this.userPath = [];
        this.gridEntries = new Array(100).fill(null);
        this.removedCells = new Set();
        this.gameActive = false;
    }

    reset() {
        this.userPath = [];
        this.score = 0;
        this.removedCells.clear();
        this.updateUI();
    }

    updateUI() {
        // Update score display
        document.getElementById('score').textContent = this.score;
        
        // Update button states
        document.getElementById('check-solution').disabled = !this.gameActive;
        document.getElementById('remove-spare').disabled = !this.gameActive;
        
        // Update level buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.level) === this.currentLevel);
        });
    }
}

class GameController {
    constructor() {
        this.state = new GameState();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Level selection
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => this.startLevel(parseInt(btn.dataset.level)));
        });

        // Game controls
        document.getElementById('check-solution').addEventListener('click', () => this.checkSolution());
        document.getElementById('remove-spare').addEventListener('click', () => this.removeSpareCell());

        // Grid cell clicks
        document.getElementById('grid-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('grid-cell')) {
                this.handleCellClick(e.target);
            }
        });
    }

    async startLevel(level) {
        this.state.currentLevel = level;
        this.state.reset();
        this.state.gameActive = true;

        try {
            // Generate new path
            this.state.path = await generatePath();

            // Generate sequence for the level
            this.state.sequence = await generateSequence(level);

            // Place sequence numbers and operators along the path
            this.placeMathSequence();

            // Fill remaining cells with random entries
            this.fillRemainingCells();

            // Render the grid
            renderGrid(this.state.gridEntries);

            // Update UI
            this.state.updateUI();
            this.showMessage('Game started! Find the path by following the mathematical sequence.');

        } catch (error) {
            console.error('Error starting level:', error);
            this.showMessage('Error starting game. Please try again.', 'error');
        }
    }

    placeMathSequence() {
        let sequenceIndex = 0;
        
        // Place sequence entries along the path
        this.state.path.forEach((coord, index) => {
            const cellIndex = coord[1] * 10 + coord[0];
            
            if (sequenceIndex < this.state.sequence.length) {
                this.state.gridEntries[cellIndex] = {
                    value: this.state.sequence[sequenceIndex],
                    isPartOfPath: true,
                    pathIndex: index
                };
                sequenceIndex++;
            }
        });
    }

    fillRemainingCells() {
        // Get all empty cell indices
        const emptyCells = this.state.gridEntries
            .map((entry, index) => entry === null ? index : null)
            .filter(index => index !== null);

        // Create array of remaining sequence entries
        const remainingEntries = this.state.sequence.slice(this.state.path.length);

        // Shuffle remaining entries
        const shuffledEntries = [...remainingEntries].sort(() => Math.random() - 0.5);

        // Fill empty cells
        emptyCells.forEach((cellIndex, i) => {
            this.state.gridEntries[cellIndex] = {
                value: shuffledEntries[i] || this.generateRandomEntry(),
                isPartOfPath: false
            };
        });
    }

    generateRandomEntry() {
        // Generate a random number or operator based on level rules
        // This will need to match the sequence generator's rules
        return {
            value: Math.floor(Math.random() * 20) + 1,
            type: 'number'
        };
    }

    handleCellClick(cell) {
        if (!this.state.gameActive || this.state.removedCells.has(cell.dataset.index)) {
            return;
        }

        const cellIndex = parseInt(cell.dataset.index);
        const cellCoord = [cellIndex % 10, Math.floor(cellIndex / 10)];

        // Toggle cell selection
        if (this.state.userPath.includes(cellIndex)) {
            // Remove this cell and all subsequent cells from the path
            const index = this.state.userPath.indexOf(cellIndex);
            this.state.userPath = this.state.userPath.slice(0, index);
        } else {
            // Add cell to path if it's adjacent to the last selected cell
            if (this.isValidNextCell(cellCoord)) {
                this.state.userPath.push(cellIndex);
            }
        }

        // Update visual state
        this.updatePathDisplay();
    }

    isValidNextCell(coord) {
        if (this.state.userPath.length === 0) return true;

        const lastCell = this.state.userPath[this.state.userPath.length - 1];
        const lastCoord = [lastCell % 10, Math.floor(lastCell / 10)];

        const dx = Math.abs(coord[0] - lastCoord[0]);
        const dy = Math.abs(coord[1] - lastCoord[1]);

        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    updatePathDisplay() {
        // Clear all cell highlights
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('selected');
        });

        // Highlight selected path
        this.state.userPath.forEach(cellIndex => {
            document.querySelector(`[data-index="${cellIndex}"]`).classList.add('selected');
        });
    }

    checkSolution() {
        const isCorrect = this.validatePath();
        
        if (isCorrect) {
            this.state.score += 100;
            this.showMessage('Congratulations! You found the correct path!', 'success');
            this.state.gameActive = false;
        } else {
            this.state.score -= 10;
            this.showMessage('That\'s not the correct path. Try again!', 'error');
        }

        this.state.updateUI();
    }

    validatePath() {
        if (this.state.userPath.length !== this.state.path.length) return false;

        return this.state.userPath.every((cellIndex, i) => {
            const userCoord = [cellIndex % 10, Math.floor(cellIndex / 10)];
            const pathCoord = this.state.path[i];
            return userCoord[0] === pathCoord[0] && userCoord[1] === pathCoord[1];
        });
    }

    removeSpareCell() {
        if (this.state.removedCells.size >= 20) {
            this.showMessage('Maximum number of cells removed', 'error');
            return;
        }

        // Find a random cell that's not part of the path
        const availableCells = this.state.gridEntries
            .map((entry, index) => (!entry.isPartOfPath && !this.state.removedCells.has(index)) ? index : null)
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
    }

    showMessage(message, type = 'info') {
        const messageElement = document.getElementById('game-messages');
        messageElement.textContent = message;
        messageElement.className = type;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = '';
        }, 3000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});

export default GameController;
