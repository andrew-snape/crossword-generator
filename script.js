// Crossword Generator Script

class CrosswordGenerator {
    constructor() {
        this.words = [];
        this.grid = [];
        this.gridSize = 0;
        this.placedWords = [];
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const words = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const commaIndex = line.indexOf(',');
            if (commaIndex === -1) continue;
            
            const word = line.substring(0, commaIndex).trim().toUpperCase();
            const clue = line.substring(commaIndex + 1).trim();
            
            if (word && clue && /^[A-Z]+$/.test(word)) {
                words.push({ word, clue });
            }
        }
        
        return words;
    }

    generate(words) {
        this.words = words.sort((a, b) => b.word.length - a.word.length);
        
        if (this.words.length === 0) {
            throw new Error('No valid words found');
        }

        // Calculate grid size based on longest word
        const maxLength = Math.max(...this.words.map(w => w.word.length));
        this.gridSize = Math.max(15, maxLength + 5);
        
        // Initialize empty grid
        this.grid = Array(this.gridSize).fill(null).map(() => 
            Array(this.gridSize).fill(null)
        );
        
        this.placedWords = [];
        
        // Place first word horizontally in the middle
        const firstWord = this.words[0];
        const startRow = Math.floor(this.gridSize / 2);
        const startCol = Math.floor((this.gridSize - firstWord.word.length) / 2);
        
        this.placeWord(firstWord, startRow, startCol, true);
        
        // Try to place remaining words
        for (let i = 1; i < this.words.length; i++) {
            this.tryPlaceWord(this.words[i]);
        }
        
        return this.buildPuzzleData();
    }

    placeWord(wordObj, row, col, horizontal) {
        const word = wordObj.word;
        const placement = {
            word: word,
            clue: wordObj.clue,
            row: row,
            col: col,
            horizontal: horizontal,
            number: this.placedWords.length + 1
        };
        
        for (let i = 0; i < word.length; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            
            if (this.grid[r][c]) {
                // Cell already exists (intersection), append word number
                this.grid[r][c].wordNumbers.push(placement.number);
            } else {
                // New cell
                this.grid[r][c] = {
                    letter: word[i],
                    wordNumbers: [placement.number]
                };
            }
        }
        
        this.placedWords.push(placement);
    }

    tryPlaceWord(wordObj) {
        const word = wordObj.word;
        const placements = [];
        
        // Find all possible placements by looking for intersections
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    const letter = this.grid[row][col].letter;
                    
                    // Check if word contains this letter
                    for (let i = 0; i < word.length; i++) {
                        if (word[i] === letter) {
                            // Try horizontal placement
                            const hCol = col - i;
                            if (this.canPlaceWord(word, row, hCol, true)) {
                                placements.push({ row, col: hCol, horizontal: true, score: this.scorePosition(row, hCol) });
                            }
                            
                            // Try vertical placement
                            const vRow = row - i;
                            if (this.canPlaceWord(word, vRow, col, false)) {
                                placements.push({ row: vRow, col, horizontal: false, score: this.scorePosition(vRow, col) });
                            }
                        }
                    }
                }
            }
        }
        
        if (placements.length > 0) {
            // Choose placement with best score (closest to center)
            placements.sort((a, b) => a.score - b.score);
            const best = placements[0];
            this.placeWord(wordObj, best.row, best.col, best.horizontal);
            return true;
        }
        
        return false;
    }

    canPlaceWord(word, row, col, horizontal) {
        // Check bounds
        if (horizontal) {
            if (col < 0 || col + word.length > this.gridSize) return false;
            if (row < 0 || row >= this.gridSize) return false;
        } else {
            if (row < 0 || row + word.length > this.gridSize) return false;
            if (col < 0 || col >= this.gridSize) return false;
        }
        
        // Check each position
        for (let i = 0; i < word.length; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            
            if (this.grid[r][c]) {
                // Cell occupied - must match
                if (this.grid[r][c].letter !== word[i]) {
                    return false;
                }
            } else {
                // Cell empty - check adjacent cells
                if (horizontal) {
                    if (r > 0 && this.grid[r - 1][c]) return false;
                    if (r < this.gridSize - 1 && this.grid[r + 1][c]) return false;
                } else {
                    if (c > 0 && this.grid[r][c - 1]) return false;
                    if (c < this.gridSize - 1 && this.grid[r][c + 1]) return false;
                }
            }
        }
        
        // Check cells before and after
        if (horizontal) {
            if (col > 0 && this.grid[row][col - 1]) return false;
            if (col + word.length < this.gridSize && this.grid[row][col + word.length]) return false;
        } else {
            if (row > 0 && this.grid[row - 1][col]) return false;
            if (row + word.length < this.gridSize && this.grid[row + word.length][col]) return false;
        }
        
        return true;
    }

    scorePosition(row, col) {
        const center = this.gridSize / 2;
        return Math.abs(row - center) + Math.abs(col - center);
    }

    buildPuzzleData() {
        // Find the actual bounds of the puzzle
        let minRow = this.gridSize, maxRow = 0, minCol = this.gridSize, maxCol = 0;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    minRow = Math.min(minRow, row);
                    maxRow = Math.max(maxRow, row);
                    minCol = Math.min(minCol, col);
                    maxCol = Math.max(maxCol, col);
                }
            }
        }
        
        // Add padding
        minRow = Math.max(0, minRow - 1);
        maxRow = Math.min(this.gridSize - 1, maxRow + 1);
        minCol = Math.max(0, minCol - 1);
        maxCol = Math.min(this.gridSize - 1, maxCol + 1);
        
        const height = maxRow - minRow + 1;
        const width = maxCol - minCol + 1;
        
        // Create trimmed grid
        const trimmedGrid = Array(height).fill(null).map(() => Array(width).fill(null));
        
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const cell = this.grid[minRow + row][minCol + col];
                if (cell) {
                    trimmedGrid[row][col] = { ...cell };
                }
            }
        }
        
        // Adjust placements
        const adjustedPlacements = this.placedWords.map(p => ({
            ...p,
            row: p.row - minRow,
            col: p.col - minCol
        }));
        
        return {
            grid: trimmedGrid,
            placements: adjustedPlacements,
            width: width,
            height: height
        };
    }
}

