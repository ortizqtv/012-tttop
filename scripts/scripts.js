//Tic Tac Toe

const pubsub = (() => {
  let pubsub = {};

  function subscribe(evt, fn) {
    pubsub[evt] = pubsub[evt] || [];
    pubsub[evt].push(fn);
  }

  function unsubscribe(evt, fn) {
    if (pubsub[evt]) {
      for (let u = 0; u < pubsub[evt].length; u++) {
        if (pubsub[evt][u] === fn) {
          pubsub[evt].splice(u, 1);
          break;
        }
      }
    }
  }

  function publish(evt, data) {
    if (pubsub[evt]) {
      pubsub[evt].forEach((fn) => {
        fn(data);
      });
    }
  }

  return { subscribe, unsubscribe, publish };
})();

const display = (() => {
  let player = 'O';
  let seeBoardPlayer = true;
  let player0Score = 0;
  let playerXScore = 0;
  let vs = 'computer';

  //cache DOM
  const board = document.querySelector('.board__grid');
  const squares = [...document.querySelectorAll('.board__square')];
  const result = document.querySelector('.board__result');
  const resultPlayer = document.querySelector('.result__player');
  const resultText = document.querySelector('.result__message');
  const scores = [...document.querySelectorAll('.player__score')];
  const btns = [...document.querySelectorAll('.btn')];
  const message = document.querySelector('.board__message');
  const select = document.querySelector('.information__select');

  //Functions
  function setPlayerOnBoard() {
    if (this.textContent !== '') {
      return;
    } else {
      this.textContent = player;
      this.classList.add('board__square--active');

      message.textContent = '';

      pubsub.publish('board', squares);
      pubsub.publish('seeBoardPlayer', seeBoardPlayer);

      if (select.value === 'player') {
        if (player === 'O') {
          player = 'X';

          addActiveOnXRemoveO();

          message.textContent = 'X turn';
        } else {
          player = 'O';

          addActiveOnORemoveX();

          message.textContent = 'O turn';
        }
      }
    }
  }

  function setPlayerOrRestart() {
    if (this.className === 'btn btn--o') {
      player = 'O';

      xAndOEventRemove();

      addActiveOnORemoveX();

      message.textContent = 'O turn';

      addSquareEventAndReset();
      pubsub.publish('restart', true);
    } else if (this.className === 'btn btn--x') {
      player = 'X';

      xAndOEventRemove();

      addActiveOnXRemoveO();

      message.textContent = 'X turn';

      addSquareEventAndReset();

      pubsub.publish('restart', true);
      pubsub.publish('player', player);
      pubsub.publish('setComputerToFirst', true);
      pubsub.publish('isComputerFirst', true);
    } else if (
      this.className === 'btn btn--restart' ||
      this.className === 'board__result board__result--active'
    ) {
      player = 'O';

      btns[0].classList.remove('btn--o--active');
      btns[1].classList.remove('btn--x--active');

      board.classList.remove('board__grid--active');

      result.classList.remove('board__result--active');

      message.textContent = 'Restarting';

      setTimeout(() => {
        board.classList.add('board__grid--alt');

        addSquareEventAndReset();

        message.textContent = 'Start game or select player';

        xAndOEventAdd();

        btns[0].classList.add('btn--o--active');
      }, 1000);

      board.classList.remove('board__grid--alt');

      pubsub.publish('player', player);
      pubsub.publish('setComputerToFirst', false);
      pubsub.publish('randomStart', true);
      pubsub.publish('restart', true);
    }
  }

  function vSComputerOrPlayer() {
    player = 'O';

    if (this.value === 'player') {
      vs = 'player';
    } else if (this.value === 'easy') {
      vs = 'easy';
    } else if (this.value === 'normal') {
      vs = 'normal';
    } else {
      vs = 'legendary';
    }

    addActiveOnORemoveX();
    xAndOEventAdd();
    addSquareEventAndReset();

    message.textContent = 'Start game or select player';

    pubsub.publish('vs', vs);
    pubsub.publish('restart', true);
  }

  function showComputerChoice(position) {
    for (let u = 0; u < squares.length; u++) {
      if (
        +squares[u].dataset['row'] === position[0] &&
        +squares[u].dataset['column'] === position[1]
      ) {
        if (player === 'X') {
          addActiveOnORemoveX();
        } else {
          addActiveOnXRemoveO();
        }

        removeSquareEvent();

        setTimeout(() => {
          squares[u].classList.add('board__square--active');

          if (player === 'X') {
            squares[u].textContent = 'O';
          } else {
            squares[u].textContent = 'X';
          }

          if (player === 'X') {
            addActiveOnXRemoveO();
          } else {
            addActiveOnORemoveX();
          }

          addSquareEvent();
        }, 1000);
      }
    }
  }

  function theGameIsOver(winner) {
    removeSquareEvent();
    result.removeEventListener('click', setPlayerOrRestart);

    if (winner === 'O') {
      resultPlayer.textContent = winner;
      resultText.textContent = 'Winner!';

      player0Score++;

      setTimeout(() => {
        scores[0].textContent = player0Score;
      }, 500);
    } else if (winner === 'X') {
      resultPlayer.textContent = winner;
      resultText.textContent = 'Winner!';

      playerXScore++;

      setTimeout(() => {
        scores[1].textContent = playerXScore;
      }, 500);
    } else {
      resultPlayer.textContent = 'OX';
      resultText.textContent = 'Draw!';
    }

    setTimeout(() => {
      board.classList.add('board__grid--active');
      result.classList.add('board__result--active');

      message.textContent = '';
    }, 500);

    setTimeout(() => {
      result.addEventListener('click', setPlayerOrRestart);
    }, 1500);
  }

  //Events
  function removeSquareEvent() {
    squares.forEach((item) => {
      item.removeEventListener('click', setPlayerOnBoard);
    });
  }

  function addSquareEvent() {
    squares.forEach((item) => {
      item.addEventListener('click', setPlayerOnBoard);
    });
  }

  function addSquareEventAndReset() {
    squares.forEach((item) => {
      item.textContent = '';
      item.classList.remove('board__square--active');
      item.addEventListener('click', setPlayerOnBoard);
    });
  }

  function addActiveOnORemoveX() {
    btns[0].classList.add('btn--o--active');
    btns[1].classList.remove('btn--x--active');
    message.textContent = 'O turn';
  }

  function addActiveOnXRemoveO() {
    btns[1].classList.add('btn--x--active');
    btns[0].classList.remove('btn--o--active');
    message.textContent = 'X turn';
  }

  function xAndOEventRemove() {
    btns[0].removeEventListener('click', setPlayerOrRestart);
    btns[1].removeEventListener('click', setPlayerOrRestart);
  }

  function xAndOEventAdd() {
    btns[0].addEventListener('click', setPlayerOrRestart);
    btns[1].addEventListener('click', setPlayerOrRestart);
  }

  addSquareEvent();

  btns[0].classList.add('btn--o--active');

  btns.forEach((item) => {
    item.addEventListener('click', setPlayerOrRestart);
  });

  select.addEventListener('change', vSComputerOrPlayer);

  result.addEventListener('click', setPlayerOrRestart);

  pubsub.subscribe('theGameIsOver', theGameIsOver);
  pubsub.subscribe('showComputerChoice', showComputerChoice);
})();

