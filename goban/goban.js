/**
 * Author: Minsheng Zheng 郑旻晟
 */

class Goban {
    constructor(settings) {
        this.settings = settings;
        this.initGame();
    }

    initGame() {
        const settings = this.settings;

        this.boardWidth = settings.n * settings.gap;
        this.boardHeight = settings.n * settings.gap;
        this.validWidth = settings.n * settings.gap + settings.padding;
        this.validHeight = settings.n * settings.gap + settings.padding;
        this.maxMove = ((settings.n + 1) * (settings.n + 1)) - 1;

        this.board = null;
        this.playHistory = [];
        this.playNumber = 0;
        this.replayQueue = []; // store unplayed move for replay
        this.winner = null;
        this.c = null;

        this.c = document.getElementById("gameBoard");
        this.c.width = this.boardWidth + settings.padding * 2;
        this.c.height = this.boardHeight + settings.padding * 2;
        this.ctx = this.c.getContext("2d");
        this.player = 1; // white player first by default

        this.drawGameBoard();
        this.initBoardData();
        this.initUI();
        this.initPlay();
        // the "0th" move, log the empty board so the first move can be unplayed
        this.updatePlayHistory(-1, -1, this.player);
    }

    /**
     * Initialize a 2D array to represent the game board,
     * (0,0) represents the upper left corner,
     * (n-1,n-1) represents the lower right corner
     */
    initBoardData() {
        const board = [];
        for (let x = 0; x <= this.settings.n; x++) {
            board[x] = [];
            for (let y = 0; y <= this.settings.n; y++) {
                board[x][y] = 0;
            }
        }

        this.board = board;
    }

    /**
     * Draw an NxN game board using canvas
     */
    drawGameBoard() {
        const settings = this.settings;
        const ctx = this.ctx;
        const strokeColor = settings.strokeColor;
        const gap = settings.gap;
        const pad = settings.padding;
        const w = this.boardWidth;
        const h = this.boardHeight;
        const n = settings.n;

        if (!ctx) {
            return;
        }

        ctx.strokeStyle = strokeColor;

        for (let i=0; i<=n; i++) {
            // from top left to top right
            ctx.moveTo(pad, i * gap + pad);
            ctx.lineTo(w + pad, i * gap + pad);
            ctx.stroke();

            // from top left to bottom left
            ctx.moveTo(i * gap + pad, pad);
            ctx.lineTo(i * gap + pad, h + pad);
            ctx.stroke();
        }
    }

    /**
     * Initialize UI elements (buttons for reset, unplay, replay)
     */
    initUI() {
        const resetBtn = document.getElementById("reset");
        const unplayBtn = document.getElementById("unplay");
        const replayBtn = document.getElementById("replay");

        resetBtn.onclick = ev => {
            this.initGame();
        }

        unplayBtn.onclick = ev => {
            this.unplay();
        }

        replayBtn.onclick = ev => {
            this.replay();
        }
    }

    initPlay() {
        this.c.onclick = ev => {
            this.play(ev);
        }
    }

    /**
     * Two players take turn to make a move on the board
     * @param ev
     */
    play(ev) {
        // lock board when there is a winner
        if (this.winner) return;

        const gap = this.settings.gap;
        const horizontalBound = this.validWidth;
        const verticalBound = this.validHeight;
        const player = this.player;

        // convert coordinates to canvas-based
        let x = ev.clientX - this.c.offsetLeft;
        let y = ev.clientY - this.c.offsetTop;

        // calculate the cloest point for placing the circle
        x = Math.round(x/gap)*gap;
        y = Math.round(y/gap)*gap;

        let xPos = x/gap - 1;
        let yPos = y/gap - 1;

        if ((x < 0) || (x > horizontalBound) ||
            (y < 0) || (y > verticalBound) ||
            (this.isPosPlayed(xPos,yPos))) {
            return;
        }

        this.drawCircle(this.ctx, x, y, player);
        this.updateBoardData(xPos, yPos, player);

        if (this.hasWon(xPos, yPos)) setTimeout(this.end.bind(this), 10);

        if (this.hasTie()) setTimeout(this.tie.bind(this), 10);

        this.playNumber += 1;

        this.updatePlayHistory(xPos, yPos, player);

        this.replayQueue = [];

        this.switchPlayer();
    }

    /**
     * x,y is the coordinate of the intersection of two board lines
     */
    drawCircle(ctx, x, y, player) {
        const settings = this.settings;

        ctx.fillStyle = settings.circleColor[player];
        ctx.beginPath();
        ctx.arc(x,y,settings.gap/2-2,0,2*Math.PI);
        ctx.fill();
    }

    /**
     * Replay the last move being uplayed,
     * can replay as many times as unplay
     */
    replay() {
        // lock board when there is a winner
        if (this.winner) return;

        if (this.replayQueue.length === 0) return;

        const lastMove = this.replayQueue.pop(); // get the latest move data

        if (lastMove) {
            // just unplayed, can replay
            this.board[lastMove.x][lastMove.y] = lastMove.player;

            this.ctx.putImageData(lastMove.state, 0, 0);

            // add it back to history
            this.playHistory.push(lastMove);

            this.playNumber += 1;

            this.switchPlayer();
        }
    }

