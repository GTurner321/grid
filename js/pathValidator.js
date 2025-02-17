// pathValidator.js

/**
 * Converts various input types to a consistent numeric representation
 * @param {string|number} val - Value to convert
 * @returns {number} Converted numeric value
 */

// When getting cell values, use the dataset value if available
function getCellValue(cell) {
    return cell.dataset.value 
        ? cell.dataset.value 
        : cell.textContent;
}

function convertToNumber(val) {
    if (typeof val === 'string' && val.includes('/')) {
        const [numerator, denominator] = val.split('/').map(Number);
        return numerator / denominator;
    }
    return Number(val);
}

/**
 * Performs a mathematical calculation step
 * @param {string|number} num1 - First number
 * @param {string} operator - Mathematical operator
 * @param {string|number} num2 - Second number
 * @returns {number|null} Result of calculation or null if invalid
 */
function calculateStep(num1, operator, num2) {
    const a = convertToNumber(num1);
    const b = convertToNumber(num2);

    switch(operator) {
        case '+': return a + b;
        case '-': return a - b;
        case 'x': return a * b;
        case '/': 
            // Prevent division by zero
            return b !== 0 ? a / b : null;
        default: return null;
    }
}

/**
 * Validates a mathematical sequence of path entries
 * @param {Array} pathEntries - Array of grid entries representing the path
 * @returns {Object} Validation result
 */

export function validateMathematicalSequence(pathEntries) {
    const calculationSteps = [];
    let currentResult = null;

    for (let i = 0; i < pathEntries.length; i += 3) {
        // Ensure we have enough entries to form a complete calculation
        if (i + 2 >= pathEntries.length) break;

        const num1 = currentResult !== null ? currentResult : getCellValue(pathEntries[i]);
        const operator = pathEntries[i + 1].value;
        const num2 = getCellValue(pathEntries[i + 2]);

        const result = calculateStep(num1, operator, num2);

        if (result === null) {
            return {
                isValid: false,
                errorStep: i,
                errorDetails: `Invalid calculation: ${num1} ${operator} ${num2}`
            };
        }

        calculationSteps.push({
            num1, 
            operator, 
            num2, 
            result
        });

        currentResult = result;
    }

    return {
        isValid: true,
        steps: calculationSteps
    };
}

/**
 * Checks if a path meets length requirements
 * @param {Array} path - User-selected path
 * @returns {boolean} Whether path meets length requirements
 */
export function isValidPathLength(path) {
    return path.length >= 30;
}

/**
 * Checks if path starts at the correct square
 * @param {number} cellIndex - First cell of the path
 * @param {Array} originalPath - Original generated path
 * @returns {boolean} Whether path starts at the correct square
 */
export function isStartSquare(cellIndex, originalPath) {
    const coord = [cellIndex % 10, Math.floor(cellIndex / 10)];
    return originalPath[0][0] === coord[0] && originalPath[0][1] === coord[1];
}

/**
 * Checks if path ends at the correct square
 * @param {number} cellIndex - Last cell of the path
 * @param {Array} originalPath - Original generated path
 * @returns {boolean} Whether path ends at the correct square
 */
export function isEndSquare(cellIndex, originalPath) {
    const coord = [cellIndex % 10, Math.floor(cellIndex / 10)];
    const lastPathCoord = originalPath[originalPath.length - 1];
    return lastPathCoord[0] === coord[0] && lastPathCoord[1] === coord[1];
}

/**
 * Provides detailed path validation
 * @param {Object} options - Validation options
 * @returns {Object} Comprehensive validation result
 */
export function validatePath(options) {
    const {
        userPath, 
        gridEntries, 
        originalPath
    } = options;

    // Get the grid entries for the user's selected path
    const userPathEntries = userPath.map(cellIndex => 
        gridEntries[cellIndex]
    );

    // Validate path length
    const isValidLength = isValidPathLength(userPathEntries);
    
    // Check start and end squares
    const startsAtStartSquare = isStartSquare(userPath[0], originalPath);
    const endsAtEndSquare = isEndSquare(
        userPath[userPath.length - 1], 
        originalPath
    );

    // Validate mathematical sequence
    const validationResult = validateMathematicalSequence(userPathEntries);

    return {
        ...validationResult,
        isValidLength,
        startsAtStartSquare,
        endsAtEndSquare,
        fullPath: userPathEntries
    };
}
