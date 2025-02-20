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

    // ... Rest of the GameController methods ...
}

export default GameController;
