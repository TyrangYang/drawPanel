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
    let { x, y } = data;
    eraseLine(x, y, 10);
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
let isMouseDown = false;
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

canvas.addEventListener('mousedown', (e) => {
    prev_x = 0;
    prev_y = 0;
    x = e.offsetX;
    y = e.offsetY;
    isMouseDown = true;
});
canvas.addEventListener('mousemove', (e) => {
    // console.log('move');
    // drawColorCircle(e.offsetX, e.offsetY, 3, PEN_COLOR);
    if (isMouseDown) {
        prev_x = x;
        prev_y = y;
        x = e.offsetX;
        y = e.offsetY;
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
            });
        }
    }
});
canvas.addEventListener('mouseup', (e) => {
    isMouseDown = false;
});
canvas.addEventListener('mouseout', (e) => {
    isMouseDown = false;
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
