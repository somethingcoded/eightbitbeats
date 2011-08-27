var express = require('express'),
    nko = require('nko')('ifZu/MT8VJF/wtlB');
var app = express.createServer();
var io = require('socket.io').listen(app);

app.use('/media', express.static(__dirname + '/media'));
app.use('/', express.static(__dirname + '/templates/'));

app.listen(7777);
console.log('8bitbeats! Listening on port ' + app.address().port);

var TRACK_COUNT = 8;
var STEP_COUNT = 64;
var tracks = [];
for(var i = 0; i < TRACK_COUNT; i++) {
    tracks[i] = {
        instrument:null,
        user:null,
        steps:[]
    };
    for(var j = 0; j < STEP_COUNT; j++) {
        tracks[i].steps[j] = {'notes': [0,0,0,0,0]};
    }
}
tracks[0].steps[1].notes[1] = 1;

io.sockets.on('connection', function(socket) {
    socket.emit('sync', tracks); // sync new user's tracks

    socket.on('sync', function(data) {
        socket.emit('sync', tracks);
    });

    /**
     * change
     *  Takes in changes to a step in a track
     *  {track: 1, step: 3, step_data: {'notes': [0,0,0,...]}}
     */
    socket.on('change', function(data) {

        console.log('----- UPDATE -------');
        console.log(data);
        tracks[data.track].steps[data.step] = data.step_data;
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

    socket.on('instrument', function(data) {
        // TODO update server track owner data
        socket.broadcast.emit('instrument', data);
    });
});
