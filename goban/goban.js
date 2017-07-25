class Goban {
    constructor(settings) {
        this.settings = settings;
        this.initGame();
    }

    initGame() {
        const settings = this.settings;

        this.boardWidth = settings.n*settings.gap;
        this.boardHeight = settings.n*settings.gap;
        this.board = null;
        this.c = null;
        this.c = document.getElementById("gameBoard");
        this.c.width = this.boardWidth;
        this.c.height = this.boardHeight;
        this.ctx = this.c.getContext("2d");
        this.role = 1; // white player first by default
        this.drawGameBoard();
        this.initBoardData();
        this.initUI();
        this.initPlay();
    }

    /**
     * Initialize a 2D array to represent the game board,
     * (0,0) represents the upper left corner,
     * (n-1,n-1) represents the lower right corner
     */
    initBoardData() {
        const board = [];
        for (let x = 0; x < this.settings.n - 1; x++) {
            board[x] = [];
            for (let y = 0; y < this.settings.n - 1; y++) {
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
        const w = this.boardWidth;
        const h = this.boardHeight;
        const n = settings.n;

        if (!ctx) {
            return;
        }

        ctx.strokeStyle = strokeColor;

        for (let i=0; i<=n; i++) {
            // from top left to top right
            ctx.moveTo(0, i*gap);
            ctx.lineTo(w, i*gap);
            ctx.stroke();

            // from top left to bottom left
            ctx.moveTo(i*gap, 0);
            ctx.lineTo(i*gap, h);
            ctx.stroke();
        }
    }

    /**
     * Initialize UI elements (reset, unplay, replay)
     */
    initUI() {
        const resetBtn = document.getElementById("reset");
        resetBtn.onclick = ev => {
            this.initGame();
        }
    }

    initPlay() {
        this.c.onclick = ev => {
            this.play(ev);
        }
    }

    /**
     * x,y is the coordinate of the intersection of two board lines
     */
    drawCircle(ctx, x, y, role) {
        const settings = this.settings;

        ctx.fillStyle = settings.circleColor[role];
        ctx.beginPath();
        ctx.arc(x,y,settings.gap/2-2,0,2*Math.PI);
        ctx.fill();
    }

    /**
     *
     * @param ev
     */
    play(ev) {
        const gap = this.settings.gap;
        const boardWidth = this.boardWidth;
        const boardHeight = this.boardHeight;
        // const outBound = this.settings.outBound;
        const role = this.role;

        // convert coordinates to canvas-based
        let x = ev.clientX - this.c.offsetLeft;
        let y = ev.clientY - this.c.offsetTop;

        // calculate the cloest point for placing the circle
        x = Math.round(x/gap)*gap;
        y = Math.round(y/gap)*gap;

        let xPos = x/gap - 1;
        let yPos = y/gap - 1;

        if ((x <= 0) || (x >= boardWidth) ||
            (y <= 0) || (y >= boardHeight) ||
            (this.isPosPlayed(xPos,yPos))) {
            // this.notificationHandler(outBound);
            return;
        }

        this.updateBoardData(xPos, yPos, role);

        console.log([x,y]);
        console.log([xPos, yPos]);

        this.drawCircle(this.ctx, x, y, role);

        this.switchRole();
    }

    isPosPlayed(xPos,yPos) {
        return this.board[xPos][yPos] !== 0;
    }

    updateBoardData(xPos, yPos, role) {
        this.board[xPos][yPos] = role;
    }

    /**
     * Check the game board data to see if a player has won,
     * Conditions:
     * - horizontal
     * - vertical
     * - diagonal x 2
     */
    hasWon() {
        const b = this.board;


    }

    /**
     * Switch player, 1 - White, 2 - Black
     */
    switchRole() {
        this.role = (this.role === 1) ? 2 : 1;
    }

    notificationHandler(code) {
        alert(this.settings.msg[code]);
    }
}

const mySettings = {
    n: 16,
    gap: 30,
    strokeColor: "#9B969D",
    padding: 10,
    outBound: 2,
    msg: {
        2: "Please place within the boundary!",
        3: "Please place at an empty cell!",
    },
    circleColor: {
        1: "#E8DEC9",
        2: "black",
    },

};

const game = new Goban(mySettings);