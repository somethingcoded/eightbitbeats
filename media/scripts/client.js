var socket = io.connect();
socket.on('connect', function() {
    console.log('yo dawg we now connected');
});

//------- SERVER EVENT RECEIVERS -------

socket.on('disconnect', function(data) {
    alert('Disconnected from server :(')
});

socket.on('change', function(data) {
     // update state of single point on a given track
     // {'track': 0, 'step': 1, 'notes': [1,0,1,0]}
    console.log('oh snap a change!');
    console.log(data);
    player.tracks.get(data.track).steps.at(data.step).set({notes: data.notes});
});

socket.on('sync', function(data) {
    /*
      update state with all track data
      loop through tracks in data
        -create track if doesn't exist
        -loop through steps and update for track
        {'track0': {'instrument':null, 'user': null, 'steps': [{'notes': [0,0,0]}, {'notes': [0,0,0]}]}
    */
    console.log('syncing data!');
    console.log(data);
    player.syncTracks(data);
});

socket.on('claim', function(data) {
    // update a track as claimed. render new user avatar etc
    console.log('someone claimed '+ data.trackID + '!');
    console.log(data);
    player.createTrack(data.trackID, data.user, data.timestamp, data.instrument);
});

socket.on('release', function(data) {
    player.tracks.remove(player.tracks.get(data.trackID));
});

socket.on('error', function(data) {
    alert(data.msg);
});
