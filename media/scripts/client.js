var socket = io.connect();
socket.on('connect', function() {
});

//------- SERVER EVENT RECEIVERS -------

socket.on('disconnect', function(data) {
    app.trigger('error', {'msg': "You've been disconnected from the server :("});
});

socket.on('sync', function(data) {
    /*
      get user info
      update state with all track data
      loop through tracks in data
        -create track if doesn't exist
        -loop through steps and update for track
        {'track0': {'instrument':null, 'user': null, 'steps': [{'notes': [0,0,0]}, {'notes': [0,0,0]}]}
    */
    var user = new User(data.user);
    new UserView({model: user});
    app.set({'user': user});
    app.player.syncTracks(data.tracks);

    socket.on('change', function(data) {
        console.log(data)
         // update state of single point on a given track
         // {'track': 0, 'step': 1, 'notes': [1,0,1,0]}
        app.player.tracks.get(data.track).steps.at(data.step).set({notes: data.notes});
    });

    socket.on('claim', function(data) {
        // update a track as claimed. render new user avatar etc
        app.player.createTrack(data.trackID, data.user, data.timestamp, data.instrument);
    });

    socket.on('release', function(data) {
        app.player.tracks.remove(player.tracks.get(data.trackID));
        $('#mouse_' + data.trackID).remove();
    });
    socket.on('instrument', function(data) {
        app.player.tracks.get(data.trackID).set({'instrument': new Instrument(data.instrument)});
    });

    socket.on('chat', function(data) {
        app.chatLog.messages.add(data);
    });
});


socket.on('error', function(data) {
    app.trigger('error', data);
});
