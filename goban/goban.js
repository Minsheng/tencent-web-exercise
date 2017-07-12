/*
 * draw an NxN game board using canvas
 */
function drawGameBoard(ctx, w, h, n, gap, strokeColor) {
    if (!ctx) {
        return;
    }

    ctx.strokeStyle = strokeColor;

    for (let i=0; i<=n; i++) {
        // from top left to top right
        ctx.moveTo(0, i*gap);
        ctx.lineTo(w, i*gap)
        ctx.stroke();

        // from top left to bottom left
        ctx.moveTo(i*gap, 0);
        ctx.lineTo(i*gap, h)
        ctx.stroke();
    }

    ctx.stroke();
}

function userPlay(ev) {
    // convert coordinates to canvas-based
    let x = ev.clientX - c.offsetLeft;
    let y = ev.clientY - c.offsetTop;

    // calculate the cloest point for placing the circle
    x = Math.round(x/GAP)*GAP;
    y = Math.round(y/GAP)*GAP;

    console.log([x,y]);

    if ((x <= 0) || (x >= boardWidth) ||
        (y <= 0) || (y >= boardHeight)) {
        notificationHandler(OUT_BOUND);
        return;
    }

    drawCircle(ctx, x, y, "black");
}

function notificationHandler(code) {
    alert(msg[code]);
}

/*
 * x,y is the coordinate of the intersection of two board lines
 */
function drawCircle(cxt, x, y, color) {
    cxt.fillStyle = color;
    cxt.beginPath();
    ctx.arc(x,y,GAP/2-2,0,2*Math.PI);
    ctx.fill();
}

/* Global vairables */
const N = 16;
const GAP = 30;
const strokeColor = "#9B969D";
const padding = 10;
const OUT_BOUND = 2;

var msg = {
    2: "Please place within the boundary!"
}

var boardWidth = N*GAP,
    boardHeight = N*GAP
    ;

var c = document.getElementById("gameBoard");
c.width = boardWidth+60;
c.height = boardHeight+60;

var ctx = c.getContext("2d");

drawGameBoard(ctx, boardHeight, boardHeight, N, GAP, strokeColor);

c.addEventListener("click", userPlay);
