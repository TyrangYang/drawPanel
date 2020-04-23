const moment = require('moment');
const express = require('express');
const path = require('path');
const http = require('http');
const socket_io = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket_io(server);

const PORT = process.env.PORT || 3000;

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// set socket.io

// set default pen color
let colorFlag = 0;
const DEFAULT_PEN_COLORS = ['#e30000', '#030303', '#baba55', '#941751'];
// set socketId and room map
let record = {};
io.on('connection', (server_socket) => {
    // log
    console.log(
        `New user(socketId: ${server_socket.id}) join in at ${moment().format(
            'MMMM Do YYYY, h:mm:ss a'
        )}`
    );
    // select a pen color for user
    server_socket.emit('chooseDefaultPenColor', DEFAULT_PEN_COLORS[colorFlag]);
    colorFlag = (colorFlag + 1) % DEFAULT_PEN_COLORS.length;
    server_socket.emit('msg', DEFAULT_PEN_COLORS[colorFlag]);
    // a user join a room
    server_socket.on('joinRoom', ({ roomName }) => {
        server_socket.join(roomName);
        record[server_socket.id] = roomName;
        console.log(
            `User(socketId: ${server_socket.id}) join room (name: ${roomName})`
        );
        server_socket.emit('msg', `Welcome to room ${roomName}`);
    });

    // canvas behaviors broadcast
    server_socket.on('drawRequest', (data) => {
        server_socket.broadcast.to(record[server_socket.id]).emit('draw', data);
    });
    server_socket.on('eraseRequest', (data) => {
        server_socket.broadcast
            .to(record[server_socket.id])
            .emit('erase', data);
    });
    server_socket.on('cleanRequest', () => {
        server_socket.broadcast.to(record[server_socket.id]).emit('clean');
    });

    server_socket.on('disconnect', () => {
        delete record[server_socket.id];
        console.log(record);
        console.log(
            `User(socketId: ${server_socket.id}) left at ${moment().format(
                'MMMM Do YYYY, h:mm:ss a'
            )}`
        );
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
