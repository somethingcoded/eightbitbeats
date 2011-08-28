var socket = io.connect();
socket.on('connect', function() {
});

//------- SERVER EVENT RECEIVERS -------

socket.on('disconnect', function(data) {
    console.log('Disconnected from server :(')
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
    app.set({'user': new User(data.user)});
    player.syncTracks(data.tracks);

    socket.on('change', function(data) {
         // update state of single point on a given track
         // {'track': 0, 'step': 1, 'notes': [1,0,1,0]}
        player.tracks.get(data.track).steps.at(data.step).set({notes: data.notes});
    });

    socket.on('claim', function(data) {
        // update a track as claimed. render new user avatar etc
        player.createTrack(data.trackID, data.user, data.timestamp, data.instrument);
    });

    socket.on('release', function(data) {
        player.tracks.remove(player.tracks.get(data.trackID));
        $('#mouse_' + data.trackID).remove();
    });
    socket.on('instrument', function(data) {
        player.tracks.get(data.trackID).set({'instrument': new Instrument(data.instrument)});
    });

    socket.on('mouse', function(data) {
        var mouseID = '#mouse_' + data.trackID;
        if($(mouseID).length == 0) {
            $('body').append('<div class="mouse" id="mouse_'+data.trackID+'" />');
        }

        $(mouseID).css({
            'left' : ((($(window).width() - data.w) / 2 + data.x) - 4) + 'px',
            'top' : data.y + 'px'
        });
    });

    $(document).mousemove(function(e) {
        var limited = false;
        sendMouseEvent = function(e) {
            if (limited) { return; }
            limited = true;
            socket.emit('mouse', {
                'x': e.pageX,
                'y': e.pageY,
                'w': $(window).width(),
                'h': $(window).height()
            });
            setTimeout(function() {
                limited = false;
            }, 40);
        }
        return sendMouseEvent(e);
    });
});


socket.on('error', function(data) {
    app.trigger('error', data);
});


