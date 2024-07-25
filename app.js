document.querySelector('#dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkmode', isDarkMode);
    // chang mobile status bar color
    document.querySelector('meta[name="theme-color"').setAttribute('content', isDarkMode ? '#1a1a2e' : '#fff');
});

// initial value

// screens
const start_screen = document.querySelector('#start-screen');
const game_screen = document.querySelector('#game-screen');
const pause_screen = document.querySelector('#pause-screen');
const result_screen = document.querySelector('#result-screen');
// ----------
const cells = document.querySelectorAll('.main-grid-cell');

const name_input = document.querySelector('#input-name');

const number_inputs = document.querySelectorAll('.number');

const player_name = document.querySelector('#player-name');
const game_level = document.querySelector('#game-level');
const game_time = document.querySelector('#game-time');

const result_time = document.querySelector('#result-time');

let level_index = 0;
let level = CONSTANT.LEVEL[level_index];

let timer = null;
let pause = false;
let seconds = 0;

let su = undefined;
let su_answer = undefined;

let selected_cell = -1;

// --------

const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

// add space for each 9 cells
const initGameGrid = () => {
    let index = 0;

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2); i++) {
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        if (row === 2 || row === 5) cells[index].style.marginBottom = '10px';
        if (col === 2 || col === 5) cells[index].style.marginRight = '10px';

        index++;
    }
}
// ----------------

const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');

const showTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

const clearSudoku = () => {
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        cells[i].innerHTML = '';
        cells[i].classList.remove('filled');
        cells[i].classList.remove('selected');
    }
}

const initSudoku = () => {
    // clear old sudoku
    clearSudoku();
    resetBg();
    // generate sudoku puzzle here
    su = sudokuGen(level);
    su_answer = [...su.question];

    seconds = 0;

    saveGameInfo();

    // show sudoku to div
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su.question[row][col]);

        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
            cells[i].innerHTML = su.question[row][col];
        }
    }
}

const loadSudoku = () => {
    let game = getGameInfo();

    game_level.innerHTML = CONSTANT.LEVEL_NAME[game.level];

    su = game.su;

    su_answer = su.answer;

    seconds = game.seconds;
    game_time.innerHTML = showTime(seconds);

    level_index = game.level;

    // show sudoku to div
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su_answer[row][col]);
        cells[i].innerHTML = su_answer[row][col] !== 0 ? su_answer[row][col] : '';
        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
        }
    }
}

const hoverBg = (index) => {
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            cell.classList.add('hover');
        }
    }

    let step = 9;
    while (index - step >= 0) {
        cells[index - step].classList.add('hover');
        step += 9;
    }

    step = 9;
    while (index + step < 81) {
        cells[index + step].classList.add('hover');
        step += 9;
    }

    step = 1;
    while (index - step >= 9*row) {
        cells[index - step].classList.add('hover');
        step += 1;
    }

    step = 1;
     while (index + step < 9*row + 9) {
        cells[index + step].classList.add('hover');
        step += 1;
    }
}

const resetBg = () => {
    cells.forEach(e => e.classList.remove('hover'));
}


const checkErr = (value) => {
    const addErr = (cell) => {
        if (parseInt(cell.getAttribute('data-value')) === value) {
            cell.classList.add('err');
            cell.classList.add('cell-err');
            setTimeout(() => {
                cell.classList.remove('cell-err');
            }, 500); 
        } 
    } 

//this 1
    let index = selected_cell;

    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    // Remove error classes from all cells
    for (let i = 0; i < 81; i++) {
        cells[i].classList.remove('error');
        cells[i].classList.remove('selected');
    } 

    // Check for duplicates in row, column, and box
    let hasDuplicate = false;

    // Check row
    for (let i = 0; i < 9; i++) {
        let cellIndex = 9 * row + i;
        if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
            hasDuplicate = true;
            break;
        }
    }

    // Check column
    for (let i = 0; i < 9; i++) {
        let cellIndex = 9 * i + col;
        if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
            hasDuplicate = true;
            break;
        }
    }

    // Check box
    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cellIndex = 9 * (box_start_row + i) + (box_start_col + j);
            if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
                hasDuplicate = true;
                break;
            }
        }
    }

    let gridFilled = false;

    const updateGridFilled = () => {
        let isFilled = true;
        for (let i = 0; i < 81; i++) {
            if (cells[i].textContent === '') {
                isFilled = false;
                break;
            }
        }
        if (isFilled && !gridFilled) {
            gridFilled = true;
            document.getElementById('submit-button').disabled = false;
        } else {
            document.getElementById('submit-button').disabled = true;
        }
    }

    if (hasDuplicate) {
        cells[index].classList.add('err');
        saveGameInfo();             //New Added
    } else {
        cells[index].classList.add('selected');
        saveGameInfo();             //New Added
    }

    updateGridFilled();

    document.getElementById('submit-button').addEventListener('click', () => {
        {
            {
            for (let i = 0; i < 81; i++) {
                saveGameInfo();             //New Added

                if (cells[i].classList.contains('selected')) {
                    cells[i].style.backgroundColor = 'blue'; // Apply background color to all selected cells
                } else if (cells[i].classList.contains('err')) {
                    cells[i].style.backgroundColor = 'red'; // Apply background color to all error cells
                }
            }
            clearInterval(timer);
            }
        }
    });
}

