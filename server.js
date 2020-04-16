const express = require('express');
const path = require('path');
const http = require('http');
const socket_io = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket_io(server);

const PORT = process.env.PORT || 5000;

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// set socket.io
let colorFlag = 0;
const DEFAULT_PEN_COLORS = ['red', 'black', '#baba55', 'purple'];
io.on('connection', (server_socket) => {
    console.log('New one in');
    server_socket.emit('msg', 'hi');
    colorFlag = (colorFlag + 1) % DEFAULT_PEN_COLORS.length;
    server_socket.emit('chooseDefaultPenColor', DEFAULT_PEN_COLORS[colorFlag]);
    server_socket.emit('msg', DEFAULT_PEN_COLORS[colorFlag]);
    server_socket.on('drawRequest', (data) => {
        server_socket.broadcast.emit('draw', data);
    });
    server_socket.on('eraseRequest', (data) => {
        server_socket.broadcast.emit('erase', data);
    });
    server_socket.on('cleanRequest', () => {
        server_socket.broadcast.emit('clean');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
