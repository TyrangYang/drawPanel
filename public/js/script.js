const canvas = document.getElementById('canvas');
const clean_btn = document.getElementById('clean-canvas-btn');
const pen_btn = document.getElementById('use-pen-btn');
const eraser_btn = document.getElementById('use-erase-btn');
const ctx = canvas.getContext('2d');
// socket.io
const client_socket = io();

client_socket.on('msg', (data) => console.log(data));
client_socket.on('draw', (data) => {
    let { prev_x, prev_y, x, y } = data;
    drawLine(prev_x, prev_y, x, y);
});
client_socket.on('erase', (data) => {
    let { x, y } = data;
    eraseLine(x, y, 10);
});

let prev_x = 0,
    prev_y = 0,
    x = 0,
    y = 0;
let isMouseDown = false;
let using_pen = true;
let using_eraser = false;

ctx.fillStyle = 'solid';
ctx.strokeStyle = '#baba55';
ctx.lineWidth = 5;
ctx.lineCap = 'round';

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

let drawLine = (prev_x, prev_y, x, y) => {
    ctx.beginPath();
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
    if (isMouseDown) {
        prev_x = x;
        prev_y = y;
        x = e.offsetX;
        y = e.offsetY;
        console.log(using_pen, using_eraser);
        if (using_pen) {
            drawLine(prev_x, prev_y, x, y);
            client_socket.emit('drawMsg', {
                prev_x: prev_x,
                prev_y: prev_y,
                x: x,
                y: y,
            });
        }
        if (using_eraser) {
            eraseLine(x, y, 10);
            client_socket.emit('eraseMsg', {
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
