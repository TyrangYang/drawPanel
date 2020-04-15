const express = require('express');
const path = require('path');
const http = require('http');
const socket_io = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket_io(server);

const PORT = 3000 || process.env.PORT;

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// set socket.io
io.on('connection', (server_socket) => {
    console.log('New one in');
    server_socket.emit('msg', 'hi');
    server_socket.on('drawMsg', (data) => {
        server_socket.broadcast.emit('draw', data);
    });
    server_socket.on('eraseMsg', (data) => {
        server_socket.broadcast.emit('erase', data);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
