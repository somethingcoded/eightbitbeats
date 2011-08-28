var express = require('express'),
    nko = require('nko')('ifZu/MT8VJF/wtlB');
var app = express.createServer();
var io = require('socket.io').listen(app);
var port = 7777;

var transports = ['websocket', 'flashsocket',  'xhr-polling', 'htmlfile', 'jsonp-polling'];
io.configure(function() {
    io.set('transports', transports);
});
io.configure('production', function(){
    io.enable('browser client etag');
    io.set('log level', 1);
});

app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);

    app.use('/media', express.static(__dirname + '/media'));
    app.use('/', express.static(__dirname + '/templates/'));
});
app.configure('production', function() {
    port = 80;
    app.set('log level', 1);
    app.use(express.errorHandler());
});
app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.listen(port);
console.log("      `,,,,,    ,,,          ,,     ,,`              ,,,                                    `,,                    \n      `....,    ,.,          ..     ,.`              ,.,                                    `..                    \n      `::::,    ,.,          ::     ,.`              ,.,                                    `..                    \n    ,,,    `,,  ,,,,,,,,         ,,,,,,,,            ,,,,,,,,       ,,,,,       :,,,,,,:  ,,,,,,,,    :,,,,,,:     \n    ,,,    `,,  ,,,,,,,,         ,,,,,,,,            ,,,,,,,,       ,,,,,       :,,,,,,:  ,,,,,,,,    :,,,,,,:     \n      `::::,    ,,,     ::`  ::     ,,`              ,,,    `::  ,::  ,,,::`  ::     :,:    `,,     ::,,:          \n      `,,,,,    ,,,     ,,`  ,,     ,,`              :,,    `,,  ,,,  ,,,,,`  ,,     :,:    `,,     ,,,,:          \n      `::::,    ,,:     ,,`  ,,     ,,`              :,,    `,,  ,,:  ,::::`  ,,     :,:    `,,     :::::          \n    ::,    `::  ,::     ::`  ::     ::`              ::,    `::  ,::::`       ::     :::    `::          :::::     \n    ::,    `::  ,::     ::`  ::     ::`              ::,    `::  ,::::`       ::     :::    `::          :::::     \n      `::::,    ,:::::::     ::       ,::            :::::::,       :::::       ::::::::       ::,  :::::::        \n      `::::,    ,:::::::     ::       ,::            :::::::,       :::::       ::::::::       ::,  :::::::        \n      `::::,    ,:::::::     ::       ,::            :::::::,       :::::       ::::::::       ::,  :::::::        \n");
console.log('eightbitbeats.com! Listening on port ' + app.address().port);
var TRACK_COUNT = 8;
var STEP_COUNT = 64;
var tracks = {};
for(var i = 0; i < TRACK_COUNT; i++) {
    var trackID = 'track' + i
    tracks[trackID] = {
        instrument:null,
        user:null,
        steps:[],
        timestamp: null,
        release: function(data, userTrack) {
            // data = {'trackID': 'track0' }
            if (userTrack != null && userTrack == data.trackID) {
                // clear ownership of track
                socket.set('track', null, function() {
                    tracks[userTrack].user = null;
                    tracks[userTrack].instrument = null;
                    socket.broadcast.emit('release', data);
                    console.log('released: ' + data.trackID);
                });
            }
        }
    };
    for(var j = 0; j < STEP_COUNT; j++) {
        tracks[trackID].steps[j] = {'notes': []};
    }
}
tracks.getClaimed = function() {
    var trackID;
    var claimedTracks = {};
    for(var i = 0; i < TRACK_COUNT; i++) {
        trackID = 'track' + i;
        if (tracks[trackID].user != null) {
            claimedTracks[trackID] = tracks[trackID];
        }
    }
    return claimedTracks;
};

tracks.releaseClaimed = function(userSocket) {
    userSocket.get('track', function(err, userTrack) {

        // clear ownership of track if we own one
        if (userTrack != null) {
            userSocket.set('track', null, function() {
                tracks[userTrack].user = null;
                userSocket.broadcast.emit('release', {'trackID': userTrack});
            });
        }
    });
};

io.sockets.on('connection', function(socket) {
    // sync new user's tracks
    socket.emit('sync', tracks.getClaimed());

    //----------- SYNC ------------

    socket.on('sync', function(data) {
        socket.emit('sync', tracks.getClaimed());
    });

    //----------- DISCONNECT ------------
    socket.on('disconnect', function(data) {
        socket.get('track', function(err, userTrack) {
            tracks.releaseClaimed(socket);
        });
    });

    //----------- CHANGE ------------

    socket.on('change', function(data) {
         // Takes in changes to a step in a track
         // {track: 'track1', step: 3, notes: [0,0,0,...]}

        socket.get('track', function(err, userTrack) {
            if (userTrack != null && data.track == userTrack) {
                tracks[data.track].steps[data.step].notes = data.notes;
                socket.broadcast.emit('change', data);
            }
        });
    });

    //----------- CLAIM ------------

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
                if (tracks[trackID].user == null) {
                    tracks[trackID].user = data.user;
                    tracks[trackID].instrument = data.instrument;
                    break;
                }
                trackID = undefined;
            }
            if (trackID != undefined) {
                socket.set('track', trackID, function() {
                    console.log('assigned ' + trackID);
                    // broadcast claim call to everyone including claimer
                    var claimTimestamp = +new Date();
                    tracks[trackID].timestamp = claimTimestamp;
                    var return_data = {
                        'trackID': trackID,
                        'user': data.user,
                        'timestamp': claimTimestamp,
                        'instrument': data.instrument
                    };
                    io.sockets.emit('claim', return_data);
                });
            }
            // all tracks taken
            else {
                socket.emit('error', {'msg': 'Sorry all tracks are currently occupied by other users :('});
            }
        });
    });

    //----------- RELEASE ------------
    socket.on('release', function() {
        tracks.releaseClaimed(socket);
    });

    //----------- INSTRUMENT ------------
    socket.on('instrument', function(data) {
        // TODO update server track owner data
        socket.get('track', function(err, userTrack) {
            if (userTrack != null && userTrack == data.trackID) {
                console.log(data.trackID + ' instrument changed to ' + data.instrument.name);
                socket.broadcast.emit('instrument', data);
            }
        });
    });
});




