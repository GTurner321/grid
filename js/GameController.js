import { generatePath } from './pathGenerator.js';
import { generateSequence, sequenceToEntries, formatNumber } from './sequenceGenerator.js';
import { renderGrid, updateCell, debugGridInfo } from './gridRenderer.js';
import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';
import GameState from './GameState.js';
import GridEventHandler from './GridEventHandler.js';

class GameController {
    constructor() {
        console.error('CRITICAL: GameController constructor starting');
        
        // Debug instance creation
        try {
            this.state = new GameState();
            this.gridEventHandler = new GridEventHandler(this.state);
            
            // Bind critical methods to ensure proper 'this' context
            this.startLevel = this.startLevel.bind(this);
            this.checkSolution = this.checkSolution.bind(this);
            this.removeAllSpareCells = this.removeAllSpareCells.bind(this);
            
            console.error('Instance created:', {
                hasState: !!this.state,
                hasGridHandler: !!this.gridEventHandler,
                methods: Object.getOwnPropertyNames(Object.getPrototypeOf(this)),
                startLevelExists: typeof this.startLevel === 'function'
            });
            
            this.initializeEventListeners();
            
            // Make instance globally accessible for debugging
            window._gameController = this;
            console.error('GameController instance stored in window._gameController');
        } catch (error) {
            console.error('CRITICAL: Error in constructor:', error);
            console.error('Stack:', error.stack);
        }
    }

    initializeEventListeners() {
        try {
            console.error('Setting up event listeners');
            
            // Add level button setup first
            this.setupLevelButtons();
            
            // Then your existing listeners
            this.setupGameStartListener();
            this.setupGameControlButtons();
            this.gridEventHandler.setupGridInteractions();
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            this.state.showMessage('Error initializing game controls', 'error');
        }
    }

