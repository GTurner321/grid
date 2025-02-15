// Constants for grid configuration
const GRID_SIZE = 10;
const MIN_PATH_LENGTH = 34;
const MAX_PATH_LENGTH = 100;

/**
 * Checks if coordinates represent a corner position
 * @param {number[]} coord - [x, y] coordinates
 * @returns {boolean}
 */
const isCorner = ([x, y]) => {
    return (x === 0 || x === GRID_SIZE - 1) && (y === 0 || y === GRID_SIZE - 1);
};

/**
 * Checks if path length meets the game requirements (3n + 1 and >= 34)
 * @param {number} length - Length of the path
 * @returns {boolean}
 */
const isValidLength = (length) => {
    if (length < MIN_PATH_LENGTH || length > MAX_PATH_LENGTH) return false;
    return (length - 1) % 3 === 0;
};

/**
 * Gets a random starting position within the inner grid (1-8, 1-8)
 * @returns {number[]} [x, y] coordinates
 */
const getRandomStart = () => {
    const x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    const y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    return [x, y];
};

/**
 * Gets valid moves from current position that haven't been visited
 * @param {number[]} current - Current [x, y] position
 * @param {number[][]} visited - Array of visited positions
 * @returns {number[][]} Array of valid next positions
 */
const getValidMoves = (current, visited) => {
    const [x, y] = current;
    const possibleMoves = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
    ];
    
    return possibleMoves.filter(([newX, newY]) => {
        // Check if move is within grid
        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return false;
        
        // Check if position has been visited
        return !visited.some(([visitedX, visitedY]) => 
            visitedX === newX && visitedY === newY
        );
    });
};

/**
 * Finds a valid path using depth-first search
 * @param {number[]} start - Starting coordinates
 * @returns {number[][]|null} Array of coordinates forming the path, or null if no valid path found
 */
const findPath = (start) => {
    const visited = [start];
    
    const dfs = (current) => {
        // Check if we've reached a corner with valid length
        if (isCorner(current) && isValidLength(visited.length)) {
            return true;
        }
        
        // If we've reached a corner but length is invalid, or exceeded max length, backtrack
        if (isCorner(current) || visited.length >= MAX_PATH_LENGTH) {
            return false;
        }
        
        const validMoves = getValidMoves(current, visited);
        
        // Shuffle valid moves for randomness
        for (let i = validMoves.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validMoves[i], validMoves[j]] = [validMoves[j], validMoves[i]];
        }
        
        for (const move of validMoves) {
            visited.push(move);
            if (dfs(move)) {
                return true;
            }
            visited.pop();
        }
        
        return false;
    };
    
    if (dfs(start)) {
        return visited;
    }
    return null;
};

/**
 * Generates a valid path through the grid
 * @returns {Promise<number[][]>} Array of coordinates forming the path
 */
export const generatePath = async () => {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 1000;
        
        const attempt = () => {
            attempts++;
            const start = getRandomStart();
            const path = findPath(start);
            
            if (path) {
                resolve(path);
            } else if (attempts >= maxAttempts) {
                reject(new Error('Failed to generate valid path after maximum attempts'));
            } else {
                // Use setTimeout to prevent call stack overflow and allow UI updates
                setTimeout(attempt, 0);
            }
        };
        
        attempt();
    });
};

/**
 * Validates if a sequence of coordinates forms a valid path
 * @param {number[][]} path - Array of [x, y] coordinates
 * @returns {boolean}
 */
export const validatePath = (path) => {
    if (!isValidLength(path.length)) return false;
    if (!isCorner(path[path.length - 1])) return false;
    
    // Check each step is adjacent
    for (let i = 1; i < path.length; i++) {
        const [prevX, prevY] = path[i - 1];
        const [currX, currY] = path[i];
        const dx = Math.abs(currX - prevX);
        const dy = Math.abs(currY - prevY);
        if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
            return false;
        }
    }
    
    // Check for revisits
    const visited = new Set(path.map(([x, y]) => `${x},${y}`));
    return visited.size === path.length;
};

export const getGridSize = () => GRID_SIZE;
export const getMinPathLength = () => MIN_PATH_LENGTH;
export const getMaxPathLength = () => MAX_PATH_LENGTH;
