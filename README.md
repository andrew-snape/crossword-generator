# crossword-generator

A web-based application that generates both Word Search and Crossword puzzles from CSV input files.

## Features

- **Word Search Generator**: Creates a 15x15 grid with hidden words placed horizontally, vertically, and diagonally
- **Crossword Generator**: Creates an interactive crossword puzzle with numbered clues
- **CSV Input**: Simple CSV format with words and clues
- **No Dependencies**: All libraries are included locally (no CDN required)

## Usage

1. Open `index.html` in a web browser
2. Click "Choose File" and select a CSV file
3. Click "Generate" to create both puzzles

## CSV Format

The CSV file should have two columns:
- `word`: The word to include in the puzzles
- `clue`: The clue for the crossword (optional for word search only)

Example:
```csv
word,clue
PYTHON,A popular programming language
JAVASCRIPT,Scripting language for web browsers
HTML,Markup language for web pages
CSS,Style sheet language
```

See `sample.csv` for a complete example.

## Running Locally

Simply open `index.html` in any modern web browser. No build process or server is required.

For development with live reload, you can use:
```bash
python3 -m http.server 8000
```

Then navigate to `http://localhost:8000/`

## Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Styling and layout
- **JavaScript (ES6)**: Core functionality
- **PapaParse**: CSV parsing library
- **Crossword Layout Generator**: Algorithm for crossword layout
- **Custom Word Search**: Simple word search puzzle generator

## License

MIT