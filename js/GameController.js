import { generatePath } from './pathGenerator.js';
import { generateSequence, sequenceToEntries, formatNumber } from './sequenceGenerator.js';
import { renderGrid, updateCell, debugGridInfo } from './gridRenderer.js';
import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';
import GameState from './GameState.js';
import GridEventHandler from './GridEventHandler.js';

class GameController {
constructor() {
    console.log('Initializing GameController');
    console.log('Level Buttons:', document.querySelectorAll('.level-btn'));
    this.state = new GameState();
    this.gridEventHandler = new GridEventHandler(this.state);
    this.initializeEventListeners();
}

    initializeEventListeners() {
    try {
        console.log('Setting up event listeners');
        
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
    console.error('CRITICAL: Setting up level buttons - VERBOSE DEBUG');
    
    const levelButtons = document.querySelectorAll('.level-btn');
    console.error(`CRITICAL: Found ${levelButtons.length} level buttons`);

    levelButtons.forEach((btn, index) => {
        // Completely remove and recreate the event listener
        btn.onclick = null; // Remove any existing onclick
        
        btn.addEventListener('click', (e) => {
            console.error(`CRITICAL: Level Button ${index + 1} CLICKED!`);
            
            e.preventDefault();
            e.stopPropagation();
            
            const level = btn.getAttribute('data-level');
            console.error(`CRITICAL: Attempting to start level: ${level}`);
            
            // Bind the method to ensure correct 'this' context
            const boundStartLevel = this.startLevel.bind(this);
            
            boundStartLevel(parseInt(level))
                .then(() => {
                    console.error(`CRITICAL: Level ${level} started SUCCESSFULLY`);
                })
                .catch((error) => {
                    console.error(`CRITICAL: Error starting level ${level}:`, error);
                });
        }, { once: false }); // Ensure listener can be called multiple times
    });
}
    
setupGameStartListener() {
    window.addEventListener('gameStart', () => {
        console.log('Game start event received');
        this.state.gameActive = true;
        this.state.updateUI();
        this.state.showMessage('Select a level to begin!', 'info');
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
    console.log(`DETAILED: Starting Level ${level}`);
    try {
        console.log('Detailed step-by-step level start:');
        
        // Reset game state
        console.log('1. Resetting game state...');
        this.state.reset();
        
        // Set current level
        console.log('2. Setting current level...');
        this.state.currentLevel = level;
        
        // Activate game
        console.log('3. Setting game as active...');
        this.state.gameActive = true;

        // Initialize scoring
        console.log('4. Initializing scoring...');
        scoreManager.initializeLevel(level);

        // Generate path
        console.log('5. Generating path...');
        this.state.path = await generatePath();
        console.log('Path generated:', this.state.path);

        // Generate sequence
        console.log('6. Generating sequence...');
        this.state.sequence = await generateSequence(level);
        console.log('Sequence generated:', this.state.sequence);
        
        // Convert sequence to entries
        console.log('7. Converting sequence to entries...');
        this.state.sequenceEntries = sequenceToEntries(this.state.sequence);
        console.log('Sequence entries:', this.state.sequenceEntries);

        // Place math sequence
        console.log('8. Placing math sequence...');
        this.placeMathSequence();
        
        // Fill remaining cells
        console.log('9. Filling remaining cells...');
        this.fillRemainingCells();

        // Make sequence container visible
        console.log('10. Making sequence container visible...');
        const sequenceContainer = document.querySelector('.sequence-container');
        if (sequenceContainer) {
            sequenceContainer.style.display = 'block';
        }

        // Render grid
        console.log('11. Rendering grid...');
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

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Create and attach the game controller to window
        const gameController = new GameController();
        window.gameController = gameController;
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});

export default GameController;
