import { generatePath } from './pathGenerator.js';
import { generateSequence, sequenceToEntries, formatNumber } from './sequenceGenerator.js';
import { renderGrid, updateCell, debugGridInfo } from './gridRenderer.js';
import { scoreManager } from './scoreManager.js';
import { validatePath } from './pathValidator.js';
import GameState from './GameState.js';
import GridEventHandler from './GridEventHandler.js';

class GameController {
    constructor() {
        this.state = new GameState();
        this.gridEventHandler = new GridEventHandler(this.state);
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        try {
            this.setupGameStartListener();
            this.setupLevelButtons();
            this.setupGameControlButtons();
            this.gridEventHandler.setupGridInteractions();
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            this.state.showMessage('Error initializing game controls', 'error');
        }
    }

    setupGameStartListener() {
        window.addEventListener('gameStart', () => {
            this.state.gameActive = true;
            this.state.updateUI();
            this.state.showMessage('Select a level to begin!', 'info');
        });
        window.dispatchEvent(new Event('gameStart'));
    }

    setupLevelButtons() {
        const levelButtons = document.querySelectorAll('.level-btn');
        levelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.dataset.level);
                try {
                    this.startLevel(level);
                } catch (error) {
                    console.error(`Error starting level ${level}:`, error);
                    this.state.showMessage(`Error starting level ${level}`, 'error');
                }
            });
        });
    }

    setupGameControlButtons() {
        this.setupCheckSolutionButton();
        this.setupRemoveSpareButton();
    }

    setupCheckSolutionButton() {
        const checkSolutionBtn = document.getElementById('check-solution');
        if (checkSolutionBtn) {
            checkSolutionBtn.addEventListener('click', () => this.checkSolution());
        }
    }

    setupRemoveSpareButton() {
        const removeSpareBtn = document.getElementById('remove-spare');
        if (removeSpareBtn) {
            removeSpareBtn.addEventListener('click', () => this.removeAllSpareCells());
        }
    }

    async startLevel(level) {
        try {
            this.state.reset();
            this.state.currentLevel = level;
            this.state.gameActive = true;

            scoreManager.initializeLevel(level);
            
            await this.generateLevelContent(level);
            this.setupLevel();
            
            this.state.showMessage('Game started! Find the path by following the mathematical sequence.');
        } catch (error) {
            console.error('Error starting level:', error);
            this.state.showMessage('Error starting game. Please try again.', 'error');
        }
    }

    async generateLevelContent(level) {
        this.state.path = await generatePath();
        this.state.sequence = await generateSequence(level);
        this.state.sequenceEntries = sequenceToEntries(this.state.sequence);
    }

    setupLevel() {
        this.placeMathSequence();
        this.fillRemainingCells();
        
        renderGrid(this.state.gridEntries, {
            startCoord: this.state.path[0],
            endCoord: this.state.path[this.state.path.length - 1]
        });

        this.displaySequenceSums();
        debugGridInfo(this.state.gridEntries);

        this.state.updateUI({
            resetScores: true,
            preserveTotalScore: true
        });
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

        this.state.showMessage(
            `Removed ${cellsToRemove.length} spare cells (50%). One more removal available.`, 
            'info'
        );
    }

    handleSecondRemoval(spareCells) {
        spareCells.forEach(cellIndex => {
            this.state.removedCells.add(cellIndex);
            updateCell(cellIndex, null);
        });

        this.state.showMessage(
            `Removed remaining ${spareCells.length} spare cells. No more removals available.`, 
            'info'
        );
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
