var socket = io.connect('http://localhost:7777');

/**
 * change
 *  update state of single point on a given track
 *  {'track': 0, 'step': 1, 'step_data': {'notes': [1,0,1,0]}
 */
socket.on('change', function(data) {
    console.log('oh snap a change!');
    console.log(data);
    player.tracks.at(data.track).steps.at(data.step).set({notes: data.notes});
});

socket.on('sync', function(data) {
    // update state with all track data
    console.log('syncing data!');
    console.log(data);
});

socket.on('claim', function(data) {
    // update a track as claimed. render new user avatar etc
});

socket.on('release', function(data) {
    // update track as empty. clear user avatar etc
});
