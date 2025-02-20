import React from 'react';
import ReactDOM from 'react-dom/client';
import ScoreBox from './scoreBox.js';
import { scoreManager } from './scoreManager.js';

class GameState {
    constructor() {
        this.currentLevel = null;
        this.path = [];
        this.sequence = [];
        this.sequenceEntries = [];
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

    updateUI(options = {}) {
        try {
            console.log('Updating UI - DETAILED', { options });
            
            const scoreComponentElement = document.getElementById('score-component');
            
            if (scoreComponentElement) {
                // Create root only once
                if (!this.scoreRoot) {
                    this.scoreRoot = ReactDOM.createRoot(scoreComponentElement);
                }

                // Create the ScoreBox element with all necessary props
                const scoreElement = React.createElement(ScoreBox, {
                    level: this.currentLevel,
                    possiblePoints: scoreManager.maxLevelPoints,
                    spareRemovalCount: scoreManager.spareRemovalCount,
                    checkCount: scoreManager.checkCount,
                    startTime: scoreManager.puzzleStartTime,
                    isComplete: options.roundComplete || false,
                    totalScore: scoreManager.totalScore
                });

                // Render the score component
                this.scoreRoot.render(scoreElement);
            }
            
            // Update button states
            const checkSolutionBtn = document.getElementById('check-solution');
            const removeSpareBtn = document.getElementById('remove-spare');
            
            if (checkSolutionBtn) {
                checkSolutionBtn.disabled = !this.gameActive;
            }
            
            if (removeSpareBtn) {
                removeSpareBtn.disabled = !this.gameActive;
                
                // Update remove button text based on remaining attempts
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
            
            // Update level buttons
            const levelButtons = document.querySelectorAll('.level-btn');
            
            levelButtons.forEach(btn => {
                const buttonLevel = parseInt(btn.dataset.level);
                const isActive = buttonLevel === this.currentLevel;
                btn.classList.toggle('active', isActive);
            });

            // Handle round completion UI updates
            if (options.roundComplete && options.pointsBreakdown) {
                this.showMessage(
                    `Congratulations! 
                    Remaining Points: ${options.pointsBreakdown.remainingPoints}
                    Bonus Points: ${options.pointsBreakdown.bonusPoints}
                    Total Puzzle Points: ${options.pointsBreakdown.totalPuzzlePoints}
                    Total Score: ${options.pointsBreakdown.totalScore}`, 
                    'success'
                );
            }
            
        } catch (error) {
            console.error('Error updating UI:', error);
            this.showMessage('Error updating game display', 'error');
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

export default GameState;
