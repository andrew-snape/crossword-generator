document.getElementById("generateBtn").addEventListener("click", () => {
  const file = document.getElementById("csvInput").files[0];
  if (!file) return alert("Upload a CSV first.");

  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCSV(reader.result);
    const clues = rows.map(r => r.Question);
    const answers = rows.map(r => r.Answer.toUpperCase());

    const ws = makeWordSearch(answers, 15, 15);
    renderWordSearch(ws);

    const cw = makeCrossword(answers);
    renderCrossword(cw);
  };
  reader.readAsText(file);
});


// ----------------------------
// 1. PURE JS CSV PARSER
// ----------------------------
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");

  return lines.slice(1).map(line => {
    const parts = line.split(",");
    let obj = {};
    header.forEach((h, i) => obj[h.trim()] = (parts[i] || "").trim());
    return obj;
  });
}


// ----------------------------
// 2. WORD SEARCH GENERATOR
// ----------------------------
function makeWordSearch(words, rows, cols) {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    )
  );

  const directions = [
    [1,0], [-1,0], [0,1], [0,-1],  // horizontal & vertical
    [1,1], [-1,-1], [1,-1], [-1,1] // diagonals
  ];

  for (let word of words) {
    let placed = false;

    for (let attempts = 0; attempts < 200 && !placed; attempts++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      if (placeWord(grid, word, row, col, dir[0], dir[1])) placed = true;
    }
  }

  return grid;
}

function placeWord(grid, word, r, c, dr, dc) {
  for (let i = 0; i < word.length; i++) {
    const rr = r + dr * i;
    const cc = c + dc * i;

    if (rr < 0 || rr >= grid.length) return false;
    if (cc < 0 || cc >= grid[0].length) return false;
  }

  for (let i = 0; i < word.length; i++) {
    const rr = r + dr * i;
    const cc = c + dc * i;
    grid[rr][cc] = word[i];
  }

  return true;
}

function renderWordSearch(grid) {
  const table = document.getElementById("wordsearch");
  table.innerHTML = "";
  grid.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}


// ----------------------------
// 3. SIMPLE CROSSWORD GENERATOR
//    - Places words in a vertical list with overlaps where possible
// ----------------------------
function makeCrossword(words) {
  const size = 20;
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );

  let row = 1;

  for (let word of words) {
    let col = 1;

    // Try to overlap with previous word(s)
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        for (let i = 0; i < word.length; i++) {
          if (grid[r][c] === word[i]) {
            // Try vertical placement
            if (r - i >= 0 && r - i + word.length < size) {
              if (canPlaceVertical(grid, word, r - i, c)) {
                placeVertical(grid, word, r - i, c);
                col = c;
                r = size; // break
                break;
              }
            }
          }
        }
      }
    }

    // If no overlap found, place at next row
    if (!grid[row].includes(word[0])) {
      placeHorizontal(grid, word, row, col);
      row += 2;
    }
  }

  return grid;
}

function canPlaceVertical(grid, word, r, c) {
  for (let i = 0; i < word.length; i++) {
    if (grid[r+i][c] !== null && grid[r+i][c] !== word[i]) return false;
  }
  return true;
}

function placeVertical(grid, word, r, c) {
  for (let i = 0; i < word.length; i++)
    grid[r+i][c] = word[i];
}

function placeHorizontal(grid, word, r, c) {
  for (let i = 0; i < word.length; i++)
    grid[r][c+i] = word[i];
}

function renderCrossword(grid) {
  const div = document.getElementById("crossword");
  div.innerHTML = "";

  grid.forEach(row => {
    const rDiv = document.createElement("div");
    rDiv.className = "cw-row";

    row.forEach(cell => {
      const cDiv = document.createElement("div");
      cDiv.className = "cw-cell";
      if (cell === null) cDiv.classList.add("blank");
      else cDiv.textContent = cell;
      rDiv.appendChild(cDiv);
    });

    div.appendChild(rDiv);
  });
}