//here 2
const removeErr = () => cells.forEach(e => e.classList.remove('cell'));

const saveGameInfo = () => {
    let game = {
        level: level_index,
        seconds: seconds,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer
        }
    }
    localStorage.setItem('game', JSON.stringify(game));
}

const removeGameInfo = () => {
    localStorage.removeItem('game');
    document.querySelector('#btn-continue').style.display = 'none';
}

 const isGameWin = () => sudokuCheck(su_answer); 



const initNumberInputEvent = () => {
    number_inputs.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!cells[selected_cell].classList.contains('filled')) {
                cells[selected_cell].innerHTML = index + 1;
                cells[selected_cell].setAttribute('data-value', index + 1);
                // add to answer
                let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
                let col = selected_cell % CONSTANT.GRID_SIZE;
                su_answer[row][col] = index + 1;
                // save game
                saveGameInfo()
                // -----
                //removeErr();
                checkErr(index + 1);
                cells[selected_cell].classList.add('zoom-in');
                setTimeout(() => {
                    cells[selected_cell].classList.remove('zoom-in');
                }, 500);

                // check game win
                if (isGameWin()) {
                    removeGameInfo();
                    showResult();
                }
                // ----
            }
        })
    })
} 

const initCellsEvent = () => {
    cells.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!e.classList.contains('filled')) {
                cells.forEach(e => e.classList.remove('selected'));

                selected_cell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        })
    })
}

const startGame = () => {
    start_screen.classList.remove('active');
    game_screen.classList.add('active');

    player_name.innerHTML = name_input.value.trim();
    setPlayerName(name_input.value.trim());

    game_level.innerHTML = CONSTANT.LEVEL_NAME[level_index];

    showTime(seconds);

    timer = setInterval(() => {
        if (!pause) {
            seconds = seconds + 1;
            game_time.innerHTML = showTime(seconds);
    
            // Check if 2 minutes have passed
            if (seconds >= 90) {
                document.getElementById('submit-button').disabled = false;
                document.getElementById('submit-button').click();
            }
        }
    }, 1000);
}

const returnStartScreen = () => {
    clearInterval(timer);
    pause = false;
    seconds = 0;
    start_screen.classList.add('active');
    game_screen.classList.remove('active');
    pause_screen.classList.remove('active');
    result_screen.classList.remove('active');
}

// add button event
document.querySelector('#btn-level').addEventListener('click', (e) => {
    level_index = level_index + 1 > CONSTANT.LEVEL.length - 1 ? 0 : level_index + 1;
    level = CONSTANT.LEVEL[level_index];
    e.target.innerHTML = CONSTANT.LEVEL_NAME[level_index];
});

document.querySelector('#btn-play').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        initSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    }
});

document.querySelector('#btn-continue').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        loadSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    } 
}); 

document.querySelector('#btn-pause').addEventListener('click', () => {
    pause_screen.classList.add('active');
    pause = true;
});

document.querySelector('#btn-resume').addEventListener('click', () => {
    pause_screen.classList.remove('active');
    pause = false;
});

document.querySelector('#btn-new-game').addEventListener('click', () => {
    returnStartScreen();
});

document.querySelector('#btn-new-game-2').addEventListener('click', () => {
    console.log('object')
    returnStartScreen();
});

document.querySelector('#btn-delete').addEventListener('click', () => {
    cells[selected_cell].innerHTML = '';
    cells[selected_cell].setAttribute('data-value', 0);

    let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
    let col = selected_cell % CONSTANT.GRID_SIZE;

    su_answer[row][col] = 0;

    removeErr();
})
// -------------

const init = () => {
    const darkmode = JSON.parse(localStorage.getItem('darkmode'));
    document.body.classList.add(darkmode ? 'dark' : 'light');
    document.querySelector('meta[name="theme-color"').setAttribute('content', darkmode ? '#1a1a2e' : '#fff');

    const game = getGameInfo();

    document.querySelector('#btn-continue').style.display = game ? 'grid' : 'none';

    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();

    if (getPlayerName()) {
        name_input.value = getPlayerName();
    } else {
        name_input.focus();
    }
}

init();

