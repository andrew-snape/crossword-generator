// Simple Word Search Generator
(function(global) {
  'use strict';

  function wordsearch(words, width, height) {
    const grid = [];
    const placed = [];
    
    // Initialize empty grid
    for (let i = 0; i < height; i++) {
      grid[i] = [];
      for (let j = 0; j < width; j++) {
        grid[i][j] = '';
      }
    }

    // Directions: right, down, diagonal down-right
    const directions = [
      { dx: 1, dy: 0 },   // horizontal
      { dx: 0, dy: 1 },   // vertical
      { dx: 1, dy: 1 },   // diagonal down-right
    ];

    // Try to place each word
    words.forEach(word => {
      const w = word.toUpperCase();
      let placed_word = false;
      let attempts = 0;
      
      while (!placed_word && attempts < 100) {
        attempts++;
        
        // Random starting position
        const startX = Math.floor(Math.random() * width);
        const startY = Math.floor(Math.random() * height);
        
        // Random direction
        const dir = directions[Math.floor(Math.random() * directions.length)];
        
        // Check if word fits
        if (canPlaceWord(grid, w, startX, startY, dir.dx, dir.dy, width, height)) {
          placeWord(grid, w, startX, startY, dir.dx, dir.dy);
          placed.push({ word: w, x: startX, y: startY, dx: dir.dx, dy: dir.dy });
          placed_word = true;
        }
      }
    });

    // Fill empty cells with random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    return {
      grid: grid,
      placed: placed
    };
  }

  function canPlaceWord(grid, word, startX, startY, dx, dy, width, height) {
    // Check if word fits within bounds
    const endX = startX + (word.length - 1) * dx;
    const endY = startY + (word.length - 1) * dy;
    
    if (endX < 0 || endX >= width || endY < 0 || endY >= height) {
      return false;
    }

    // Check if cells are empty or match
    for (let i = 0; i < word.length; i++) {
      const x = startX + i * dx;
      const y = startY + i * dy;
      
      if (grid[y][x] !== '' && grid[y][x] !== word[i]) {
        return false;
      }
    }

    return true;
  }

  function placeWord(grid, word, startX, startY, dx, dy) {
    for (let i = 0; i < word.length; i++) {
      const x = startX + i * dx;
      const y = startY + i * dy;
      grid[y][x] = word[i];
    }
  }

  // Export to global scope
  global.wordsearch = wordsearch;

})(typeof window !== 'undefined' ? window : this);
