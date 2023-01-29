//STATE VARIABLES
/*----- constants -----*/
const COLORS = {
  '0': {
    color: 'rgba(255, 255, 255, 0)',
    name: 'No player'
  },
  '1': {
    color: "var(--player-one)",
    name: 'Player'
  },
  '-1': {
    color: "var(--computer-day)",
    name: 'Computer'
  }
}

let board; //array of col arrays (7 column)
let turn = 1; // 1 or -1 (player vs computer)
let winner; //null = no winner; 1 || -1 = winner; "T" = tie
let isNightMode = false;
/*----- state variables -----*/


/*----- cached elements  -----*/
const messageEl = document.querySelector("h1");
const playAgainBtn = document.getElementById("play-again");
const toggleBtn = document.querySelector("header > .toggle-btn")
//iterable
const markerEls = [...document.querySelectorAll("#markers > div")];

/*----- event listeners -----*/
//utilize envent delegation
document.getElementById("markers").addEventListener("click", handleDrop);
playAgainBtn.addEventListener("click", init);
toggleBtn.addEventListener("click", themeChange);

/*----- functions -----*/
function themeChange(evt) {
  const markers = document.querySelectorAll("#markers > div");
  const piecesEl = document.querySelectorAll("#board > div");

  const bodyEl = document.querySelector("body");
  const headerEl = document.querySelector("header");
  const h1El = document.querySelector("h1");
  const h2El = document.querySelector("h2");


  function hover(dayOrNight) {
    let dayBg = "var(--day-toggle)";
    let dayHover = "var(--day-toggle-hover)";
    let nightBg = "var(--night-toggle)";
    let nightHover = "var(--night-toggle-hover)";

    toggleBtn.addEventListener("mouseenter", (e) => {
      dayOrNight === "day" ? e.target.style.backgroundColor = dayHover : e.target.style.backgroundColor = nightHover;
    });

    toggleBtn.addEventListener("mouseleave", (e) => {
      dayOrNight === "day" ? e.target.style.backgroundColor = dayBg : e.target.style.backgroundColor = nightBg;
    })
  }

  if (isNightMode === false) {
    isNightMode = true;
    toggleBtn.innerText = "Day";
    COLORS[-1].color = "var(--computer-night)";
    toggleBtn.style.backgroundColor = "var(--day-toggle)";
    toggleBtn.style.color = "var(--day-toggle-c)";
    hover("day");
    piecesEl.forEach((piece) => piece.style.boxShadow = "var(--night-neon-shadow)");
    markers.forEach((marker) => marker.style.borderColor = "var(--night-markers-border-c)");
  } else {
    isNightMode = false;
    toggleBtn.innerText = "Night";
    COLORS[-1].color = "var(--computer-day)";
    toggleBtn.style.backgroundColor = "var(--night-toggle)";
    toggleBtn.style.color = "var(--night-toggle-c)";
    hover("night");
    piecesEl.forEach((piece) => piece.style.boxShadow = "var(--day-shadow)");
    markers.forEach((marker) => marker.style.borderColor = "var(--day-markers-border-c)")
  }

  bodyEl.classList.toggle("dark-mode");
  headerEl.classList.toggle("dark-mode");
  h1El.classList.toggle("dark-mode");
  h2El.classList.toggle("dark-mode");
}

init();
//initialize all state, then call render()
//array is 90 deg from DOM view
function init() {
  board = [
    [0, 0, 0, 0, 0, 0], // col 0
    [0, 0, 0, 0, 0, 0], // col 1
    [0, 0, 0, 0, 0, 0], // col 2
    [0, 0, 0, 0, 0, 0], // col 3
    [0, 0, 0, 0, 0, 0], // col 4
    [0, 0, 0, 0, 0, 0], // col 5
    [0, 0, 0, 0, 0, 0], // col 6
  ];
  turn;
  winner = null;
  render();
}

function handleDrop(evt) {
  const colIdx = markerEls.indexOf(evt.target);
  if (colIdx === -1) return;
  const colArr = board[colIdx];
  const rowIdx = colArr.indexOf(0);
  colArr[rowIdx] = turn;
  turn *= -1;
  winner = getWinner(colIdx, rowIdx);

  render();
}


