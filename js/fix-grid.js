// Add this as a separate JavaScript file named "fix-grid.js"
// Then include it in your HTML with: <script src="fix-grid.js"></script>

(function() {
  console.error('🛠️ EMERGENCY GRID FIX - LOADING');
  
  // Function to ensure grid cells are clickable
  function fixGridCells() {
    // Get all grid cells
    const cells = document.querySelectorAll('.grid-cell');
    
    if (cells.length === 0) {
      console.error('No grid cells found yet, will retry...');
      return;
    }
    
    console.error(`Found ${cells.length} grid cells to fix`);
    
    // Fix each cell
    cells.forEach((cell, index) => {
      // Store the original cell index
      const cellIndex = cell.dataset.index;
      
      // Create a completely new cell element
      const newCell = document.createElement('div');
      newCell.className = cell.className;
      newCell.dataset.index = cellIndex;
      newCell.innerHTML = cell.innerHTML;
      
      // Apply crucial styles directly to the element
      newCell.style.cssText = `
        cursor: pointer !important;
        pointer-events: auto !important;
        position: relative !important;
        z-index: 1000 !important;
        background-color: ${cell.style.backgroundColor || 'white'};
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      `;
      
      // Add explicit styles for child elements
      Array.from(newCell.children).forEach(child => {
        child.style.pointerEvents = 'none !important';
      });
      
      // Direct click handler that bypasses event delegation completely
      newCell.onclick = function(e) {
        console.error(`DIRECT CLICK on cell ${cellIndex}`);
        e.stopPropagation();
        
        // Apply visual feedback
        const originalBackground = this.style.backgroundColor;
        this.style.backgroundColor = '#60a5fa';
        this.style.color = 'white';
        this.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        
        // Call the game controller directly - no event bubbling
        if (window._gameController && window._gameController.gridEventHandler) {
          try {
            window._gameController.gridEventHandler.handleCellClick(this);
          } catch (err) {
            console.error('Error in cell click:', err);
            // Restore appearance on error
            this.style.backgroundColor = originalBackground;
          }
        } else {
          console.error('Game controller not available');
        }
      };
      
      // Replace the original cell with our new one
      if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
        console.error(`Replaced cell ${cellIndex}`);
      }
    });
    
    console.error('✅ Grid cells fixed!');
  }
  
  // Function to fix game control buttons
  function fixGameControls() {
    const checkButton = document.getElementById('check-solution');
    const removeButton = document.getElementById('remove-spare');
    
    if (checkButton) {
      // Create a new button
      const newCheckButton = document.createElement('button');
      newCheckButton.id = 'check-solution';
      newCheckButton.innerHTML = checkButton.innerHTML;
      newCheckButton.style.cssText = `
        padding: 10px 20px !important;
        background-color: #3b82f6 !important;
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-size: 16px !important;
        font-weight: bold !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        pointer-events: auto !important;
        z-index: 5000 !important;
        position: relative !important;
      `;
      
      // Add direct click handler
      newCheckButton.onclick = function(e) {
        e.stopPropagation();
        console.error('Direct check solution button click');
        if (window._gameController) {
          window._gameController.checkSolution();
        }
      };
      
      // Replace original button
      if (checkButton.parentNode) {
        checkButton.parentNode.replaceChild(newCheckButton, checkButton);
      }
    }
    
    if (removeButton) {
      // Create a new button
      const newRemoveButton = document.createElement('button');
      newRemoveButton.id = 'remove-spare';
      newRemoveButton.innerHTML = removeButton.innerHTML;
      newRemoveButton.style.cssText = `
        padding: 10px 20px !important;
        background-color: #3b82f6 !important;
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-size: 16px !important;
        font-weight: bold !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        pointer-events: auto !important;
        z-index: 5000 !important;
        position: relative !important;
      `;
      
      // Add direct click handler
      newRemoveButton.onclick = function(e) {
        e.stopPropagation();
        console.error('Direct remove spare button click');
        if (window._gameController) {
          window._gameController.removeAllSpareCells();
        }
      };
      
      // Replace original button
      if (removeButton.parentNode) {
        removeButton.parentNode.replaceChild(newRemoveButton, removeButton);
      }
    }
    
    console.error('✅ Game controls fixed!');
  }
  
  // Function to patch GridEventHandler methods
  function patchGridEventHandler() {
    if (!window._gameController || !window._gameController.gridEventHandler) {
      console.error('Game controller or grid event handler not available yet');
      return false;
    }
    
    try {
      // Patch the updatePathDisplay method to ensure highlighting works
      const originalUpdatePathDisplay = window._gameController.gridEventHandler.updatePathDisplay;
      window._gameController.gridEventHandler.updatePathDisplay = function() {
        console.error('Patched updatePathDisplay called');
        
        // Call original method
        if (originalUpdatePathDisplay) {
          originalUpdatePathDisplay.call(window._gameController.gridEventHandler);
        }
        
        // Add extra path highlighting logic
        if (this.state && this.state.userPath) {
          this.state.userPath.forEach((cellIndex, index) => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) {
              // Apply direct styling for selected cells
              cell.style.backgroundColor = '#60a5fa';
              cell.style.color = 'white';
              cell.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.5)';
              cell.style.zIndex = '200';
              
              // Special styling for start and end
              if (index === 0) {
                cell.style.backgroundColor = 'darkgreen';
              }
              if (index === this.state.userPath.length - 1) {
                cell.style.backgroundColor = '#4f46e5';
              }
            }
          });
        }
      };
      
      console.error('✅ GridEventHandler methods patched!');
      return true;
    } catch (err) {
      console.error('Error patching GridEventHandler:', err);
      return false;
    }
  }
  
  // Create a small control panel
  function createControlPanel() {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      z-index: 10000;
    `;
    
    // Create fix grid button
    const fixGridButton = document.createElement('button');
    fixGridButton.textContent = '🔄 Fix Grid Cells';
    fixGridButton.style.cssText = `
      padding: 8px 12px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;
    fixGridButton.onclick = fixGridCells;
    panel.appendChild(fixGridButton);
    
    // Create fix controls button
    const fixControlsButton = document.createElement('button');
    fixControlsButton.textContent = '🔧 Fix Game Controls';
    fixControlsButton.style.cssText = `
      padding: 8px 12px;
      background-color: #10b981;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;
    fixControlsButton.onclick = fixGameControls;
    panel.appendChild(fixControlsButton);
    
    document.body.appendChild(panel);
  }
  
  // Main initialization function
  function initialize() {
    console.error('Initializing complete path puzzle fix');
    
    // Create control panel
    createControlPanel();
    
    // First attempt to fix grid cells
    setTimeout(fixGridCells, 1000);
    
    // Fix game controls
    setTimeout(fixGameControls, 1500);
    
    // Try to patch GridEventHandler
    let patchAttempts = 0;
    const patchInterval = setInterval(function() {
      if (patchGridEventHandler() || patchAttempts > 10) {
        clearInterval(patchInterval);
      }
      patchAttempts++;
    }, 1000);
    
    // Set up automatic fixes after level changes
    document.addEventListener('click', function(e) {
      if (e.target.closest('.level-btn')) {
        console.error('Level button clicked, scheduling fixes');
        setTimeout(fixGridCells, 1000);
        setTimeout(fixGameControls, 1500);
      }
    }, true);
    
    // Set up MutationObserver to watch for grid changes
    const observer = new MutationObserver(function(mutations) {
      for (let mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const gridUpdated = Array.from(mutation.addedNodes).some(node => 
            node.classList && node.classList.contains('grid-cell')
          );
          
          if (gridUpdated) {
            console.error('Grid cells added, applying fix');
            setTimeout(fixGridCells, 500);
          }
        }
      }
    });
    
    // Start observing the grid container
    setTimeout(function() {
      const gridContainer = document.getElementById('grid-container');
      if (gridContainer) {
        observer.observe(gridContainer, { childList: true, subtree: true });
        console.error('Grid observer started');
      }
    }, 2000);
  }
  
  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