/* let index = selected_cell;

let row = Math.floor(index / CONSTANT.GRID_SIZE);
let col = index % CONSTANT.GRID_SIZE;

let box_start_row = row - row % 3;
let box_start_col = col - col % 3;

// Remove error classes from all cells
for (let i = 0; i < 81; i++) {
    cells[i].classList.remove('error');
    cells[i].classList.remove('selected');
}

// Check for duplicates in row, column, and box
let hasDuplicate = false;

// Check row
for (let i = 0; i < 9; i++) {
    let cellIndex = 9 * row + i;
    if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
        hasDuplicate = true;
        break;
    }
}

// Check column
for (let i = 0; i < 9; i++) {
    let cellIndex = 9 * i + col;
    if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
        hasDuplicate = true;
        break;
    }
}

// Check box
for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
    for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
        let cellIndex = 9 * (box_start_row + i) + (box_start_col + j);
        if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
            hasDuplicate = true;
            break;
        }
    }
}

// Add selected class to the selected cell
if (hasDuplicate) {
    cells[index].style.backgroundColor = 'red'; // Turn the selected tile red
} else {
    cells[index].classList.add('selected');
}











const checkErr = () => {
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
      let row = Math.floor(i / CONSTANT.GRID_SIZE);
      let col = i % CONSTANT.GRID_SIZE;
      let value = su_answer[row][col];
  
      if (value!== 0) {
        let rowValues = su_answer[row];
        let colValues = [];
        for (let j = 0; j < CONSTANT.GRID_SIZE; j++) {
          colValues.push(su_answer[j][col]);
        }
        let boxValues = [];
        let boxStartRow = row - row % 3;
        let boxStartCol = col - col % 3;
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
          for (let k = 0; k < CONSTANT.BOX_SIZE; k++) {
            boxValues.push(su_answer[boxStartRow + j][boxStartCol + k]);
          }
        }
  
        if (rowValues.indexOf(value)!== rowValues.lastIndexOf(value) ||
            colValues.indexOf(value)!== colValues.lastIndexOf(value) ||
            boxValues.indexOf(value)!== boxValues.lastIndexOf(value)) {
          cells[i].classList.add('err');
        }
      }
    }
  }
  
  const isGameWin = () => {
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
      if (su_answer[Math.floor(i / CONSTANT.GRID_SIZE)][i % CONSTANT.GRID_SIZE] === 0) {
        return false;
      }
    }
    return true;
  }
  
  const showResult = () => {
    if (isGameWin()) {
      checkErr();
    }
  }
  
  //...
  
  document.querySelector('#btn-new-game-2').addEventListener('click', () => {
    showResult();
  }); 
  
  
  










  let index = selected_cell;

let row = Math.floor(index / CONSTANT.GRID_SIZE);
let col = index % CONSTANT.GRID_SIZE;

let box_start_row = row - row % 3;
let box_start_col = col - col % 3;

// Remove error classes from all cells
for (let i = 0; i < 81; i++) {
    cells[i].classList.remove('error');
    cells[i].classList.remove('selected');
}

// Check for duplicates in row, column, and box
let hasDuplicate = false;

// Check row
for (let i = 0; i < 9; i++) {
    let cellIndex = 9 * row + i;
    if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
        hasDuplicate = true;
        break;
    }
}

// Check column
for (let i = 0; i < 9; i++) {
    let cellIndex = 9 * i + col;
    if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
        hasDuplicate = true;
        break;
    }
}

// Check box
for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
    for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
        let cellIndex = 9 * (box_start_row + i) + (box_start_col + j);
        if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
            hasDuplicate = true;
            break;
        }
    }
}

// Add selected class to the selected cell
if (hasDuplicate) {
    cells[index].classList.add('err'); // Add error class instead of changing background color
} else {
    cells[index].classList.add('selected');
}

// Only change background color to red if the game is won
if (isGameWin()) {
    cells[index].style.backgroundColor = 'red';
} 
    









let index = selected_cell;

let row = Math.floor(index / CONSTANT.GRID_SIZE);
let col = index % CONSTANT.GRID_SIZE;

let box_start_row = row - row % 3;
let box_start_col = col - col % 3;

// Remove error classes from all cells
 for (let i = 0; i < 81; i++) {
    cells[i].classList.remove('error');
    cells[i].classList.remove('selected');
} 

// Check for duplicates in row, column, and box
let hasDuplicate = false;

// Check row
for (let i = 0; i < 9; i++) {
    let cellIndex = 9 * row + i;
    if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
        hasDuplicate = true;
        break;
    }
}

// Check column
for (let i = 0; i < 9; i++) {
    let cellIndex = 9 * i + col;
    if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
        hasDuplicate = true;
        break;
    }
}

// Check box
for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
    for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
        let cellIndex = 9 * (box_start_row + i) + (box_start_col + j);
        if (cellIndex!== index && cells[cellIndex].textContent === cells[index].textContent) {
            hasDuplicate = true;
            break;
        }
    }
}

// Add selected class to the selected cell
let gridFilled = false;

//...

const updateGridFilled = () => {
    let isFilled = true;
    for (let i = 0; i < 81; i++) {
        if (cells[i].textContent === '') {
            isFilled = false;
            break;
        }
    }
    if (isFilled &&!gridFilled) {
        gridFilled = true;
        for (let i = 0; i < 81; i++) {
            if (cells[i].classList.contains('selected')) {
                cells[i].style.backgroundColor = 'blue'; // Apply background color to all selected cells
            } else if (cells[i].classList.contains('err')) {
                cells[i].style.backgroundColor = 'red'; // Apply background color to all error cells
            }
        }
    }
}

//...

if (hasDuplicate) {
    cells[index].classList.add('err');
} else {
    cells[index].classList.add('selected');
}

updateGridFilled(); // Call updateGridFilled here
}





*/