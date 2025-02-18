// scoreBox.js
import React, { useState, useEffect } from 'react';

const ScoreBox = ({ 
    level,
    possiblePoints,
    spareRemovalCount = 0,
    checkCount = 0,
    startTime,
    isComplete = false,
    totalScore = 0
}) => {
    const [bonus, setBonus] = useState(0);
    const [currentPossiblePoints, setCurrentPossiblePoints] = useState(possiblePoints);
    const [scoreForRound, setScoreForRound] = useState(0);
    const [currentTotalScore, setCurrentTotalScore] = useState(totalScore);

    // Reset score for round and bonus when new puzzle starts
    useEffect(() => {
        if (startTime) {
            setScoreForRound(0);
            setBonus(0);
        }
    }, [startTime]);

    // Calculate bonus points every 10 seconds
    useEffect(() => {
        if (!startTime || isComplete) return;

        const calculateBonus = () => {
            const secondsTaken = (new Date() - new Date(startTime)) / 1000;
            const roundedSeconds = Math.ceil(secondsTaken / 10) * 10;
            
            if (roundedSeconds === 0) {
                return possiblePoints * 2; // Maximum bonus for instant solve
            }
            
            const bonusMultiplier = 20 / roundedSeconds;
            const bonusPoints = 1000 * level * bonusMultiplier;
            return Math.ceil(bonusPoints);
        };

        // Initial bonus calculation
        setBonus(calculateBonus());

        const bonusInterval = setInterval(() => {
            setBonus(calculateBonus());
        }, 10000);

        return () => clearInterval(bonusInterval);
    }, [startTime, level, possiblePoints, isComplete]);

    // Update possible points based on spare removals and checks
    useEffect(() => {
        let points = possiblePoints;
        
        // Reduce for spare removals (divide by 2 each time)
        for (let i = 0; i < spareRemovalCount; i++) {
            points = Math.ceil(points / 2);
        }
        
        // Reduce for checks (divide by 4 each time)
        for (let i = 0; i < checkCount; i++) {
            points = Math.ceil(points * 0.75);
        }
        
        setCurrentPossiblePoints(points);
    }, [possiblePoints, spareRemovalCount, checkCount]);

    // Update score for round and total score when puzzle is complete
    useEffect(() => {
        if (isComplete) {
            const finalScore = currentPossiblePoints + bonus;
            setScoreForRound(finalScore);
            setCurrentTotalScore(totalScore + finalScore);
        } else {
            // When starting new puzzle, maintain previous total score
            setCurrentTotalScore(totalScore);
        }
    }, [isComplete, currentPossiblePoints, bonus, totalScore]);

    return React.createElement('div', { className: 'fixed top-2 right-2 z-50 scale-75 origin-top-right' },
        React.createElement('div', { className: 'p-2 bg-yellow-200 border-4 border-black shadow-lg' },
            React.createElement('div', { className: "font-['Orbitron'] text-center grid grid-cols-2 gap-2" }, [
                React.createElement('div', { key: 'possible', className: 'bg-yellow-300 p-1 border border-black flex justify-between items-center' }, [
                    React.createElement('span', { className: 'font-bold text-left' }, 'POSSIBLE POINTS'),
                    React.createElement('span', { className: 'font-bold text-right' }, currentPossiblePoints)
                ]),
                React.createElement('div', { key: 'bonus', className: 'bg-yellow-300 p-1 border border-black flex justify-between items-center' }, [
                    React.createElement('span', { className: 'font-bold text-left' }, 'BONUS'),
                    React.createElement('span', { className: 'font-bold text-right' }, bonus)
                ]),
                React.createElement('div', { key: 'round', className: 'bg-yellow-300 p-1 border border-black flex justify-between items-center' }, [
                    React.createElement('span', { className: 'font-bold text-left' }, 'SCORE FOR ROUND'),
                    React.createElement('span', { className: 'font-bold text-right' }, scoreForRound)
                ]),
                React.createElement('div', { key: 'total', className: 'bg-yellow-300 p-1 border border-black flex justify-between items-center' }, [
                    React.createElement('span', { className: 'font-bold text-left' }, 'SCORE TOTAL'),
                    React.createElement('span', { className: 'font-bold text-right' }, currentTotalScore)
                ])
            ])
        )
    );
};

export default ScoreBox;
