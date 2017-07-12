/*
 * Drag and drop a sqaure in the browser window
 * Author: Minsheng Zheng
 */

function dragStart(ev) {
    // need to find the offset position
    var event = ev || window.event; //IE

    var offsetX = event.offsetX || (event.clientX - event.target.offsetLeft);
    var offsetY = event.offsetY || (event.clientY - event.target.offsetTop);

    event.dataTransfer.setData("application/json", JSON.stringify(
        [event.target.id, offsetX, offsetY]
    ));
}

function dragMove(ev) {
    var event = ev || window.event; //IE
    if(event.preventDefault) event.preventDefault();  //W3C
    if(event.returnValue) event.returnValue = false;  //IE
    return false; // prevent default behaviour
}

function dragStop(ev) {
    var event = ev || window.event; //IE
    if(event.preventDefault) event.preventDefault();  //W3C
    if(event.returnValue) event.returnValue = false;  //IE

    var target = document.getElementById(sqrId);

    // since it is dropping the div's top left corner to the cursor's location,
    // need to find the offset from inside the div where the cursor is dragging
    var offset = JSON.parse(event.dataTransfer.getData("application/json"));
    target.style.left = event.clientX - offset[1] + "px";
    target.style.top = event.clientY - offset[2] + "px";
}

function setCanvasSize(cid) {
    var canvas = document.getElementById(cid);
    var w = window.innerWidth;
    var h = window.innerHeight;

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
}

/* Main execution block */
var sqrId = "square";
var canvasId = "canvas";

// initialize canvas size
setCanvasSize(canvasId);

var target = document.getElementById(sqrId);
target.addEventListener("dragstart", dragStart, false);
document.body.addEventListener("dragover", dragMove, false);
document.body.addEventListener("drop", dragStop, false);