    setupLevelButtons() {
        console.error('CRITICAL: Setting up level buttons - ULTRA VERBOSE');
        
        // Store instance reference
        const self = this;
        console.error('DEBUG: GameController instance:', self);
        
        const levelButtons = document.querySelectorAll('.level-btn');
        console.error(`CRITICAL: Found ${levelButtons.length} level buttons`);

        levelButtons.forEach((btn, index) => {
            // Remove existing click listeners first to avoid duplication
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add a direct click event handler
            newBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.error(`Button ${index + 1} clicked`);
                const level = parseInt(newBtn.dataset.level);
                console.error('Starting level:', level);
                
                try {
                    // Check if startLevel is available
                    if (typeof self.startLevel !== 'function') {
                        throw new Error('startLevel is not a function');
                    }
                    
                    console.error('GameController instance at click:', self);
                    console.error('About to call startLevel');
                    
                    // Call startLevel on the stored instance
                    await self.startLevel(level);
                } catch (err) {
                    console.error('ERROR in click handler:', {
                        error: err,
                        errorName: err.name,
                        errorMessage: err.message,
                        stack: err.stack,
                        self: self,
                        startLevelType: typeof self.startLevel
                    });
                }
            });

            // Log initial button setup
            console.error(`Setup complete for button ${index + 1}`, {
                level: newBtn.dataset.level,
                hasClickHandler: typeof newBtn.onclick === 'function'
            });
        });

        // Add global click debugging
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.matches('.level-btn')) {
                console.error('Global click handler:', {
                    element: target,
                    level: target.dataset.level,
                    self: self,
                    hasStartLevel: typeof self.startLevel === 'function'
                });
            }
        }, true);
    }
    
    setupGameStartListener() {
        window.addEventListener('gameStart', (event) => {
            console.error('CRITICAL: Game Start Event Received');
            console.error('Event details:', event);
            console.error('Current Game State:', this.state);
            
            if (this.state.currentLevel === null) {
                this.state.gameActive = true;
                this.state.updateUI();
                this.state.showMessage('Select a level to begin!', 'info');
            }
        });
    }

    setupGameControlButtons() {
        this.setupCheckSolutionButton();
        this.setupRemoveSpareButton();
    }

    setupCheckSolutionButton() {
        const checkSolutionBtn = document.getElementById('check-solution');
        if (checkSolutionBtn) {
            checkSolutionBtn.addEventListener('click', () => {
                console.log('Check solution clicked');
                this.checkSolution();
            });
        }
    }

    setupRemoveSpareButton() {
        const removeSpareBtn = document.getElementById('remove-spare');
        if (removeSpareBtn) {
            removeSpareBtn.addEventListener('click', () => {
                console.log('Remove spare cells clicked');
                this.removeAllSpareCells();
            });
        }
    }

    async startLevel(level) {
        console.error(`CRITICAL: startLevel method CALLED with level: ${level}`);
        
        try {
            // Debug check state and imports
            console.error('DEBUG: Checking state and imports', {
                state: this.state,
                generatePath: typeof generatePath,
                generateSequence: typeof generateSequence,
                gridContainer: document.getElementById('grid-container')
            });
            
            console.log(`DETAILED: Starting Level ${level}`);
            
            // Reset game state
            console.log('1. Resetting game state...');
            this.state.reset();
            console.error('DEBUG: State after reset:', this.state);
            
            // Set current level
            console.log('2. Setting current level...');
            this.state.currentLevel = level;
            
            // Activate game
            console.log('3. Setting game as active...');
            this.state.gameActive = true;

            // Initialize scoring
            console.log('4. Initializing scoring...');
            scoreManager.initializeLevel(level);

            // Generate path with debug
            console.log('5. Generating path...');
            console.error('DEBUG: About to call generatePath');
            this.state.path = await generatePath();
            console.error('DEBUG: Path generated:', this.state.path);

            // Generate sequence with debug
            console.log('6. Generating sequence...');
            console.error('DEBUG: About to call generateSequence with level:', level);
            this.state.sequence = await generateSequence(level);
            console.error('DEBUG: Sequence generated:', this.state.sequence);
            
            // Convert sequence to entries
            console.log('7. Converting sequence to entries...');
            this.state.sequenceEntries = sequenceToEntries(this.state.sequence);
            console.error('DEBUG: Sequence entries:', this.state.sequenceEntries);

            // Place math sequence
            console.log('8. Placing math sequence...');
            this.placeMathSequence();
            
            // Fill remaining cells
            console.log('9. Filling remaining cells...');
            this.fillRemainingCells();

            // Make sequence container visible
            console.log('10. Making sequence container visible...');
            const sequenceContainer = document.querySelector('.sequence-container');
            console.error('DEBUG: Sequence container found:', !!sequenceContainer);
            if (sequenceContainer) {
                sequenceContainer.style.display = 'block';
            }

            // Render grid with debug
            console.log('11. Rendering grid...');
            console.error('DEBUG: Grid data before render:', {
                entries: this.state.gridEntries,
                startCoord: this.state.path[0],
                endCoord: this.state.path[this.state.path.length - 1]
            });
            
            renderGrid(this.state.gridEntries, {
                startCoord: this.state.path[0],
                endCoord: this.state.path[this.state.path.length - 1]
            });

            // Display sequence sums
            console.log('12. Displaying sequence sums...');
            this.displaySequenceSums();

            // Update UI
            console.log('13. Updating UI...');
            this.state.updateUI({
                resetScores: true,
                preserveTotalScore: true
            });

            // Show start message
            console.log('14. Showing start message...');
            this.state.showMessage('Game started! Find the path by following the mathematical sequence.');

            console.log('Level start COMPLETE');
        } catch (error) {
            console.error('DETAILED Error starting level:', error);
            console.error('Error stack:', error.stack);
            console.error('DEBUG: Error context:', {
                state: this.state,
                level: level,
                gridContainer: document.getElementById('grid-container')
            });
            this.state.showMessage('Error starting game. Please try again.', 'error');
            throw error;
        }
    }
    
    displaySequenceSums() {
        const sumsContainer = document.getElementById('sequence-sums');
        if (sumsContainer) {
            sumsContainer.innerHTML = '';
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
            this.state.path.forEach((coord, index) => {
                if (index < this.state.sequenceEntries.length) {
                    const cellIndex = coord[1] * 10 + coord[0];
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
            const remainingEntries = this.state.sequenceEntries.slice(this.state.path.length);
            const emptyCells = this.state.gridEntries
                .map((entry, index) => entry === null ? index : null)
                .filter(index => index !== null);

            const shuffledEntries = [...remainingEntries].sort(() => Math.random() - 0.5);
            const shuffledEmptyCells = emptyCells.sort(() => Math.random() - 0.5);

            shuffledEmptyCells.forEach((cellIndex, i) => {
                if (i < shuffledEntries.length) {
                    this.state.gridEntries[cellIndex] = {
                        ...shuffledEntries[i],
                        isPartOfPath: false
                    };
                } else {
                    this.state.gridEntries[cellIndex] = this.generateRandomEntry();
                }
            });
        } catch (error) {
            console.error('Error filling remaining cells:', error);
        }
    }

    generateRandomEntry() {
        return {
            type: 'number',
            value: Math.floor(Math.random() * 20) + 1
        };
    }

    removeAllSpareCells() {
        try {
            const removalResult = scoreManager.reducePointsOnRemoveSpareCells();
            
            if (!removalResult.success) {
                this.state.showMessage(removalResult.message, 'error');
                return;
            }

            const spareCells = this.state.gridEntries
                .map((entry, index) => (!entry?.isPartOfPath && !this.state.removedCells.has(index)) ? index : null)
                .filter(index => index !== null);

            if (spareCells.length === 0) {
                this.state.showMessage('No spare cells to remove!', 'info');
                return;
            }

            if (removalResult.isFirstRemoval) {
                this.handleFirstRemoval(spareCells);
            } else if (removalResult.isSecondRemoval) {
                this.handleSecondRemoval(spareCells);
            }

            this.state.updateUI();
        } catch (error) {
            console.error('Error removing spare cells:', error);
        }
    }

    handleFirstRemoval(spareCells) {
        const numCellsToRemove = Math.ceil(spareCells.length * 0.5);
        const shuffledCells = spareCells.sort(() => Math.random() - 0.5);
        const cellsToRemove = shuffledCells.slice(0, numCellsToRemove);

        cellsToRemove.forEach(cellIndex => {
            this.state.removedCells.add(cellIndex);
            updateCell(cellIndex, null);
        });

        this.state.showMessage(`Removed ${cellsToRemove.length} spare cells (50%). One more removal available.`, 'info');
    }

    handleSecondRemoval(spareCells) {
        spareCells.forEach(cellIndex => {
            this.state.removedCells.add(cellIndex);
            updateCell(cellIndex, null);
        });

        this.state.showMessage(`Removed remaining ${spareCells.length} spare cells. No more removals available.`, 'info');
    }

    checkSolution() {
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
            console.error('Error checking solution:', error);
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
        this.highlightUserPath();

        this.state.updateUI({
            roundComplete: true,
            pointsBreakdown: pointsBreakdown
        });

        this.state.gameActive = false;
    }

    handleMathematicalError(validationResult) {
        const errorIndex = validationResult.errorStep * 3;
        this.state.userPath = this.state.userPath.slice(0, errorIndex);
        this.gridEventHandler.updatePathDisplay();
        this.state.showMessage(`Mathematical error: ${validationResult.errorDetails}`, 'error');
    }

    highlightUserPath() {
        this.state.userPath.forEach(cellIndex => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) cell.classList.add('user-solved-path');
        });
    }
}

export default GameController;
