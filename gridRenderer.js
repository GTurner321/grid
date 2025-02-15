<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Math Path Game</title>
    
    <style>
        /* Core styles */
        body {
            margin: 0;
            padding: 20px;
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #f0f2f5;
        }
        
        .game-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* Grid styles */
        #grid-container {
            display: grid;
            grid-template-columns: repeat(10, minmax(40px, 1fr));
            gap: 2px;
            background-color: #cbd5e1;
            padding: 2px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .grid-cell {
            aspect-ratio: 1;
            background-color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            cursor: pointer;
            transition: background-color 0.2s;
            user-select: none;
        }
        
        .grid-cell:hover {
            background-color: #e5e7eb;
        }
        
        .grid-cell.selected {
            background-color: #93c5fd;
            color: #1e40af;
        }
        
        .grid-cell.number {
            font-weight: bold;
        }
        
        .grid-cell.operator {
            color: #dc2626;
        }
        
        /* Control styles */
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        button {
            padding: 10px 20px;
            font-size: 1rem;
            border: none;
            background-color: #2563eb;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .level-btn {
            background-color: #4b5563;
        }
        
        .level-btn.active {
            background-color: #2563eb;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1>Math Path Game</h1>
        
        <!-- Level selection -->
        <div class="controls">
            <button class="level-btn" data-level="1">Level 1</button>
            <button class="level-btn" data-level="2">Level 2</button>
            <button class="level-btn" data-level="3">Level 3</button>
            <button class="level-btn" data-level="4">Level 4</button>
            <button class="level-btn" data-level="5">Level 5</button>
        </div>
        
        <!-- Grid container -->
        <div id="grid-container"></div>
        
        <!-- Game controls -->
        <div class="controls">
            <button id="check-solution" disabled>Check Solution</button>
            <button id="remove-spare" disabled>Remove Spare (-5 points)</button>
            <div class="score">Score: <span id="score">0</span></div>
        </div>
        
        <!-- Game messages -->
        <div id="game-messages"></div>
    </div>
    
    <!-- Module scripts -->
    <script type="module" src="js/pathGenerator.js"></script>
    <script type="module" src="js/sequenceGenerator.js"></script>
    <script type="module" src="js/gridRenderer.js"></script>
    <script type="module" src="js/gameLogic.js"></script>
</body>
</html>