// UI Controller
class CrosswordUI {
    constructor() {
        this.generator = new CrosswordGenerator();
        this.currentPuzzle = null;
        this.userAnswers = [];
        
        this.initElements();
        this.attachEventListeners();
    }

    initElements() {
        this.fileInput = document.getElementById('csvFile');
        this.generateBtn = document.getElementById('generateBtn');
        this.checkBtn = document.getElementById('checkBtn');
        this.revealBtn = document.getElementById('revealBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.newPuzzleBtn = document.getElementById('newPuzzleBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.loadingMessage = document.getElementById('loadingMessage');
        this.puzzleContainer = document.getElementById('puzzleContainer');
        this.crosswordGrid = document.getElementById('crosswordGrid');
        this.acrossClues = document.getElementById('acrossClues');
        this.downClues = document.getElementById('downClues');
    }

    attachEventListeners() {
        this.fileInput.addEventListener('change', () => this.handleFileSelect());
        this.generateBtn.addEventListener('click', () => this.generatePuzzle());
        this.checkBtn.addEventListener('click', () => this.checkAnswers());
        this.revealBtn.addEventListener('click', () => this.revealAnswers());
        this.clearBtn.addEventListener('click', () => this.clearAnswers());
        this.newPuzzleBtn.addEventListener('click', () => this.resetUI());
    }

    handleFileSelect() {
        this.generateBtn.disabled = !this.fileInput.files.length;
        this.hideError();
    }

    async generatePuzzle() {
        const file = this.fileInput.files[0];
        if (!file) return;

        this.showLoading();
        this.hideError();

        try {
            const text = await this.readFile(file);
            const words = this.generator.parseCSV(text);
            
            if (words.length === 0) {
                throw new Error('No valid words found in CSV file');
            }

            this.currentPuzzle = this.generator.generate(words);
            this.renderPuzzle();
            this.enableButtons();
            this.hideLoading();
        } catch (error) {
            this.showError(error.message);
            this.hideLoading();
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    renderPuzzle() {
        this.renderGrid();
        this.renderClues();
        this.puzzleContainer.style.display = 'block';
    }

    renderGrid() {
        this.crosswordGrid.innerHTML = '';
        this.userAnswers = Array(this.currentPuzzle.height).fill(null).map(() => 
            Array(this.currentPuzzle.width).fill('')
        );

        const gridElement = document.createElement('div');
        gridElement.style.display = 'grid';
        gridElement.style.gridTemplateColumns = `repeat(${this.currentPuzzle.width}, 40px)`;
        gridElement.style.gap = '0';

        for (let row = 0; row < this.currentPuzzle.height; row++) {
            for (let col = 0; col < this.currentPuzzle.width; col++) {
                const cell = this.currentPuzzle.grid[row][col];
                const cellDiv = document.createElement('div');
                cellDiv.className = 'cell';

                if (cell) {
                    cellDiv.classList.add('active-cell');
                    
                    // Add number label if this is the start of a word
                    const wordStarts = this.currentPuzzle.placements.filter(p => 
                        p.row === row && p.col === col
                    );
                    
                    if (wordStarts.length > 0) {
                        const numberLabel = document.createElement('span');
                        numberLabel.className = 'cell-number';
                        numberLabel.textContent = wordStarts[0].number;
                        cellDiv.appendChild(numberLabel);
                    }

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.className = 'cell-input';
                    input.dataset.row = row;
                    input.dataset.col = col;
                    input.dataset.answer = cell.letter;
                    
                    input.addEventListener('input', (e) => this.handleInput(e));
                    input.addEventListener('keydown', (e) => this.handleKeydown(e));
                    
                    cellDiv.appendChild(input);
                } else {
                    cellDiv.classList.add('blocked-cell');
                }

                gridElement.appendChild(cellDiv);
            }
        }

        this.crosswordGrid.appendChild(gridElement);
    }

    renderClues() {
        const across = this.currentPuzzle.placements.filter(p => p.horizontal);
        const down = this.currentPuzzle.placements.filter(p => !p.horizontal);

        this.acrossClues.innerHTML = across.map(p => 
            `<li value="${p.number}">${p.clue}</li>`
        ).join('');

        this.downClues.innerHTML = down.map(p => 
            `<li value="${p.number}">${p.clue}</li>`
        ).join('');
    }

    handleInput(e) {
        const input = e.target;
        const value = input.value.toUpperCase();
        
        if (value && /^[A-Z]$/.test(value)) {
            input.value = value;
            this.userAnswers[input.dataset.row][input.dataset.col] = value;
            this.moveToNext(input);
        } else {
            input.value = '';
        }
    }

    handleKeydown(e) {
        const input = e.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);

        if (e.key === 'Backspace' && !input.value) {
            e.preventDefault();
            this.moveToPrev(input);
        } else if (e.key === 'ArrowRight') {
            this.moveRight(row, col);
        } else if (e.key === 'ArrowLeft') {
            this.moveLeft(row, col);
        } else if (e.key === 'ArrowDown') {
            this.moveDown(row, col);
        } else if (e.key === 'ArrowUp') {
            this.moveUp(row, col);
        }
    }

    moveToNext(current) {
        const inputs = Array.from(this.crosswordGrid.querySelectorAll('.cell-input'));
        const currentIndex = inputs.indexOf(current);
        if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        }
    }

    moveToPrev(current) {
        const inputs = Array.from(this.crosswordGrid.querySelectorAll('.cell-input'));
        const currentIndex = inputs.indexOf(current);
        if (currentIndex > 0) {
            inputs[currentIndex - 1].focus();
        }
    }

    moveRight(row, col) {
        const nextInput = this.crosswordGrid.querySelector(`input[data-row="${row}"][data-col="${col + 1}"]`);
        if (nextInput) nextInput.focus();
    }

    moveLeft(row, col) {
        const prevInput = this.crosswordGrid.querySelector(`input[data-row="${row}"][data-col="${col - 1}"]`);
        if (prevInput) prevInput.focus();
    }

    moveDown(row, col) {
        const nextInput = this.crosswordGrid.querySelector(`input[data-row="${row + 1}"][data-col="${col}"]`);
        if (nextInput) nextInput.focus();
    }

    moveUp(row, col) {
        const prevInput = this.crosswordGrid.querySelector(`input[data-row="${row - 1}"][data-col="${col}"]`);
        if (prevInput) prevInput.focus();
    }

    checkAnswers() {
        const inputs = this.crosswordGrid.querySelectorAll('.cell-input');
        let correct = 0;
        let total = 0;

        inputs.forEach(input => {
            total++;
            input.classList.remove('correct', 'incorrect');
            
            if (input.value.toUpperCase() === input.dataset.answer) {
                input.classList.add('correct');
                correct++;
            } else if (input.value) {
                input.classList.add('incorrect');
            }
        });

        if (correct === total) {
            this.showError('Congratulations! All answers are correct!', 'success');
        } else {
            this.showError(`${correct} out of ${total} correct`, 'info');
        }
    }

    revealAnswers() {
        const inputs = this.crosswordGrid.querySelectorAll('.cell-input');
        inputs.forEach(input => {
            input.value = input.dataset.answer;
            input.classList.remove('incorrect');
            input.classList.add('correct');
        });
    }

    clearAnswers() {
        const inputs = this.crosswordGrid.querySelectorAll('.cell-input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'incorrect');
        });
        this.hideError();
    }

    resetUI() {
        this.fileInput.value = '';
        this.generateBtn.disabled = true;
        this.puzzleContainer.style.display = 'none';
        this.disableButtons();
        this.hideError();
        this.currentPuzzle = null;
    }

    enableButtons() {
        this.checkBtn.disabled = false;
        this.revealBtn.disabled = false;
        this.clearBtn.disabled = false;
    }

    disableButtons() {
        this.checkBtn.disabled = true;
        this.revealBtn.disabled = true;
        this.clearBtn.disabled = true;
    }

    showError(message, type = 'error') {
        this.errorMessage.textContent = message;
        this.errorMessage.className = `error-message ${type}`;
        this.errorMessage.style.display = 'block';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    showLoading() {
        this.loadingMessage.style.display = 'block';
    }

    hideLoading() {
        this.loadingMessage.style.display = 'none';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CrosswordUI();
});