const game = (() => {
  let board = [
    ['[0][0]', '[0][1]', '[0][2]'],
    ['[1][0]', '[1][1]', '[1][2]'],
    ['[2][0]', '[2][1]', '[2][2]'],
  ];
  let winner = '';
  let stop = 'no';

  //Functions
  function insertXOToBoard(xO) {
    for (let u = 0; u < xO.length; u++) {
      if (xO[u].textContent !== '') {
        board[xO[u].dataset['row']][xO[u].dataset['column']] =
          xO[u].textContent;
      }
    }

    seeBoardForWinner();

    if (stop === 'no') {
      pubsub.publish('startComputer', board);
    }
  }

  function isComputerFirst(tF) {
    if (tF === true) {
      pubsub.publish('startComputer', board);
    }
  }

  function seeBoardForWinner(playerTF) {
    winner = '';
    //Horizontal
    if (board[0][0] === board[0][1] && board[0][0] === board[0][2]) {
      if (board[0][0] === 'O') {
        winner = 'O';
      } else if (board[0][0] === 'X') {
        winner = 'X';
      }
    } else if (board[1][0] === board[1][1] && board[1][0] === board[1][2]) {
      if (board[1][0] === 'O') {
        winner = 'O';
      } else if (board[1][0] === 'X') {
        winner = 'X';
      }
    } else if (board[2][0] === board[2][1] && board[2][0] === board[2][2]) {
      if (board[2][0] === 'O') {
        winner = 'O';
      } else if (board[2][0] === 'X') {
        winner = 'X';
      }
    }
    //Vertical
    if (board[0][0] === board[1][0] && board[0][0] === board[2][0]) {
      if (board[0][0] === 'O') {
        winner = 'O';
      } else if (board[0][0] === 'X') {
        winner = 'X';
      }
    } else if (board[0][1] === board[1][1] && board[0][1] === board[2][1]) {
      if (board[0][1] === 'O') {
        winner = 'O';
      } else if (board[0][1] === 'X') {
        winner = 'X';
      }
    } else if (board[0][2] === board[1][2] && board[0][2] === board[2][2]) {
      if (board[0][2] === 'O') {
        winner = 'O';
      } else if (board[0][2] === 'X') {
        winner = 'X';
      }
    }
    //Diagonal
    if (board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
      if (board[0][0] === 'O') {
        winner = 'O';
      } else if (board[0][0] === 'X') {
        winner = 'X';
      }
    } else if (board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
      if (board[0][2] === 'O') {
        winner = 'O';
      } else if (board[0][2] === 'X') {
        winner = 'X';
      }
    }

    if (winner !== '' || isTheBoardFilled() === true) {
      stop = 'yes';

      if (winner === '' && isTheBoardFilled() === true) {
        winner = 'Draw';
      }

      if (playerTF === true) {
        setTimeout(() => {
          pubsub.publish('theGameIsOver', winner);
        }, 1000);
      }
    } else {
      stop = 'no';
    }

    return winner;
  }

  function isTheBoardFilled() {
    let check = true;
    for (let row = 0; row < board.length; row++) {
      for (let column = 0; column < board[row].length; column++) {
        if (board[row][column].length > 1) {
          check = false;
        }
      }
    }
    return check;
  }

  function restart(tF) {
    if (tF === true) {
      board = [
        ['[0][0]', '[0][1]', '[0][2]'],
        ['[1][0]', '[1][1]', '[1][2]'],
        ['[2][0]', '[2][1]', '[2][2]'],
      ];

      winner = '';
    }
  }

  //Events
  pubsub.subscribe('board', insertXOToBoard);
  pubsub.subscribe('restart', restart);
  pubsub.subscribe('seeBoardComputer', seeBoardForWinner);
  pubsub.subscribe('seeBoardPlayer', seeBoardForWinner);
  pubsub.subscribe('isComputerFirst', isComputerFirst);

  return seeBoardForWinner;
})();

