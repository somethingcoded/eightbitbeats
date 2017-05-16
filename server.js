var express = require('express'),
    nko = require('nko')('ifZu/MT8VJF/wtlB');
var app = express.createServer();
var io = require('socket.io').listen(app);
var port = 7777;

app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);

    app.use('/media', express.static(__dirname + '/media'));
    app.use('/', express.static(__dirname + '/templates/'));
});
app.configure('production', function() {
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
var users = {};
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
                socket.track = null
                tracks[userTrack].user = null;
                tracks[userTrack].instrument = null;
                tracks[userTrack].clearSteps();
                socket.broadcast.emit('release', data);
                console.log('released: ' + data.trackID);
            }
        },
        clearSteps: function() {
            for (var sCnt=0; sCnt < STEP_COUNT; sCnt++) {
                this.steps[sCnt] = {'notes': []};
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

    // clear ownership of track if we own one
    if (userSocket.track != null) {
        tracks[userSocket.track].user = null;
        tracks[userSocket.track].instrument = null;
        tracks[userSocket.track].clearSteps();
        userSocket.broadcast.emit('release', {'trackID': userSocket.track});
        userSocket.track = null;
    }
};

function disconnectUser(userSocket, data) {
    tracks.releaseClaimed(userSocket);
    if (userSocket.username != null && users[userSocket.username] != undefined) {
        console.log(userSocket.username + ' logged out!');
        delete users[userSocket.username];
    }
}

io.sockets.on('connection', function(socket) {

    //----------- LOGIN ------------
    socket.on('login', function(data) {

        // add double username check
        if(!data.name.match(/^[a-zA-Z0-9_]{3,16}$/)) {
            socket.emit('error', {'msg': "Please choose a username that's alphanumeric and up to 16 characters long. Underscores are ok too."});
            return;
        }
        else if(users[data.name] != undefined) {
            socket.emit('error', {'msg': "Sorry, but that username is already being used by someone"});
            return;
        }

        if (socket.username == null) {
            socket.username = data.name;
            users[data.name] = data.name;

            // sync new user's tracks
            socket.emit('sync', {'tracks': tracks.getClaimed(), 'user': data});
            console.log(data.name + ' logged in!');
        }
    });

    //----------- SYNC ------------

    socket.on('sync', function(data) {
        socket.emit('sync', tracks.getClaimed());
    });

    //----------- DISCONNECT ------------
    socket.on('disconnect', function(data) {
        disconnectUser(socket, data);
    });

    //----------- CHANGE ------------

    socket.on('change', function(data) {
         // Takes in changes to a step in a track
         // {track: 'track1', step: 3, notes: [0,0,0,...]}

          if (socket.track != null && data.track == socket.track) {
              tracks[data.track].steps[data.step].notes = data.notes;
              socket.broadcast.emit('change', data);
          }
    });

    //----------- CLAIM ------------

    socket.on('claim', function(data) {
        // check if we already own a track
        if (socket.track != null) {
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
            socket.track = trackID;
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
        }
        // all tracks taken
        else {
            socket.emit('error', {'msg': 'Sorry all tracks are currently occupied by other users :('});
        }
    });

    //----------- RELEASE ------------
    socket.on('release', function() {
        tracks.releaseClaimed(socket);
    });

    //----------- INSTRUMENT ------------
    socket.on('instrument', function(data) {
        // TODO update server track owner data
        if (socket.track != null && socket.track == data.trackID) {
            console.log(data.trackID + ' instrument changed to ' + data.instrument.name);

            if (data.instrument.sounds.length != tracks[data.trackID].instrument.sounds.length) {
                tracks[data.trackID].clearSteps();
            }
            tracks[data.trackID].instrument = data.instrument;
            socket.broadcast.emit('instrument', data);
        }
    });

    //------------ CHAT --------------
    socket.on('chat', function(data) {
        if (socket.username != null) {
            socket.broadcast.emit('chat', {'username': socket.username, 'content': data.content});
        }
    });

    //----------- ADMIN --------------
    socket.on('admindc', function(data) {
        if (data.password == 'g4m3ch4ng3r') {
            for (var i=0; i < TRACK_COUNT; i++) {
                var trackID = 'track' + i;
                if (tracks[trackID] != undefined && tracks[trackID].user != null && tracks[trackID].user.name == data.username) {
                    // TODO, refactor this to ensure DRY
                    if (socket.username != data.username) {
                        tracks[trackID].user = null;
                        tracks[trackID].instrument = null;
                        tracks[trackID].clearSteps();
                        io.sockets.emit('release', {'trackID': trackID});
                        console.log('** ' + socket.username + ' KICKED ' + data.username);
                    }
                }
            }
        }
    });
});
