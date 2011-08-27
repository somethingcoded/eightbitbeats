var express = require('express'),
    nko = require('nko')('ifZu/MT8VJF/wtlB');
var app = express.createServer();
var io = require('socket.io').listen(app);

app.use('/media', express.static(__dirname + '/media'));
app.use('/', express.static(__dirname + '/templates/'));

app.listen(7777);
console.log('8bitbeats! Listening on port ' + app.address().port);

var tracks = {
    track1: {
        owner: undefined,
        state: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    },
    track2: {
        owner: undefined,
        state: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    },
};

io.sockets.on('connection', function(socket) {
    socket.emit('sync', tracks); // sync new user's tracks

    socket.on('change', function(data) {
        // TODO update server track data
        socket.broadcast.emit('change', data);
    });

    socket.on('claim', function(data) {
        // TODO update server track owner data
        socket.broadcast.emit('claim', data);
    });

    socket.on('release', function(data) {
        // TODO update server track owner data
        socket.broadcast.emit('release', data);
    });
});
