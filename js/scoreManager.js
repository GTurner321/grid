// scoreManager.js

class ScoreManager {
    constructor() {
        // Total score across all games
        this.totalScore = 0;
        
        // Current level's scoring parameters
        this.currentLevel = null;
        this.maxLevelPoints = 0;
        this.remainingPoints = 0;
        
        // Puzzle start time for bonus calculations
        this.puzzleStartTime = null;

        // Track counts for point reductions
        this.spareRemovalCount = 0;
        this.checkCount = 0;

        // Bonus points tracking
        this.currentBonus = 0;
        this.bonusUpdateInterval = null;
    }

    /**
     * Initialize scoring for a new level
     * @param {number} level - Current game level
     */
    initializeLevel(level) {
        // Clear any existing bonus interval
        if (this.bonusUpdateInterval) {
            clearInterval(this.bonusUpdateInterval);
        }

        this.currentLevel = level;
        this.maxLevelPoints = 1000 * level;  // Base points scale with level
        this.remainingPoints = this.maxLevelPoints;
        this.puzzleStartTime = new Date();
        this.spareRemovalCount = 0;
        this.checkCount = 0;
        this.currentBonus = 0;

        // Start bonus point updates
        this.startBonusUpdates();
    }

    /**
     * Start interval for updating bonus points
     */
    startBonusUpdates() {
        // Initial calculation
        this.currentBonus = this.calculateBonusPoints();

        // Update every 10 seconds
        this.bonusUpdateInterval = setInterval(() => {
            this.currentBonus = this.calculateBonusPoints();
        }, 10000);
    }

    /**
     * Calculate bonus points based on time taken
     * @returns {number} Bonus points rounded up
     */
    calculateBonusPoints() {
        if (!this.puzzleStartTime) return 0;
        
        const secondsTaken = (new Date() - this.puzzleStartTime) / 1000;
        // Round up to nearest 10 seconds
        const roundedSeconds = Math.ceil(secondsTaken / 10) * 10;
        
        // Handle special cases
        if (roundedSeconds === 0) {
            return this.maxLevelPoints * 2; // Maximum bonus for instant solve
        }
        
        // Calculate bonus: 1000 * level * (20/rounded_seconds)
        const bonusMultiplier = 20 / roundedSeconds;
        const bonusPoints = 1000 * this.currentLevel * bonusMultiplier;
        
        return Math.ceil(bonusPoints);
    }

    /**
     * Get current bonus points
     * @returns {number} Current bonus points
     */
    getCurrentBonus() {
        return this.currentBonus;
    }

    /**
     * Reduce points when checking solution
     * Reduces remaining points by 25%, rounding up
     * @returns {Object} Updated points information
     */
    reducePointsOnCheck() {
        this.checkCount++;
        this.remainingPoints = Math.ceil(this.remainingPoints * 0.75);
        
        return {
            remainingPoints: this.remainingPoints,
            checkCount: this.checkCount,
            bonusPoints: this.currentBonus
        };
    }

    /**
     * Reduce points when removing spare cells
     * Reduces remaining points by 50%, rounding up
     * @returns {Object} Information about the removal operation
     */
    reducePointsOnRemoveSpareCells() {
        if (this.spareRemovalCount >= 2) {
            return {
                success: false,
                message: 'No more spare cell removals available'
            };
        }

        this.remainingPoints = Math.ceil(this.remainingPoints / 2);
        this.spareRemovalCount++;

        return {
            success: true,
            remainingPoints: this.remainingPoints,
            spareRemovalStage: this.spareRemovalCount,
            isFirstRemoval: this.spareRemovalCount === 1,
            isSecondRemoval: this.spareRemovalCount === 2,
            percentToRemove: this.spareRemovalCount === 1 ? 0.5 : 1 // 50% first time, 100% second time
        };
    }

    /**
     * Complete puzzle and calculate total points
     * @returns {Object} Points breakdown
     */
    completePuzzle() {
        // Stop bonus updates
        if (this.bonusUpdateInterval) {
            clearInterval(this.bonusUpdateInterval);
        }

        const finalBonus = this.calculateBonusPoints();
        const totalPuzzlePoints = this.remainingPoints + finalBonus;
        
        // Add to total score
        this.totalScore += totalPuzzlePoints;

        return {
            remainingPoints: this.remainingPoints,
            bonusPoints: finalBonus,
            totalPuzzlePoints: totalPuzzlePoints,
            totalScore: this.totalScore
        };
    }

    /**
     * Get information about spare removal availability
     * @returns {Object} Spare removal status
     */
    getSpareRemovalInfo() {
        return {
            remainingAttempts: 2 - this.spareRemovalCount,
            isFirstRemoval: this.spareRemovalCount === 0,
            isSecondRemoval: this.spareRemovalCount === 1,
            canRemoveMore: this.spareRemovalCount < 2
        };
    }

    /**
     * Get current score state
     * @returns {Object} Current score state
     */
    getCurrentScoreState() {
        return {
            totalScore: this.totalScore,
            currentLevel: this.currentLevel,
            maxLevelPoints: this.maxLevelPoints,
            remainingPoints: this.remainingPoints,
            bonusPoints: this.currentBonus,
            spareRemovalCount: this.spareRemovalCount,
            checkCount: this.checkCount
        };
    }
    
    /**
     * Reset scoring for a new game while preserving total score
     */
    reset() {
        // Clear bonus interval if it exists
        if (this.bonusUpdateInterval) {
            clearInterval(this.bonusUpdateInterval);
        }

        this.maxLevelPoints = 0;
        this.remainingPoints = 0;
        this.currentLevel = null;
        this.puzzleStartTime = null;
        this.spareRemovalCount = 0;
        this.checkCount = 0;
        this.currentBonus = 0;
        // Note: totalScore is not reset
    }
}

// Export a singleton instance
export const scoreManager = new ScoreManager();
