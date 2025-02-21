import React from 'react';
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
        this.scoreRoot = null;
    }

    reset() {
        try {
            console.log('GameState: Resetting state');
            this.userPath = [];
            this.path = [];
            this.sequence = [];
            this.sequenceEntries = [];
            this.gridEntries = new Array(100).fill(null);
            this.removedCells.clear();
            this.gameActive = false;
            
            // Important: We don't reset currentLevel here to maintain level selection
            
            // Clear the grid container
            const gridContainer = document.getElementById('grid-container');
            if (gridContainer) {
                gridContainer.innerHTML = '';
            }
            
            // Hide sequence container
            const sequenceContainer = document.querySelector('.sequence-container');
            if (sequenceContainer) {
                sequenceContainer.style.display = 'none';
            }
            
            // Update UI to reflect reset state
            this.updateUI();
            
            console.log('GameState: Reset complete');
        } catch (error) {
            console.error('Error resetting game state:', error);
            console.error('Error stack:', error.stack);
        }
    }
    
    updateUI(options = {}) {
    try {
        console.log('Updating UI - DETAILED', { options });
        
        const scoreComponentElement = document.getElementById('score-component');
        
        if (scoreComponentElement && window.React && window.ReactDOM) {
            // Only try to render the score component if React is available
            const scoreProps = {
                key: Date.now(),
                level: this.currentLevel,
                possiblePoints: scoreManager.maxLevelPoints,
                spareRemovalCount: scoreManager.spareRemovalCount,
                checkCount: scoreManager.checkCount,
                startTime: scoreManager.puzzleStartTime,
                isComplete: options.roundComplete || false,
                totalScore: scoreManager.totalScore
            };

            try {
                // Add this console log to debug
                console.log('Rendering score with props:', scoreProps);
                
                // Create the score element - THIS WAS MISSING
                const scoreElement = window.React.createElement(ScoreBox, scoreProps);
                
                // Handle different React versions
                if (this.scoreRoot) {
                    // Already created with createRoot
                    this.scoreRoot.render(scoreElement);
                } else if (typeof window.ReactDOM.createRoot === 'function') {
                    // React 18+ - createRoot available
                    this.scoreRoot = window.ReactDOM.createRoot(scoreComponentElement);
                    this.scoreRoot.render(scoreElement);
                } else if (typeof window.ReactDOM.render === 'function') {
                    // React 17 and earlier
                    window.ReactDOM.render(scoreElement, scoreComponentElement);
                } else {
                    console.error('No React rendering method available');
                }
            } catch (error) {
                console.error('Error rendering score component:', error);
            }
        } else {
            console.error('Score component element not found or React not available', {
                hasElement: !!scoreComponentElement,
                hasReact: !!window.React,
                hasReactDOM: !!window.ReactDOM
            });
        }
        
            // Update button states
            const checkSolutionBtn = document.getElementById('check-solution');
            const removeSpareBtn = document.getElementById('remove-spare');
            
            if (checkSolutionBtn) {
                checkSolutionBtn.disabled = !this.gameActive || this.userPath.length === 0;
            }
            
            if (removeSpareBtn) {
                const spareInfo = scoreManager.getSpareRemovalInfo();
                removeSpareBtn.disabled = !this.gameActive || spareInfo.remainingAttempts === 0;
                
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

            // Update sequence container visibility
            const sequenceContainer = document.querySelector('.sequence-container');
            if (sequenceContainer) {
                sequenceContainer.style.display = this.gameActive ? 'block' : 'none';
            }

            // Show completion message if applicable
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
            console.error('Error stack:', error.stack);
            this.showMessage('Error updating game display', 'error');
        }
    }

    showMessage(message, type = 'info') {
        try {
            const messageElement = document.getElementById('game-messages');
            if (messageElement) {
                messageElement.textContent = message;
                messageElement.className = 'message-box ' + type;
                
                // Clear message after 5 seconds for better visibility
                setTimeout(() => {
                    if (messageElement.textContent === message) {
                        messageElement.textContent = '';
                        messageElement.className = 'message-box';
                    }
                }, 5000);
            } else {
                console.error('Game messages element not found');
            }
        } catch (error) {
            console.error('Error showing message:', error);
            console.error('Error stack:', error.stack);
        }
    }
}

export default GameState;
