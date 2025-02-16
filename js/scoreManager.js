// scoreManager.js

export class ScoreManager {
    constructor() {
        // Total score across all games
        this.totalScore = 0;
        
        // Current level's scoring parameters
        this.currentLevel = null;
        this.maxLevelPoints = 0;
        this.remainingPoints = 0;
        
        // Puzzle start time for bonus calculations
        this.puzzleStartTime = null;
    }

    /**
     * Initialize scoring for a new level
     * @param {number} level - Current game level
     */
    initializeLevel(level) {
        this.currentLevel = level;
        
        // Base points: 1000 * level number
        this.maxLevelPoints = 1000 * level;
        this.remainingPoints = this.maxLevelPoints;
        
        // Reset puzzle start time
        this.puzzleStartTime = new Date();
    }

    /**
     * Reduce points when checking solution
     * Reduces remaining points by 1/4, rounding up
     */
    reducePointsOnCheck() {
        this.remainingPoints = Math.ceil(this.remainingPoints * 0.75);
        return this.remainingPoints;
    }

    /**
     * Reduce points when removing spare cells
     * Reduces remaining points by 1/2, rounding up
     */
    reducePointsOnRemoveSpareCells() {
        this.remainingPoints = Math.ceil(this.remainingPoints / 2);
        return this.remainingPoints;
    }

    /**
     * Calculate bonus points based on time taken
     * @returns {number} Bonus points rounded up
     */
    calculateBonusPoints() {
        if (!this.puzzleStartTime) return 0;

        const secondsTaken = (new Date() - this.puzzleStartTime) / 1000;
        const bonusMultiplier = 20 / secondsTaken;
        
        // Calculate bonus points: 1000 * level * (20/seconds)
        const bonusPoints = 1000 * this.currentLevel * bonusMultiplier;
        
        // Round up bonus points
        return Math.ceil(bonusPoints);
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
     * Reset scoring for a new game
     */
    reset() {
        this.maxLevelPoints = 0;
        this.remainingPoints = 0;
        this.currentLevel = null;
        this.puzzleStartTime = null;
    }
}

// Export a singleton instance
export const scoreManager = new ScoreManager();
