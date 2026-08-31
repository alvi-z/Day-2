/* =====================================================
   PAGE NAVIGATION
===================================================== */

function goToPage(pageNumber) {
  const pages = document.querySelectorAll(".page");

  pages.forEach(function(page) {
    page.classList.add("hidden");
  });

  const selectedPage = document.getElementById("page" + pageNumber);

  if (selectedPage) {
    selectedPage.classList.remove("hidden");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =====================================================
   WORD SEARCH
===================================================== */

/*
   The five hidden words are:

   I
   LOVE
   YOU
   SO
   MUCH

   The words are deliberately placed in different
   directions so the puzzle feels like a real
   word search.
*/

const gridLetters = [
  ["Q", "R", "A", "T", "M", "P", "L", "K", "D", "F"],
  ["G", "L", "O", "V", "E", "N", "I", "Y", "B", "C"],
  ["H", "S", "T", "A", "Q", "O", "U", "J", "K", "L"],
  ["P", "M", "R", "B", "X", "Y", "O", "U", "N", "A"],
  ["D", "M", "U", "C", "H", "F", "W", "E", "R", "T"],
  ["V", "A", "S", "P", "L", "C", "I", "Q", "O", "M"],
  ["T", "N", "K", "D", "R", "E", "Y", "B", "G", "H"],
  ["C", "F", "J", "W", "S", "O", "L", "A", "P", "Q"],
  ["B", "Y", "O", "U", "M", "T", "C", "D", "F", "G"],
  ["L", "P", "Q", "R", "A", "S", "O", "N", "V", "Z"]
];


/*
   Exact locations of the hidden words.

   Coordinates are [row, column].
*/

const hiddenWords = [

  {
    word: "LOVE",
    start: [1, 1],
    end: [1, 4]
  },

  {
    word: "YOU",
    start: [3, 5],
    end: [3, 7]
  },

  {
    word: "MUCH",
    start: [4, 1],
    end: [4, 4]
  },

  {
    word: "SO",
    start: [2, 1],
    end: [1, 0]
  },

  {
    word: "I",
    start: [1, 6],
    end: [1, 6]
  }

];


const grid =
  document.getElementById("wordGrid");


let selecting = false;

let startCell = null;

let currentCells = [];

let foundWords = [];


/* =====================================================
   CREATE GRID
===================================================== */

function createGrid() {

  grid.innerHTML = "";

  gridLetters.forEach(function(row, rowIndex) {

    row.forEach(function(letter, colIndex) {

      const cell =
        document.createElement("div");

      cell.className = "letter";

      cell.textContent = letter;

      cell.dataset.row =
        rowIndex;

      cell.dataset.col =
        colIndex;

      grid.appendChild(cell);

    });

  });

}


createGrid();


/* =====================================================
   GET A CELL
===================================================== */

function getCell(row, col) {

  return document.querySelector(
    '.letter[data-row="' +
    row +
    '"][data-col="' +
    col +
    '"]'
  );

}


/* =====================================================
   GET ALL CELLS BETWEEN TWO POINTS
===================================================== */

function getCellsBetween(
  startRow,
  startCol,
  endRow,
  endCol
) {

  const cells = [];

  const rowDifference =
    endRow - startRow;

  const colDifference =
    endCol - startCol;


  /*
     A word-search selection must be:

     horizontal
     vertical
     or diagonal

     This prevents random curved selections.
  */

  const rowDirection =
    Math.sign(rowDifference);

  const colDirection =
    Math.sign(colDifference);


  const rowDistance =
    Math.abs(rowDifference);

  const colDistance =
    Math.abs(colDifference);


  if (
    rowDistance !== colDistance &&
    rowDistance !== 0 &&
    colDistance !== 0
  ) {

    return [];

  }


  const numberOfSteps =
    Math.max(
      rowDistance,
      colDistance
    );


  for (
    let i = 0;
    i <= numberOfSteps;
    i++
  ) {

    const row =
      startRow +
      rowDirection * i;

    const col =
      startCol +
      colDirection * i;


    const cell =
      getCell(
        row,
        col
      );


    if (cell) {

      cells.push(cell);

    }

  }


  return cells;

}


/* =====================================================
   CLEAR CURRENT SELECTION
===================================================== */

function clearSelection() {

  document
    .querySelectorAll(
      ".letter.selected"
    )
    .forEach(function(cell) {

      cell.classList.remove(
        "selected"
      );

    });

}


/* =====================================================
   BEGIN SELECTION
===================================================== */

function beginSelection(cell) {

  if (!cell) {
    return;
  }

  selecting = true;

  startCell = {

    row:
      Number(
        cell.dataset.row
      ),

    col:
      Number(
        cell.dataset.col
      )

  };


  currentCells = [
    cell
  ];


  clearSelection();

  cell.classList.add(
    "selected"
  );

}


/* =====================================================
   UPDATE SELECTION
===================================================== */

function updateSelection(cell) {

  if (
    !selecting ||
    !startCell ||
    !cell
  ) {

    return;

  }


  const endRow =
    Number(
      cell.dataset.row
    );

  const endCol =
    Number(
      cell.dataset.col
    );


  const cells =
    getCellsBetween(
      startCell.row,
      startCell.col,
      endRow,
      endCol
    );


  if (
    cells.length === 0
  ) {

    return;

  }


  clearSelection();


  cells.forEach(function(item) {

    item.classList.add(
      "selected"
    );

  });


  currentCells =
    cells;

}


/* =====================================================
   FINISH SELECTION
===================================================== */

function finishSelection() {

  if (!selecting) {
    return;
  }


  selecting = false;


  checkSelection(
    currentCells
  );


  startCell = null;

  currentCells = [];

}


/* =====================================================
   GET WORD FROM SELECTED CELLS
===================================================== */

function getSelectedWord(
  cells
) {

  return cells
    .map(function(cell) {

      return cell.textContent;

    })
    .join("");

}


/* =====================================================
   CHECK THE SELECTED WORD
===================================================== */

function checkSelection(
  cells
) {

  if (
    !cells ||
    cells.length === 0
  ) {

    clearSelection();

    return;

  }


  const selectedWord =
    getSelectedWord(
      cells
    );


  const reversedWord =
    selectedWord
      .split("")
      .reverse()
      .join("");


  const matchingWord =
    hiddenWords.find(function(item) {

      return (
        item.word === selectedWord ||
        item.word === reversedWord
      );

    });


  if (
    matchingWord &&
    !foundWords.includes(
      matchingWord.word
    )
  ) {

    /*
       Correct!
       Keep the selected letters highlighted.
    */

    cells.forEach(function(cell) {

      cell.classList.remove(
        "selected"
      );

      cell.classList.add(
        "found"
      );

    });


    foundWords.push(
      matchingWord.word
    );


    updateFoundWords();

  }

  else {

    /*
       Incorrect selection.
       Remove the temporary highlight.
    */

    clearSelection();

  }

}


/* =====================================================
   UPDATE FOUND WORD DISPLAY
===================================================== */

function updateFoundWords() {

  const count =
    document.getElementById(
      "foundCount"
    );


  count.textContent =
    foundWords.length +
    " / 5";


  const container =
    document.getElementById(
      "foundWords"
    );


  container.innerHTML = "";


  foundWords.forEach(function(word) {

    const span =
      document.createElement(
        "span"
      );

    span.textContent =
      word;

    container.appendChild(
      span
    );

  });


  /*
     ALL FIVE FOUND
  */

  if (
    foundWords.length === 5
  ) {

    const message =
      document.getElementById(
        "wordMessage"
      );


    message.innerHTML =
      "I LOVE YOU SO MUCH";


    document
      .getElementById(
        "continueButton"
      )
      .classList
      .remove(
        "hidden"
      );

  }

}


/* =====================================================
   MOUSE EVENTS
===================================================== */

grid.addEventListener(
  "mousedown",
  function(event) {

    const cell =
      event.target.closest(
        ".letter"
      );


    if (cell) {

      event.preventDefault();

      beginSelection(
        cell
      );

    }

  }
);


grid.addEventListener(
  "mouseover",
  function(event) {

    if (!selecting) {
      return;
    }


    const cell =
      event.target.closest(
        ".letter"
      );


    if (cell) {

      updateSelection(
        cell
      );

    }

  }
);


document.addEventListener(
  "mouseup",
  function() {

    if (selecting) {

      finishSelection();

    }

  }
);


/* =====================================================
   TOUCH EVENTS — iPAD / PHONE
===================================================== */

grid.addEventListener(
  "touchstart",
  function(event) {

    event.preventDefault();


    const touch =
      event.touches[0];


    const element =
      document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );


    const cell =
      element?.closest(
        ".letter"
      );


    if (cell) {

      beginSelection(
        cell
      );

    }

  },
  {
    passive: false
  }
);


grid.addEventListener(
  "touchmove",
  function(event) {

    if (!selecting) {
      return;
    }


    event.preventDefault();


    const touch =
      event.touches[0];


    const element =
      document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );


    const cell =
      element?.closest(
        ".letter"
      );


    if (cell) {

      updateSelection(
        cell
      );

    }

  },
  {
    passive: false
  }
);


grid.addEventListener(
  "touchend",
  function(event) {

    if (!selecting) {
      return;
    }


    event.preventDefault();


    finishSelection();

  },
  {
    passive: false
  }
);
