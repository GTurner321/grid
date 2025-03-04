// pathValidator.js

/**
 * Converts various input types to a consistent numeric representation
 * @param {string|number} val - Value to convert
 * @returns {number} Converted numeric value
 */
function convertToNumber(val) {
    console.log('Converting value:', val, 'Type:', typeof val);
    
    // Handle fractions
    if (typeof val === 'string' && val.includes('/')) {
        const [numerator, denominator] = val.split('/').map(Number);
        console.log('Fraction conversion:', numerator, '/', denominator);
        return numerator / denominator;
    }
    
    // Handle other numeric values
    const convertedValue = Number(val);
    console.log('Converted value:', convertedValue);
    
    return convertedValue;
}

// When getting cell values, use the dataset value if available
function getCellValue(cell) {
    console.log('Getting cell value:', cell);

    // If cell is a DOM element
    if (cell instanceof HTMLElement) {
        // First, check dataset value
        if (cell.dataset.value) {
            console.log('Using dataset value:', cell.dataset.value);
            return cell.dataset.value;
        }
        
        // Then check textContent
        if (cell.textContent) {
            console.log('Using textContent:', cell.textContent);
            return cell.textContent;
        }
    }

    // If cell is an object with a value property
    if (cell && cell.value !== undefined) {
        console.log('Using object value:', cell.value);
        return cell.value;
    }

    // If cell is an object with type 'number'
    if (cell && cell.type === 'number') {
        console.log('Using number value:', cell.value);
        return cell.value;
    }

    console.warn('Unable to extract value from cell', cell);
    return null;
}

/**
 * Performs a mathematical calculation step
 * @param {string|number} num1 - First number
 * @param {string} operator - Mathematical operator
 * @param {string|number} num2 - Second number
 * @returns {number|null} Result of calculation or null if invalid
 */
function calculateStep(num1, operator, num2) {
    console.log('Calculate Step Input:', { num1, operator, num2 });
    
    try {
        const a = convertToNumber(num1);
        const b = convertToNumber(num2);

        console.log('Converted values:', { a, b });

        switch(operator) {
            case '+': return a + b;
            case '-': return a - b;
            case 'x': return a * b;
            case '/': 
                // Prevent division by zero
                return b !== 0 ? a / b : null;
            default: 
                console.warn('Invalid operator:', operator);
                return null;
        }
    } catch (error) {
        console.error('Error in calculateStep:', error);
        return null;
    }
}

/**
 * Validates a mathematical sequence of path entries
 * @param {Array} pathEntries - Array of grid entries representing the path
 * @returns {Object} Validation result
 */

export function validateMathematicalSequence(pathEntries) {
    console.log('Full path entries:', pathEntries);
    const calculationSteps = [];
    let currentResult = null;

    for (let i = 0; i < pathEntries.length; i += 3) {
        // Ensure we have enough entries to form a complete calculation
        if (i + 2 >= pathEntries.length) break;

        console.log(`Processing step ${i/3}:`, {
            num1: pathEntries[i],
            operator: pathEntries[i + 1],
            num2: pathEntries[i + 2]
        });

        const num1 = currentResult !== null ? currentResult : getCellValue(pathEntries[i]);
        const operator = pathEntries[i + 1].value || pathEntries[i + 1];
        const num2 = getCellValue(pathEntries[i + 2]);

        console.log('Extracted values:', { num1, operator, num2 });

        const result = calculateStep(num1, operator, num2);

        console.log('Calculation result:', result);

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
