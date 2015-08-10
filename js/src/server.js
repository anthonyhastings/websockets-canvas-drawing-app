'use strict';

// Create an http server.
var app = require('http').createServer();

// Hook Socket.IO up to the server, listening for requests.
var io = require('socket.io').listen(app);

// Tell the http server to listen on a specific port.
app.listen(1234);

// Handler run whenever a new socket connection from a client is made.
io.sockets.on('connection', function(socket) {
    console.log('Connection established.');

    // Broadcast the mouse movement to everyone bar the original sender.
    socket.on('mousemove', function(data) {
        socket.broadcast.emit('moving', data);
    });
});
