document.getElementById("generateBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("csvInput").files[0];
  if (!fileInput) return alert("Upload a CSV first.");

  Papa.parse(fileInput, {
    header: true,
    complete: (results) => {
      const data = results.data;

      const clues = data.map(row => row.Question);
      const answers = data.map(row => row.Answer.toUpperCase());

      generateWordSearch(answers);
      generateCrossword(clues, answers);
    }
  });
});

function generateWordSearch(words) {
  const puzzle = WordSearch.generate(words);
  document.getElementById("wordsearch").innerHTML =
    WordSearch.render(puzzle);
}

function generateCrossword(clues, answers) {
  const layout = cwLayout.generateLayout(answers);

  let html = "";
  layout.table.forEach(row => {
    html += "<div class='cw-row'>";
    row.forEach(cell => {
      if (cell === null) html += "<div class='cw-cell blank'></div>";
      else html += `<div class="cw-cell">${cell}</div>`;
    });
    html += "</div>";
  });

  document.getElementById("crossword").innerHTML = html;
}
