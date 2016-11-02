//  nlife-color
//     This is a modified version of the nlife core that adds color.

//      * Each cell has a color attribute. When generating the initial
//        board, colors are randomly assigned.
//      * When a new cell is created it inherits the most prevalent
//        color of the surrounding cells, or if there is a tie, any
//        one of the the top colors may be used.

//  GitHub: https://github.com/DougHaber/nlife-color


var life = {
    version        : '0.5-color',
    updateTime     : 25, // Wait time between cycles (no proper timing loop)
    chanceOfLife   : 6,
    scale          : 5,
    canvas         : null,  // Set during init
    frontBoard     : [], // The grid
    backBoard      : [], // Temporary grid for simultaneous stepping
    currentBoard   : 0 // 0 = Front, 1 = back
};


// **********************************************************
// * Life Itself - Game Code
// **********************************************************

function isAlive(x, y, board) {
    return ! ((x < 0 ||
               y < 0 ||
               x >= life.boardWidth ||
               y >= life.boardHeight ||
               ! board[x][y]))
}


function countNeighbors(posx, posy, board) {
    return (isAlive(posx - 1, posy - 1, board) +
	    isAlive(posx - 1, posy, board) +
	    isAlive(posx - 1, posy + 1, board) +
	    isAlive(posx, posy - 1, board) +
	    isAlive(posx, posy + 1, board) +
	    isAlive(posx + 1, posy - 1, board) +
	    isAlive(posx + 1, posy, board) +
	    isAlive(posx + 1, posy + 1, board)
	   );
}


function getColor(xPos, yPos, board) {
    var x, y;
    var color = {};
    var dominant;
    var dominantCount = 0;

    for (x = xPos - 1; x <= xPos + 1; x++) {
	if (! board[x]) {
	    continue;
	}

	for (y = yPos - 1; y <= yPos + 1; y++) {
	    if (board[x][y]) {
		if (color[board[x][y]]) {
		    color[board[x][y]]++;
		}
		else {
		    color[board[x][y]] = 1;
		}
	    }
	}
    }

    for (x in color) {
	if (color[x] > dominantCount) {
	    dominant = x;
	    dominantCount = color[x];
	}
    }

    return (dominant);
}


function testLife(x, y, board) {
    var n = countNeighbors(x, y, board);

    if (isAlive(x, y, board)) {
	if ((n < 2) || (n > 3)) {
	    return (false);
	}
	else {
	    return (board[x][y]);
	}
    }
    else if (n == 3) {
	return (getColor(x, y, board));
    }
    else {
	return (false);
    }
}


function doCycle() {
    var x, y;
    var board = life.currentBoard % 2 ? life.frontBoard : life.backBoard;

    if (life.currentBoard) {
	life.currentBoard = 0;
	altBoard = life.frontBoard;
	board = life.backBoard
    }
    else {
	altBoard = life.backBoard;
	board = life.frontBoard
	life.currentBoard = 1;
    }

    for (x = 0; x < life.boardWidth; x++) {
	for (y = 0; y < life.boardHeight; y++) {
	    altBoard[x][y] = testLife(x, y, board);
	}
    }

    drawBoard(board);
    setTimeout(doCycle, life.updateTime);
}


// **********************************************************
// * Drawing
// **********************************************************

function drawBoard(board) {
    var x, y;
    var boardWidth = life.boardWidth;
    var boardHeight = life.boardHeight;
    var scale = life.scale;

    blankBoard();

    for (x = 0; x < boardWidth; x++) {
	for (y = 0; y < boardHeight; y++) {
	    if (board[x][y]) {
		life.context.fillStyle = board[x][y];
		life.context.fillRect(x * scale,
				      y * scale,
				      scale,
				      scale);
	    }
	}
    }
}


function blankBoard() {
    life.context.fillStyle = '#000000';
    life.context.fillRect(0, 0, life.canvas.width, life.canvas.height);
}


// **********************************************************
// * Initialization
// **********************************************************

function randomColor() {
    return ('#' + parseInt(Math.random() * 16777215).toString(16));
}


function initBoard() {
    var x, y;

    life.boardHeight = Math.floor(parseInt(life.canvas.height) / life.scale);
    life.boardWidth  = Math.floor(parseInt(life.canvas.width)  / life.scale);
    life.context = life.canvas.getContext('2d');

    for (x = 0; x < life.boardWidth; x++) {
	life.frontBoard[x] = [];
	life.backBoard[x] = [];

	for (y = 0; y < life.boardHeight; y++) {
	    life.frontBoard[x][y] = Math.floor(Math.random() * life.chanceOfLife) == 0 ?
                randomColor() : false;
	}
    }
}


function init() {
    var e;

    life.canvas = document.getElementById("nLifeCanvas");
    life.canvas.height = document.body.clientHeight - life.scale * 4;
    life.canvas.width = document.body.clientWidth - life.scale * 2;
    life.canvas.style.padding = '0px';
    life.canvas.style.margin = '0px';

    if (life.canvas) {
	initBoard();
    }
    else {
	alert("ERROR: Canvas not found. Aborting!\n");
    }

    doCycle();
}


window.onload = init;