function checkClearBoard() {
  let flatBoard = board.flat();
  return !flatBoard.includes(0);
}

//check winner in board state
// return null if no winner, 1/-1 if player has won, "T" if it is tie
function getWinner(colIdx, rowIdx) {
  //vertical, horizontal, diagonal (NE-SW)(NW-SE)
  let checkBoardClear = checkClearBoard();
  console.log(checkBoardClear);
  if (checkBoardClear === true) {
    if (checkVerticalWin(colIdx, rowIdx) === null && checkHorizontalWin(colIdx, rowIdx) === null &&
    checkDiagonalWinNESW(colIdx, rowIdx) === null && checkDiagonalWinNWSE(colIdx, rowIdx) === null) {
      return "T";
    }
  }

  let winner = checkVerticalWin(colIdx, rowIdx) || checkHorizontalWin(colIdx, rowIdx) ||
  checkDiagonalWinNESW(colIdx, rowIdx) || checkDiagonalWinNWSE(colIdx, rowIdx);
  return winner;
}

function checkVerticalWin(colIdx, rowIdx) {
  return countAdjacent(colIdx, rowIdx, 0, -1) === 3 ? board[colIdx][rowIdx] : null;
}

function checkHorizontalWin(colIdx, rowIdx) {
  const adjCountLeft = countAdjacent(colIdx, rowIdx, -1, 0);
  const adjCountRight = countAdjacent(colIdx, rowIdx, 1, 0);
  return (adjCountLeft + adjCountRight >= 3 ? board[colIdx][rowIdx]: null);
}

function checkDiagonalWinNESW(colIdx, rowIdx) {
  const adjCountNE = countAdjacent(colIdx, rowIdx, 1, 1);
  const adjCountSW = countAdjacent(colIdx, rowIdx, -1, -1);
  return (adjCountNE + adjCountSW) >= 3 ? board[colIdx][rowIdx] : null;
}

function checkDiagonalWinNWSE(colIdx, rowIdx) {
  const adjCountNW = countAdjacent(colIdx, rowIdx, -1, 1);
  const adjCountSE = countAdjacent(colIdx, rowIdx, 1, -1);
  return (adjCountNW + adjCountSE) >= 3 ? board[colIdx][rowIdx] : null;
}

//REUSABLE FN to use to check other orientation for WIN
//offset = count from last move
function countAdjacent(colIdx, rowIdx, colOffset, rowOffset) {
  //shortcut variable to the player value
  const player = board[colIdx][rowIdx];
  //track count of adjacent cells with the same player value;
  let count = 0;
  //initialize new coordinates
  colIdx += colOffset;
  rowIdx += rowOffset;
  while (
    board[colIdx] !== undefined && 
    board[colIdx][rowIdx] !== undefined &&
    board[colIdx][rowIdx] === player
  ) {
    count++;
    colIdx += colOffset;
    rowIdx += rowOffset;
  }
  return count;
} 

//visualize all state in the DOM
function render() {
  renderBoard();
  renderMessage();
  renderControls();
}

function renderBoard() {
  board.forEach((colArr, colIdx) => {
    colArr.forEach((cellVal, rowIdx) => {
      const cellId = `c${colIdx}r${rowIdx}`;
      const cellEl = document.getElementById(cellId);
      cellEl.style.backgroundColor = COLORS[cellVal].color;
    })
  })
}

function renderMessage() {
  let currentPlayer = COLORS[turn];
  let winningPlayer = COLORS[winner];
  if (winner === "T") {
    messageEl.innerText = "It's a Tie!!";
  } 
  else if (winner) {
    // messageEl.innerHTML = `${COLORS[1].name} WON!`;
    messageEl.innerHTML = `<span style="color: ${winningPlayer.color}">${winningPlayer.name.toUpperCase()}</span> WINS!`;
  } else {
    //Game is in play
    messageEl.innerHTML = `<span style="color: ${currentPlayer.color}">${currentPlayer.name.toUpperCase()}</span>'s turn`;
  }
}

function renderControls() {
  playAgainBtn.style.visibility = winner ? "visible" : "hidden";
  markerEls.forEach((markerEl, colIdx) => {
  const hideMarker = !board[colIdx].includes(0) || winner; 
  markerEl.style.visibility = hideMarker ? "hidden" : "visible";
  });
}



