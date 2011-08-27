var socket = io.connect('http://localhost:7777');

socket.on('change', function(data) {
    // update state of single point on a given track
    console.log('oh snap a change!');
    console.log(data);
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
