document.addEventListener('DOMContentLoaded', function() {
  const csvInput = document.getElementById('csvInput');
  const generateBtn = document.getElementById('generateBtn');
  const wordsearchDiv = document.getElementById('wordsearch');
  const crosswordDiv = document.getElementById('crossword');

  let wordsData = [];

  // Enable generate button only when file is selected
  csvInput.addEventListener('change', function(event) {
    if (event.target.files.length > 0) {
      generateBtn.disabled = false;
      parseCSV(event.target.files[0]);
    } else {
      generateBtn.disabled = true;
    }
  });

  // Parse CSV file
  function parseCSV(file) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        wordsData = results.data;
        console.log('Parsed CSV data:', wordsData);
      },
      error: function(error) {
        showError('Error parsing CSV: ' + error.message);
      }
    });
  }

  // Generate puzzles when button is clicked
  generateBtn.addEventListener('click', function() {
    if (wordsData.length === 0) {
      showError('Please select a valid CSV file with word data.');
      return;
    }

    generateWordSearch();
    generateCrossword();
  });

  // Generate Word Search
  function generateWordSearch() {
    wordsearchDiv.innerHTML = '';

    try {
      // Extract words from CSV data
      const words = wordsData.map(row => {
        // Support both 'word' and 'Word' column names
        return row.word || row.Word || row.WORD || '';
      }).filter(word => word.trim() !== '');

      if (words.length === 0) {
        showError('No valid words found in CSV. Please ensure there is a "word" column.');
        return;
      }

      // Create word search puzzle
      const puzzle = wordsearch(words, 15, 15);

      // Display the grid
      const table = document.createElement('table');
      puzzle.grid.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });

      wordsearchDiv.appendChild(table);

      // Display word list
      const wordListDiv = document.createElement('div');
      wordListDiv.className = 'word-list';
      wordListDiv.innerHTML = '<h3>Find these words:</h3>';
      const ul = document.createElement('ul');
      words.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word.toUpperCase();
        ul.appendChild(li);
      });
      wordListDiv.appendChild(ul);
      wordsearchDiv.appendChild(wordListDiv);

      console.log('Word search generated successfully');
    } catch (error) {
      console.error('Error generating word search:', error);
      showError('Error generating word search: ' + error.message);
    }
  }

  // Generate Crossword
  function generateCrossword() {
    crosswordDiv.innerHTML = '';

    try {
      // Prepare crossword input
      const crosswordInput = wordsData.map(row => {
        const word = row.word || row.Word || row.WORD || '';
        const clue = row.clue || row.Clue || row.CLUE || '';
        return {
          clue: clue,
          answer: word.toUpperCase()
        };
      }).filter(item => item.answer.trim() !== '' && item.clue.trim() !== '');

      if (crosswordInput.length === 0) {
        showError('No valid word/clue pairs found in CSV. Please ensure there are "word" and "clue" columns.');
        return;
      }

      // Generate crossword layout
      const layout = generateLayout(crosswordInput);

      if (!layout || !layout.result || layout.result.length === 0) {
        showError('Could not generate crossword layout. Try using different words or adding more words.');
        return;
      }

      // Display the crossword grid
      displayCrosswordGrid(layout);

      // Display clues
      displayClues(layout);

      console.log('Crossword generated successfully');
    } catch (error) {
      console.error('Error generating crossword:', error);
      showError('Error generating crossword: ' + error.message);
    }
  }

  // Display crossword grid
  function displayCrosswordGrid(layout) {
    const result = layout.result;
    
    // Calculate actual grid dimensions needed
    let maxRow = 0;
    let maxCol = 0;
    
    result.forEach(word => {
      const endRow = word.starty + (word.orientation === 'down' ? word.answer.length - 1 : 0);
      const endCol = word.startx + (word.orientation === 'across' ? word.answer.length - 1 : 0);
      maxRow = Math.max(maxRow, endRow);
      maxCol = Math.max(maxCol, endCol);
    });
    
    const rows = maxRow + 1;
    const cols = maxCol + 1;

    // Create grid
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));

    // Fill grid with letters
    result.forEach(word => {
      const row = word.starty;
      const col = word.startx;
      const answer = word.answer;

      for (let i = 0; i < answer.length; i++) {
        if (word.orientation === 'across') {
          grid[row][col + i] = {
            letter: answer[i],
            number: i === 0 ? word.position : null
          };
        } else {
          grid[row + i][col] = {
            letter: answer[i],
            number: i === 0 ? word.position : null
          };
        }
      }
    });

    // Create table
    const table = document.createElement('table');
    grid.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        if (cell === null) {
          td.className = 'empty';
        } else {
          td.className = 'filled';
          td.textContent = cell.letter;
          if (cell.number !== null) {
            const span = document.createElement('span');
            span.className = 'clue-number';
            span.textContent = cell.number;
            td.insertBefore(span, td.firstChild);
          }
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    crosswordDiv.appendChild(table);
  }

  // Display clues
  function displayClues(layout) {
    const result = layout.result;

    const acrossClues = result.filter(word => word.orientation === 'across')
      .sort((a, b) => a.position - b.position);
    const downClues = result.filter(word => word.orientation === 'down')
      .sort((a, b) => a.position - b.position);

    const cluesDiv = document.createElement('div');
    cluesDiv.className = 'clues';

    if (acrossClues.length > 0) {
      const acrossDiv = document.createElement('div');
      acrossDiv.innerHTML = '<h3>Across</h3>';
      const ol = document.createElement('ol');
      ol.start = acrossClues[0].position;
      acrossClues.forEach(word => {
        const li = document.createElement('li');
        li.value = word.position;
        li.textContent = word.clue;
        ol.appendChild(li);
      });
      acrossDiv.appendChild(ol);
      cluesDiv.appendChild(acrossDiv);
    }

    if (downClues.length > 0) {
      const downDiv = document.createElement('div');
      downDiv.innerHTML = '<h3>Down</h3>';
      const ol = document.createElement('ol');
      ol.start = downClues[0].position;
      downClues.forEach(word => {
        const li = document.createElement('li');
        li.value = word.position;
        li.textContent = word.clue;
        ol.appendChild(li);
      });
      downDiv.appendChild(ol);
      cluesDiv.appendChild(downDiv);
    }

    crosswordDiv.appendChild(cluesDiv);
  }

  // Show error message
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    // Show in both sections
    wordsearchDiv.innerHTML = '';
    wordsearchDiv.appendChild(errorDiv.cloneNode(true));
    
    crosswordDiv.innerHTML = '';
    crosswordDiv.appendChild(errorDiv);
  }

  // Initially disable the generate button
  generateBtn.disabled = true;
});
