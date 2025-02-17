// In scoreManager.js

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

        // Track spare cell removal attempts
        this.spareRemovalCount = 0;
    }

    /**
     * Initialize scoring for a new level
     * @param {number} level - Current game level
     */
    initializeLevel(level) {
        this.currentLevel = level;
        this.maxLevelPoints = 1000 * level;  // Base points scale with level
        this.remainingPoints = this.maxLevelPoints;
        this.puzzleStartTime = new Date();
        this.spareRemovalCount = 0;
    }

    /**
     * Calculate bonus points based on time taken
     * Rounds seconds up to nearest 10 and uses formula: 1000 * level * (20/rounded_seconds)
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
     * Reduce points when checking solution
     * Reduces remaining points by 1/4, rounding up
     * @returns {number} Updated remaining points
     */
    reducePointsOnCheck() {
        this.remainingPoints = Math.ceil(this.remainingPoints * 0.75);
        return this.remainingPoints;
    }

    /**
     * Reduce points when removing spare cells
     * Reduces remaining points by 1/2, rounding up
     * Also tracks the number of removals used
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
        const bonusPoints = this.calculateBonusPoints();
        const totalPuzzlePoints = this.remainingPoints + bonusPoints;
        
        // Add to total score
        this.totalScore += totalPuzzlePoints;

        return {
            remainingPoints: this.remainingPoints,
            bonusPoints: bonusPoints,
            totalPuzzlePoints: totalPuzzlePoints,
            totalScore: this.totalScore
        };
    }

    /**
     * Reset scoring for a new game while preserving total score
     */
    reset() {
        this.maxLevelPoints = 0;
        this.remainingPoints = 0;
        this.currentLevel = null;
        this.puzzleStartTime = null;
        this.spareRemovalCount = 0;
    }
}

// Export a singleton instance
export const scoreManager = new ScoreManager();
