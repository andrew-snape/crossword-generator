# Crossword Generator

A web-based crossword puzzle generator that creates interactive crossword puzzles from CSV files containing words and clues.

## Features

- **CSV Parsing**: Upload CSV files with word-clue pairs
- **Smart Puzzle Generation**: Automatically arranges words to create valid crossword puzzles with intersections
- **Interactive Grid**: Click and type to fill in answers
- **Keyboard Navigation**: Use arrow keys to move between cells
- **Answer Checking**: Validate your answers with visual feedback (green for correct, red for incorrect)
- **Reveal Answers**: Show all solutions
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. Open `index.html` in a web browser
2. Click "Choose CSV File" to upload your word list
3. Click "Generate Crossword" to create the puzzle
4. Fill in the crossword by clicking cells and typing letters
5. Use the action buttons:
   - **Check Answers**: Validate your entries
   - **Reveal Answers**: Show all solutions
   - **Clear**: Reset your entries
   - **New Puzzle**: Start over with a different file

## CSV Format

Create a CSV file with one word-clue pair per line:
```
WORD,Clue for the word
EXAMPLE,A representative form or pattern
PUZZLE,A game that tests ingenuity
```

**Requirements:**
- Words must contain only letters (A-Z)
- Each line should have format: `word,clue`
- Words are case-insensitive (automatically converted to uppercase)

## Files

- **index.html**: Main webpage with UI elements
- **script.js**: Crossword generation algorithm and UI controller
- **style.css**: Styling and responsive design
- **sample.csv**: Example word list for testing

## Technical Details

### CrosswordGenerator Class
- Parses CSV input
- Implements word placement algorithm that finds optimal intersections
- Handles grid sizing and trimming
- Tracks word placements and numbering

### CrosswordUI Class
- Manages file upload and user interactions
- Renders the crossword grid with numbered cells
- Handles keyboard input and navigation
- Provides answer validation and reveal functionality

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- FileReader API

## License

Open source - feel free to use and modify!