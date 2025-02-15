/**
 * Configuration for different game levels
 */
const LEVEL_CONFIG = {
    1: { maxNum: 30, allowFractions: false, maxDenominator: 12 },
    2: { maxNum: 99, allowFractions: false, maxDenominator: 12 },
    3: { maxNum: 30, allowFractions: true, maxDenominator: 5 },
    4: { maxNum: 30, allowFractions: true, maxDenominator: 12 },
    5: { maxNum: 99, allowFractions: true, maxDenominator: 12 }
};

/**
 * Represents a fraction with numerator and denominator
 */
class Fraction {
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }

    toDecimal() {
        return this.numerator / this.denominator;
    }

    toString() {
        return `${this.numerator}/${this.denominator}`;
    }
}

/**
 * Checks if a number or fraction is valid for the given configuration
 * @param {number|Fraction} num - Number to validate
 * @param {Object} config - Level configuration
 * @returns {boolean}
 */
const isValidNumber = (num, config) => {
    if (typeof num === 'number') {
        return Number.isInteger(num) && num > 0 && num <= config.maxNum;
    }
    if (!config.allowFractions) return false;
    
    return num.numerator <= 11 && 
           num.numerator > 0 && 
           num.denominator >= 2 && 
           num.denominator <= config.maxDenominator;
};

/**
 * Generates a random fraction
 * @param {number} maxDenominator - Maximum denominator allowed
 * @returns {Fraction}
 */
const generateFraction = (maxDenominator = 12) => {
    const denominator = Math.floor(Math.random() * (maxDenominator - 1)) + 2;
    const numerator = Math.floor(Math.random() * 11) + 1;
    if (numerator >= denominator) return generateFraction(maxDenominator);
    return new Fraction(numerator, denominator);
};

/**
 * Calculates the result of an operation between two numbers/fractions
 * @param {number|Fraction} num1 - First number
 * @param {string} operator - Mathematical operator
 * @param {number|Fraction} num2 - Second number
 * @param {Object} config - Level configuration
 * @returns {number|Fraction|null}
 */
const calculateResult = (num1, operator, num2, config) => {
    const n1 = num1 instanceof Fraction ? num1.toDecimal() : num1;
    const n2 = num2 instanceof Fraction ? num2.toDecimal() : num2;
    
    let result;
    switch (operator) {
        case '+': result = n1 + n2; break;
        case '-': result = n1 - n2; break;
        case '*': result = n1 * n2; break;
        case '/': 
            if (n2 === 0) return null;
            result = n1 / n2; 
            break;
        default: return null;
    }
    
    if (result <= 0 || result > config.maxNum || isNaN(result)) return null;
    
    if (Number.isInteger(result)) return result;
    if (!config.allowFractions) return null;
    
    // Try to convert decimal to fraction
    for (let denominator = 2; denominator <= config.maxDenominator; denominator++) {
        const numerator = Math.round(result * denominator);
        if (numerator <= 11 && numerator > 0 && 
            numerator < denominator &&
            Math.abs(numerator/denominator - result) < 0.0001) {
            return new Fraction(numerator, denominator);
        }
    }
    
    return null;
};

/**
 * Selects an operator and second number for the sequence
 * @param {number|Fraction} num1 - First number
 * @param {Object} config - Level configuration
 * @returns {Object} Selected operator and second number
 */
const selectOperatorAndNum2 = (num1, config) => {
    const n1 = num1 instanceof Fraction ? num1.toDecimal() : num1;
    
    if (n1 > 16) {
        if (Math.random() < 0.8) {
            if (Math.random() < 0.4) {
                const targetResult = Math.floor(Math.random() * 16) + 1;
                const num2 = Math.floor(n1 - targetResult);
                if (num2 > 1 && num2 <= config.maxNum) {
                    return { operator: '-', num2 };
                }
            } else {
                for (let divisor = 2; divisor <= Math.min(10, config.maxNum); divisor++) {
                    if (n1 / divisor < 17 && n1 % divisor === 0) {
                        return { operator: '/', num2: divisor };
                    }
                }
            }
        }
    }
    
    const operatorBias = Math.random();
    let operator;
    if (operatorBias < 0.35) operator = '*';
    else if (operatorBias < 0.6) operator = '/';
    else if (operatorBias < 0.8) operator = '+';
    else operator = '-';
    
    let num2;
    do {
        if (typeof num1 === 'number') {
            num2 = Math.random() < 0.7 ? 
                Math.floor(Math.random() * (config.maxNum - 1)) + 2 : 
                (config.allowFractions ? generateFraction(config.maxDenominator) : 
                Math.floor(Math.random() * (config.maxNum - 1)) + 2);
        } else {
            num2 = Math.floor(Math.random() * (config.maxNum - 1)) + 2;
        }
    } while (num2 === 1);
    
    return { operator, num2 };
};

/**
 * Generates the next sum in the sequence
 * @param {number|Fraction} startNum - Starting number
 * @param {number} level - Game level
 * @returns {Object|null} Generated sum or null if invalid
 */
const generateNextSum = (startNum, level) => {
    const config = LEVEL_CONFIG[level];
    if (!config) throw new Error(`Invalid level: ${level}`);

    let attempts = 0;
    while (attempts < 100) {
        const { operator, num2 } = selectOperatorAndNum2(startNum, config);
        
        if (startNum instanceof Fraction && num2 instanceof Fraction) {
            attempts++;
            continue;
        }
        
        const result = calculateResult(startNum, operator, num2, config);
        
        if (result !== null && isValidNumber(result, config)) {
            return {
                num1: startNum,
                operator: operator === '*' ? 'x' : operator,
                num2,
                result
            };
        }
        attempts++;
    }
    return null;
};

/**
 * Formats a number or fraction as a string
 * @param {number|Fraction} num - Number to format
 * @returns {string}
 */
export const formatNumber = (num) => {
    if (num instanceof Fraction) return num.toString();
    return num.toString();
};

/**
 * Generates a complete sequence for a given level
 * @param {number} level - Game level (1-5)
 * @returns {Array} Array of sequence entries
 */
export const generateSequence = async (level) => {
    const config = LEVEL_CONFIG[level];
    if (!config) throw new Error(`Invalid level: ${level}`);

    let sequence = [];
    let currentNum = Math.floor(Math.random() * 16) + 1;
    
    for (let i = 0; i < 100; i++) {
        const sum = generateNextSum(currentNum, level);
        if (!sum) break;
        
        sequence.push({
            ...sum,
            display: `${formatNumber(sum.num1)} ${sum.operator} ${formatNumber(sum.num2)} = ${formatNumber(sum.result)}`
        });
        
        currentNum = sum.result;
    }
    
    return sequence;
};

/**
 * Converts a sequence to a flat array of entries
 * @param {Array} sequence - Generated sequence
 * @returns {Array} Flattened array of numbers and operators
 */
export const sequenceToEntries = (sequence) => {
    const entries = [];
    
    sequence.forEach((sum, index) => {
        // First number of the first sum
        if (index === 0) {
            entries.push({ type: 'number', value: sum.num1 });
        }

        // Operator
        entries.push({ 
            type: 'operator', 
            value: sum.operator 
        });

        // Second number
        entries.push({ 
            type: 'number', 
            value: sum.num2 
        });

        // Result
        entries.push({ 
            type: 'number', 
            value: sum.result 
        });
    });

    return entries;
};

export const getLevelConfig = (level) => LEVEL_CONFIG[level];