const computer = (() => {
  let mode = 'easy';
  let setRandomStart = true;
  let computer = 'X';
  //MiniMax Variables
  let isComputerFirst = false;
  //MiniMax Variables
  let key = {
    O: 10,
    X: -10,
    Draw: 0,
  };

  //Functions
  function vs(value) {
    if (value === 'player') {
      mode = 'player';
    } else if (value === 'easy') {
      mode = 'easy';
    } else if (value === 'normal') {
      mode = 'normal';
    } else {
      mode = 'legendary';
    }
  }

  function xOComputer(xO) {
    if (xO === 'X') {
      computer = 'O';
    } else {
      computer = 'X';
    }
  }

  function randomStart(tF) {
    if (tF === true) {
      setRandomStart = true;
    } else {
      setRandomStart = false;
    }
  }

  function setComputerToFirst(tF) {
    if (tF === true) {
      isComputerFirst = true;
    } else {
      isComputerFirst = false;
    }
  }

  function random(board) {
    if (mode !== 'player') {
      for (let row = 0; row < board.length; row++) {
        for (let column = 0; column < board[row].length; column++) {
          if (board[row][column].length > 1) {
            while (true) {
              let rows = Math.floor(Math.random() * (3 - 0) + 0);
              let columns = Math.floor(Math.random() * (3 - 0) + 0);

              if (
                board[rows][columns] !== 'O' &&
                board[rows][columns] !== 'X'
              ) {
                board[rows][columns] = computer;

                pubsub.publish('showComputerChoice', [rows, columns]);
                pubsub.publish('seeBoardComputer', board);

                return;
              }
            }
          }
        }
      }
    }
  }

  function startComputer(board) {
    if (mode !== 'player') {
      //Easy
      if (mode === 'easy') {
        random(board);
        return;
      }

      if (mode === 'normal' && setRandomStart === true) {
        //Normal
        random(board);
        setRandomStart = false;
        return;
      }

      let theTopScore = Infinity;
      let isNextPlayerMax = true;

      if (isComputerFirst === true) {
        theTopScore = -Infinity;
        isNextPlayerMax = false;
      }

      let choice;

      for (let row = 0; row < board.length; row++) {
        for (let column = 0; column < board[row].length; column++) {
          if (board[row][column].length > 1) {
            board[row][column] = computer;

            let theCurrentScore = templateMiniMax(board, 0, isNextPlayerMax);

            board[row][column] = `[${row}][${column}]`;

            if (isComputerFirst === true) {
              if (theCurrentScore > theTopScore) {
                theTopScore = theCurrentScore;

                choice = [row, column];
              }
            } else {
              if (theCurrentScore < theTopScore) {
                theTopScore = theCurrentScore;

                choice = [row, column];
              }
            }
          }
        }
      }
      board[choice[0]][choice[1]] = computer;
      pubsub.publish('showComputerChoice', choice);
      pubsub.publish('seeBoardComputer', board);
    }
  }

  function templateMiniMax(board, depth, isNextPlayerMax) {
    let result = game();

    if (result !== '') {
      return key[result];
    }

    if (isNextPlayerMax === true) {
      return templateLoopForMiniMax(board, depth, false, -Infinity, 'O', 'max');
    } else {
      return templateLoopForMiniMax(board, depth, true, Infinity, 'X', 'min');
    }
  }

  function templateLoopForMiniMax(
    board,
    depth,
    isNextPlayerMax,
    theBaselineScore,
    thePlayer,
    getMaxOrMin
  ) {
    let theTopScore = theBaselineScore;

    for (let row = 0; row < board.length; row++) {
      for (let column = 0; column < board[row].length; column++) {
        if (board[row][column].length > 1) {
          board[row][column] = thePlayer;

          let theCurrentScore = templateMiniMax(
            board,
            depth + 1,
            isNextPlayerMax
          );

          board[row][column] = `[${row}][${column}]`;

          theTopScore = Math[`${getMaxOrMin}`](theCurrentScore, theTopScore);
        }
      }
    }
    return theTopScore;
  }

  //Events
  pubsub.subscribe('vs', vs);
  pubsub.subscribe('player', xOComputer);
  pubsub.subscribe('randomStart', randomStart);
  pubsub.subscribe('setComputerToFirst', setComputerToFirst);
  pubsub.subscribe('startComputer', startComputer);
})();

//
