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
var tracks = {};
for(var i = 0; i < TRACK_COUNT; i++) {
    var trackID = 'track' + i
    tracks[trackID] = {
        instrument:null,
        user:null,
        steps:[]
    };
    for(var j = 0; j < STEP_COUNT; j++) {
        tracks[trackID].steps[j] = {'notes': [0,0,0,0,0]};
    }
}

io.sockets.on('connection', function(socket) {
    // socket.emit('sync', tracks); // sync new user's tracks

    socket.on('sync', function(data) {
        socket.emit('sync', tracks);
    });

    //------- change --------

    socket.on('change', function(data) {
         // Takes in changes to a step in a track
         // {track: 'track1', step: 3, step_data: {'notes': [0,0,0,...]}}
        console.log('----- UPDATE -------');
        console.log(data);
        tracks[data.track].steps[data.step].notes = data.notes;
        socket.broadcast.emit('change', data);
    });

    // ------- claim --------
    socket.on('claim', function(data) {

        // check if we already own a track
        socket.get('track', function(err, userTrack) {
            if (userTrack != null) {
                socket.emit('error', {'msg': 'You can only control one track at a time!'});
                return;
            }

            // assign a track id
            var trackID = undefined;
            for(var i = 0; i < TRACK_COUNT; i++) {
                trackID = 'track' + i;
                console.log(trackID + ' user:' + tracks[trackID].user);
                if (tracks[trackID].user == null) {
                    tracks[trackID].user = 'USERNAME';
                    break;
                }
                trackID = undefined;
            }
            console.log(trackID);
            if (trackID != undefined) {
                socket.set('track', trackID, function() {
                    console.log('assigned ' + trackID);
                    // broadcast claim call to everyone including claimer
                    var data = {
                        'trackID': trackID,
                        'user': {},
                        'timestamp': +new Date(),
                        'instrument': {'name': 'piano', 'filenames': ['hh', 'dj_throb']} // TODO default instruments
                    }
                    io.sockets.emit('claim', data);
                });
            }
            // all tracks taken
            else {
                socket.emit('error', {'msg': 'Sorry all tracks are currently occupied by other users :('});
            }
        });
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




