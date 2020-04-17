const eraserSizeSlider = document.getElementById('eraserRadiusSlider');
const eraserRadiusValueDisplay = document.getElementById('eraserRadiusValue');
const lineWidthSlider = document.getElementById('lineWidthSlider');
const lineWidthValueDisplay = document.getElementById('lineWidthValue');
const colorPicker = document.getElementById('colorPicker');
const clean_btn = document.getElementById('clean-canvas-btn');
const pen_btn = document.getElementById('use-pen-btn');
const eraser_btn = document.getElementById('use-erase-btn');
const save_btn = document.getElementById('save-canvas-btn');
const undo_btn = document.getElementById('undo-canvas-btn');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// set download
let saveCanvas = () => {
    let dataURL = canvas.toDataURL();
    document.getElementById('save-canvas-anchor').href = dataURL;
    document.getElementById('save-canvas-anchor').download = 'scribble-panel';
    console.log(dataURL, document.getElementById('save-canvas-anchor'));
};
// Show erase radius
eraserRadiusValueDisplay.innerHTML = eraserSizeSlider.value;
eraserSizeSlider.oninput = function () {
    eraserRadiusValueDisplay.innerHTML = this.value;
};

// Show line width
lineWidthValueDisplay.innerHTML = lineWidthSlider.value;
lineWidthSlider.oninput = function () {
    lineWidthValueDisplay.innerHTML = this.value;
    LINE_WIDTH = this.value;
};
// change color
colorPicker.oninput = function () {
    console.log(this.value);
    PEN_COLOR = this.value;
};

// socket.io
const clientSocket = io();

clientSocket.on('msg', (data) => console.log(data));
clientSocket.on('draw', (data) => {
    let { prevX, prevY, x, y, lineWidth, color } = data;
    drawLine(prevX, prevY, x, y, lineWidth, color);
});
clientSocket.on('erase', (data) => {
    let { x, y, eraserSize } = data;
    eraseLine(x, y, eraserSize);
});
clientSocket.on('clean', () => {
    cleanCanvas();
});
clientSocket.on('chooseDefaultPenColor', (penColor) => {
    PEN_COLOR = penColor; // set color
    colorPicker.value = PEN_COLOR; // set color picker
});
////////

// parameter for draw a line
let PEN_COLOR = '#baba55';
let LINE_WIDTH = 5;
let prevX = 0,
    prevY = 0,
    x = 0,
    y = 0;
let isDrawLineStart = false;
let using_pen = true;
let using_eraser = false;

// Canvas
let cleanCanvas = () => {
    prevX = 0;
    prevY = 0;
    x = 0;
    y = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

let drawColorCircle = (centerX, centerY, radius, color) => {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    ctx.fillStyle = color;

    ctx.fill();
    ctx.closePath();
};

let drawLine = (prevX, prevY, x, y, lineWidth, color) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = 'solid';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
};

let eraseLine = (x, y, radius) => {
    drawColorCircle(x, y, radius, '#f0f0f0');
};

let drawOnCanvas = (curX, curY, state) => {
    if (state === 'dragStart') {
        prevX = 0;
        prevY = 0;
        x = curX;
        y = curY;
        isDrawLineStart = true;
    } else if (state === 'drag') {
        if (isDrawLineStart) {
            prevX = x;
            prevY = y;
            x = curX;
            y = curY;
            if (using_pen) {
                drawLine(prevX, prevY, x, y, LINE_WIDTH, PEN_COLOR);
                clientSocket.emit('drawRequest', {
                    prevX: prevX,
                    prevY: prevY,
                    x: x,
                    y: y,
                    lineWidth: LINE_WIDTH,
                    color: PEN_COLOR,
                });
            }
            if (using_eraser) {
                eraseLine(x, y, eraserSizeSlider.value);
                clientSocket.emit('eraseRequest', {
                    x: x,
                    y: y,
                    eraserSize: eraserSizeSlider.value,
                });
            }
        }
    } else {
        ctx.save();
        isDrawLineStart = false;
    }
};

canvas.addEventListener('mousedown', (e) => {
    // drawOnCanvas(e.offsetX, e.offsetY, 'dragStart');
    drawOnCanvas(
        e.pageX - canvas.offsetLeft,
        e.pageY - canvas.offsetTop,
        'dragStart'
    );
});
canvas.addEventListener('mousemove', (e) => {
    // drawOnCanvas(e.offsetX, e.offsetY, 'drag');
    drawOnCanvas(
        e.pageX - canvas.offsetLeft,
        e.pageY - canvas.offsetTop,
        'drag'
    );
});
canvas.addEventListener('mouseup', (e) => {
    // drawOnCanvas(e.offsetX, e.offsetY, 'dragEnd');
    drawOnCanvas(
        e.pageX - canvas.offsetLeft,
        e.pageY - canvas.offsetTop,
        'dragEnd'
    );
});
canvas.addEventListener('mouseout', (e) => {
    // drawOnCanvas(e.offsetX, e.offsetY, 'dragEnd');
    drawOnCanvas(
        e.pageX - canvas.offsetLeft,
        e.pageY - canvas.offsetTop,
        'dragEnd'
    );
});

canvas.addEventListener('touchstart', (e) => {
    // console.log("start",e.touches.length, e.targetTouches.length);
    if (e.touches.length == 1) {
        e.preventDefault();
        let touch = e.touches[0];
        drawOnCanvas(
            touch.pageX - canvas.offsetLeft,
            touch.pageY - canvas.offsetTop,
            'dragStart'
        );
    }
});
canvas.addEventListener('touchmove', (e) => {
    // console.log("move",e.touches.length, e.targetTouches.length);
    if (e.touches.length == 1) {
        e.preventDefault();
        let touch = e.touches[0];
        drawOnCanvas(
            touch.pageX - canvas.offsetLeft,
            touch.pageY - canvas.offsetTop,
            'drag'
        );
    }
});
canvas.addEventListener('touchend', (e) => {
    // console.log('end',e.touches.length, e.targetTouches.length);
    if (e.touches.length == 1) {
        e.preventDefault();
        let touch = e.touches[0];
        drawOnCanvas(
            touch.pageX - canvas.offsetLeft,
            touch.pageY - canvas.offsetTop,
            'dragEnd'
        );
    }
});

canvas.addEventListener('touchcancel', (e) => {
    console.log('cancel', e.touches.length, e.targetTouches.length);
    if (e.touches.length == 1) {
        e.preventDefault();
        let touch = e.touches[0];
        drawOnCanvas(
            touch.pageX - canvas.offsetLeft,
            touch.pageY - canvas.offsetTop,
            'dragEnd'
        );
    }
});

clean_btn.addEventListener('click', (e) => {
    e.preventDefault();
    let willClean = confirm('Want clean?');
    if (willClean) {
        cleanCanvas();
        clientSocket.emit('cleanRequest');
    }
});

pen_btn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('pen');
    using_pen = true;
    using_eraser = false;
});

eraser_btn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('eraser');
    using_pen = false;
    using_eraser = true;
});

save_btn.addEventListener('click', (e) => {
    saveCanvas();
});

undo_btn.addEventListener('click', (e) => {
    ctx.restore();
});