    /**
     * Unplay a move of a player,
     * can unplay continously until the initial state
     */
    unplay() {
        // lock board when there is a winner
        if (this.winner) return;

        // cannot unplay at the beginning
        if ((this.playHistory.length === 1) && (this.playNumber === 0)) return;

        // get data of current state
        let currPlayNum = this.playNumber;
        let currPlayData = this.playHistory[currPlayNum];

        let prevPlayNum = this.playNumber - 1;
        let prevPlayData = this.playHistory[prevPlayNum];

        // redraw previous board on canvas
        this.ctx.putImageData(prevPlayData.state, 0, 0);

        // reset board data of current play
        this.board[currPlayData.x][currPlayData.y] = 0;

        this.replayQueue.push(currPlayData);

        this.playHistory.splice(currPlayNum, 1);

        this.playNumber -= 1;

        if (currPlayData.player !== this.player) {
            this.switchPlayer(); // just unplayed the other player's move, need to switch turn
        }
    }

    /**
     * Log play data for unplay/replay
     * @param xPos
     * @param yPos
     * @param player
     */
    updatePlayHistory(xPos, yPos, player) {
        let currState = this.ctx.getImageData(0, 0, this.c.width, this.c.height);

        const playData = {
            id: this.playNumber,
            x: xPos,
            y: yPos,
            player: player,
            // current state of the board
            state: currState
        };

        this.playHistory.push(playData);
    }

    isPosPlayed(xPos,yPos) {
        return this.board[xPos][yPos] !== 0;
    }

    updateBoardData(xPos, yPos, player) {
        this.board[xPos][yPos] = player;
    }

    end() {
        alert(this.settings.players[this.winner] + " won!");
    }

    tie() {
        alert("Impossible! The game is a tie!");
    }

    hasTie() {
        if (this.playNumber === this.maxMove) {
            this.winner = 3;
            return true;
        }

        return false;
    }

    /**
     * Check the game board data to see if a player has won,
     * Conditions:
     * - horizontal
     * - vertical
     * - diagonal x 2
     */
    hasWon(xPos, yPos) {
        const b = this.board;
        const player = b[xPos][yPos]; // get player


        if (hasWonHorizontal(xPos, yPos, b, player) || hasWonVertical(xPos, yPos, b, player) ||
            hasWonDiagonalLR(xPos, yPos, b, player) || hasWonDiagonalRL(xPos, yPos, b, player)) {
            this.winner = player;
            return true;
        }

        function hasWonHorizontal(xPos, yPos, b, player) {
            let score = 0;

            // check horizontal, towards left
            for (let x = xPos; x >= 0; x--) {
                if (b[x][yPos] === player) {
                    score += 1;
                } else {
                    break;
                }
            }

            for (let x = xPos; x < b.length; x++) {
                if (b[x][yPos] === player) {
                    score += 1;
                } else {
                    break;
                }
            }

            if (score >= 6) {
                return true;
            }
        }

        function hasWonVertical(xPos, yPos, b, player) {
            let score = 0;

            for (let y = yPos; y >= 0; y--) {
                if (b[xPos][y] === player) {
                    score += 1;
                } else {
                    break;
                }
            }

            for (let y = yPos; y < b.length; y++) {
                if (b[xPos][y] === player) {
                    score += 1;
                } else {
                    break;
                }
            }

            if (score >= 6) {
                return true;
            }
        }

        function hasWonDiagonalLR(xPos, yPos, b, player) {
            let score = 0;

            // check from center to upper left
            for (let x = xPos, y = yPos; (x >= 0) && (y >= 0); x--, y--) {
                if (b[x][y] === player) {
                    score += 1;
                } else {
                    break;
                }
            }

            // check from center to lower right
            for (let x = xPos, y = yPos; (x < b.length) && (y < b.length); x++, y++) {
                if (b[x][y] === player) {
                    score += 1;
                } else {
                    break;
                }
            }

            if (score >= 6) {
                return true;
            }
        }

        function hasWonDiagonalRL(xPos, yPos, b, player) {
            let score = 0;

            // check from center to upper right
            for (let x = xPos, y = yPos; (x < b.length) && (y >= 0); x++, y--) {
                if (b[x][y] === player) {
                    score += 1;
                } else {
                    break;
                }
            }

            // check from center to lower left
            for (let x = xPos, y = yPos; (x >= 0) && (y < b.length); x--, y++) {
                if (b[x][y] === player) {
                    score += 1;
                } else {
                    break;
                }
            }

            if (score >= 6) {
                return true;
            }
        }

        return false;
    }

    /**
     * Switch player, 1 - White, 2 - Black
     */
    switchPlayer() {
        this.player = (this.player === 1) ? 2 : 1;
    }
}

const mySettings = {
    n: 15,
    gap: 30,
    strokeColor: "#9B969D",
    padding: 30,
    players: {
        1: "White player",
        2: "Black player",
    },
    circleColor: {
        1: "#E8DEC9",
        2: "black",
    },

};

const game = new Goban(mySettings);