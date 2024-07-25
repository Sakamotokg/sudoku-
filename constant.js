const CONSTANT = {
    UNASSIGNED: 0,
    GRID_SIZE: 9,
    BOX_SIZE: 3,
    NUMBERS: [1,2,3,4,5,6,7,8,9],
    LEVEL_NAME: [
        'Kelas 1',
        'Kelas 2',
        'Kelas 3',
    ],
    LEVEL: [6, 10, 15,]
}

document.getElementById('submit-button').addEventListener('click', () => {
    let pointsDeduction = 0;
    let redCells = 0;
    let blankCells = 0;
  
    for (let i = 0; i < 81; i++) {
      if (cells[i].classList.contains('err')) {
        redCells++;
      } else if (cells[i].textContent === '') {
        blankCells++;
      }
    }
  
    let levelIndex = level_index;
    let deductionPerCell;
    if (levelIndex === 0) {
      deductionPerCell = 5;
    } else if (levelIndex === 1) {
      deductionPerCell = 3;
    } else if (levelIndex === 2)
      deductionPerCell = 2;
  
    pointsDeduction = (redCells + blankCells) * deductionPerCell;
  
    // Update the player's score
    let playerScore = parseInt(document.getElementById('playerScore').textContent);
    playerScore -= pointsDeduction;
    document.getElementById('playerScore').textContent = playerScore;
  
    // Show the result screen
    showResult();
  });