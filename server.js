var conf = require('./conf'),
    express = require('express'),
    // everyauth = require('everyauth'),
    // eightbitme = require('./lib/eightbitme'),
    http = require('http'),
    _ = require('underscore'),
    plate = require('plate'),
    plateconf = require('./plateconf'),
    plateUtils = require('./node_modules/plate/lib/utils'),
    mongoose = require('mongoose'),
    mongooseAuth = require('mongoose-auth'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId;



// // Everyauth stuff
// everyauth.everymodule.findUserById(eaUtils.findUserById);
// 
// everyauth.twitter
//     .consumerKey('bPbCynUWdNXLcyt0hb5Tsg')
//     .consumerSecret('SCobLZc3ncEaR8qBAnPn929YcuFvghr2ru2FpFR74')
//     .callbackPath('/auth/twitter/callback')
//     .findOrCreateUser(eaUtils.findOrCreateUser)
// .redirectPath('/');
// 
// everyauth.facebook
//     .appId('287592404587592')
//     .appSecret('047d93f6c0370cce2044f91a20b55d95')
//     .findOrCreateUser(eaUtils.findOrCreateUser)
//     .redirectPath('/');
// 
// everyauth.debug = true;


var app = express.createServer();
var io = require('socket.io').listen(app);

var transports = ['websocket', 'flashsocket',  'xhr-polling', 'htmlfile', 'jsonp-polling'];

var stringifyFilter = function(callback, input) {
    callback(null, new plateUtils.SafeString(JSON.stringify(input)));
}

plate.Template.Meta.registerFilter('stringify', stringifyFilter);

plateconf(app, __dirname + '/templates');

// Schema

var User;

var UserSchema = new Schema({
        username: String
});



UserSchema.plugin(mongooseAuth, {
    everymodule: {
      everyauth: {
          User: function () {
            return User;
          }
      }
    }
  , facebook: {
      everyauth: {
          myHostname: conf.hostname
        , appId: conf.fb.appId
        , appSecret: conf.fb.appSecret
        , redirectPath: '/'
      }
    }
  , twitter: {
      everyauth: {
          myHostname: conf.hostname
        , consumerKey: conf.twit.consumerKey
        , consumerSecret: conf.twit.consumerSecret
        , redirectPath: '/'
      }
    }
  , password: {
        loginWith: 'email'
      , extraParams: {
            phone: String
          , name: {
                first: String
              , last: String
            }
        }
      , everyauth: {
            getLoginPath: '/login'
          , postLoginPath: '/login'
          , loginView: 'login.jade'
          , getRegisterPath: '/register'
          , postRegisterPath: '/register'
          , registerView: 'register.jade'
          , loginSuccessRedirect: '/'
          , registerSuccessRedirect: '/'
        }
    }
  , github: {
      everyauth: {
          myHostname: conf.hostname
        , appId: conf.github.appId
        , appSecret: conf.github.appSecret
        , redirectPath: '/'
      }
    }
  , instagram: {
      everyauth: {
          myHostname: conf.hostname
        , appId: conf.instagram.clientId
        , appSecret: conf.instagram.clientSecret
        , redirectPath: '/'
      }
    }
});

UserSchema.pre('save', function(next) {
    this.username = this._doc.twit.screenName || this._doc.fb.username;
    next();
});

mongoose.model('User', UserSchema);

mongoose.connect('mongodb://localhost/'+ conf.dbName);

User = mongoose.model('User');

var RoomSchema = new Schema({
    title: String,
    slug: String,
    khanId: String,
});

RoomSchema.pre('save', function(next) {
    this.slug = this.title.toLowerCase().replace(/ /g, '-');
    next(); 
});



io.configure(function() {
    io.set('transports', transports);
});
io.configure('production', function(){
    io.enable('browser client etag');
    io.set('log level', 1);
});

app.configure(function() {
    app.set('views', __dirname + '/templates/');
    app.set('view engine', 'jade');
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({secret: '$3CR3#'}));
    app.use(mongooseAuth.middleware());
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

// app.register('.html', {
//     compile: function (str, options) {
//         var template = _.template(str);
//         return function (locals) {
//           return template(locals);
//         };
//     }
// });

app.get('/', function(req, res){
    console.log('*****SESSION: ' + req.user);
    res.render('index.html', {layout: false});
});

mongooseAuth.helpExpress(app);

app.listen(conf.port);
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
                socket.set('track', null, function() {
                    tracks[userTrack].user = null;
                    tracks[userTrack].instrument = null;
                    tracks[userTrack].clearSteps();
                    socket.broadcast.emit('release', data);
                    console.log('released: ' + data.trackID);
                });
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
    userSocket.get('track', function(err, userTrack) {

        // clear ownership of track if we own one
        if (userTrack != null) {
            userSocket.set('track', null, function() {
                tracks[userTrack].user = null;
                tracks[userTrack].instrument = null;
                tracks[userTrack].clearSteps();
                userSocket.broadcast.emit('release', {'trackID': userTrack});
            });
        }
    });
};

function disconnectUser(userSocket, data) {
    userSocket.get('track', function(err, userTrack) {
        tracks.releaseClaimed(userSocket);
    });
    userSocket.get('name', function(err, username) {
        if (username != null && users[username] != undefined) {
            console.log(username + ' logged out!');
            delete users[username];
        }
    });
}

io.sockets.on('connection', function(socket) {

    //----------- LOGIN ------------
    socket.on('login', function(data) {

        // add double username check
        if(!data.name.match(/^[a-zA-Z0-9_ ]{3,23}$/)) {
            socket.emit('error', {'msg': "Please choose a username that's alphanumeric and up to 23 characters long. Underscores are ok too."});
            return;
        }
        else if(users[data.name] != undefined) {
            socket.emit('error', {'msg': "Sorry, but that username is already being used by someone"});
            return;
        }

        socket.get('name', function(err, username) {
            if (username == null) {
                socket.set('name', data.name, function() {
                    users[data.name] = data.name;

                    // sync new user's tracks
                    socket.emit('sync', {'tracks': tracks.getClaimed(), 'user': data});
                    console.log(data.name + ' logged in!');
                });
            }
        });
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

                if (data.instrument.sounds.length != tracks[data.trackID].instrument.sounds.length) {
                    tracks[data.trackID].clearSteps();
                }
                tracks[data.trackID].instrument = data.instrument;
                socket.broadcast.emit('instrument', data);
            }
        });
    });

    //------------ SAVE --------------
    socket.on('save', function(data) {
        // save the beat
    });

    //------------ CHAT --------------
    socket.on('chat', function(data) {
        socket.get('name', function(err, username) {
            if (username != null) {
                socket.broadcast.emit('chat', {'username': username, 'content': data.content});
            }
        });
    });
});

