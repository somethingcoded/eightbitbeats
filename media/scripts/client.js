var socket = io.connect('http://localhost:7777');

//------- SERVER EVENT RECEIVERS -------

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
    */
    console.log('syncing data!');
    console.log(data);
});

socket.on('claim', function(data) {
    // update a track as claimed. render new user avatar etc
    console.log('someone claimed a track!');
    console.log(data);
    player.createTrack(data.trackID, data.user, data.timestamp, data.instrument);
});

socket.on('release', function(data) {
    // update track as empty. clear user avatar etc
});

socket.on('error', function(data) {
    alert(data.msg);
});
