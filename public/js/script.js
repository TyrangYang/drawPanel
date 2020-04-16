const clean_btn = document.getElementById('clean-canvas-btn');
const eraserSizeSlider = document.getElementById('eraserRadiusSlider');
const eraserRadiusValueDisplay = document.getElementById('eraserRadiusValue');
const lineWidthSlider = document.getElementById('lineWidthSlider');
const lineWidthValueDisplay = document.getElementById('lineWidthValue');
const colorPicker = document.getElementById('colorPicker');
const pen_btn = document.getElementById('use-pen-btn');
const eraser_btn = document.getElementById('use-erase-btn');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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
const client_socket = io();

client_socket.on('msg', (data) => console.log(data));
client_socket.on('draw', (data) => {
    let { prev_x, prev_y, x, y, lineWidth, color } = data;
    drawLine(prev_x, prev_y, x, y, lineWidth, color);
});
client_socket.on('erase', (data) => {
    let { x, y, eraserSize } = data;
    eraseLine(x, y, eraserSize);
});
client_socket.on('clean', () => {
    cleanCanvas();
});
client_socket.on('chooseDefaultPenColor', (penColor) => {
    PEN_COLOR = penColor; // set color
    colorPicker.value = PEN_COLOR; // set color picker
});
////////

// parameter for draw a line
let PEN_COLOR = '#baba55';
let LINE_WIDTH = 5;
let prev_x = 0,
    prev_y = 0,
    x = 0,
    y = 0;
let isDrawLineStart = false;
let using_pen = true;
let using_eraser = false;

// Canvas
let cleanCanvas = () => {
    prev_x = 0;
    prev_y = 0;
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

let drawLine = (prev_x, prev_y, x, y, lineWidth, color) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = 'solid';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.moveTo(prev_x, prev_y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
};

let eraseLine = (x, y, radius) => {
    drawColorCircle(x, y, radius, '#f0f0f0');
};

let drawOnCanvas = (curX, curY, state) => {
    if (state === 'dragStart') {
        prev_x = 0;
        prev_y = 0;
        x = curX;
        y = curY;
        isDrawLineStart = true;
    } else if (state === 'drag') {
        if (isDrawLineStart) {
            prev_x = x;
            prev_y = y;
            x = curX;
            y = curY;
            if (using_pen) {
                drawLine(prev_x, prev_y, x, y, LINE_WIDTH, PEN_COLOR);
                client_socket.emit('drawRequest', {
                    prev_x: prev_x,
                    prev_y: prev_y,
                    x: x,
                    y: y,
                    lineWidth: LINE_WIDTH,
                    color: PEN_COLOR,
                });
            }
            if (using_eraser) {
                eraseLine(x, y, eraserSizeSlider.value);
                client_socket.emit('eraseRequest', {
                    x: x,
                    y: y,
                    eraserSize: eraserSizeSlider.value,
                });
            }
        }
    } else {
        isDrawLineStart = false;
    }
};

canvas.addEventListener('mousedown', (e) => {
    // drawOnCanvas(e.offsetX, e.offsetY, 'dragStart');
    drawOnCanvas(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop, 'dragStart');
});
canvas.addEventListener('mousemove', (e) => {
    // drawOnCanvas(e.offsetX, e.offsetY, 'drag');
    drawOnCanvas(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop, 'drag');
});
canvas.addEventListener('mouseup', (e) => {
    // drawOnCanvas(e.offsetX, e.offsetY, 'dragEnd');
    drawOnCanvas(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop, 'dragEnd');
});
canvas.addEventListener('mouseout', (e) => {
    // drawOnCanvas(e.offsetX, e.offsetY, 'dragEnd');
    drawOnCanvas(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop, 'dragEnd');
});

canvas.addEventListener('touchstart', e => {
    // console.log("start",e.touches.length, e.targetTouches.length);
    if(e.touches.length == 1){
        e.preventDefault();
        let touch = e.touches[0]; 
        drawOnCanvas(touch.pageX - canvas.offsetLeft, touch.pageY - canvas.offsetTop, 'dragStart');
    }
});
canvas.addEventListener('touchmove', e => {
    // console.log("move",e.touches.length, e.targetTouches.length);
    if(e.touches.length == 1){
        e.preventDefault();
        let touch = e.touches[0]; 
        drawOnCanvas(touch.pageX - canvas.offsetLeft, touch.pageY - canvas.offsetTop, 'drag');

    }
});
canvas.addEventListener('touchend', e => {
    // console.log('end',e.touches.length, e.targetTouches.length);
    if(e.touches.length == 1){
        e.preventDefault();
        let touch = e.touches[0]; 
        drawOnCanvas(touch.pageX - canvas.offsetLeft, touch.pageY - canvas.offsetTop, 'dragEnd');
    }
});

canvas.addEventListener('touchcancel', e => {
    console.log('cancel',e.touches.length, e.targetTouches.length);
    if(e.touches.length == 1){
        e.preventDefault();
        let touch = e.touches[0]; 
        drawOnCanvas(touch.pageX - canvas.offsetLeft, touch.pageY - canvas.offsetTop, 'dragEnd');
    }
});

clean_btn.addEventListener('click', (e) => {
    e.preventDefault();
    cleanCanvas();
    client_socket.emit('cleanRequest');
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
