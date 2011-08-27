var express = require('express'),
    nko = require('nko')('ifZu/MT8VJF/wtlB');
var app = express.createServer();
var io = require('socket.io').listen(app);

app.use('/media', express.static(__dirname + '/media'));
app.use('/', express.static(__dirname + '/templates/'));

app.listen(7777);
console.log('8bitbeats! Listening on port ' + app.address().port);

io.sockets.on('connection', function(socket) {
    socket.emit('news', {hello: 'world'});
    socket.on('my other event', function(data) {
        console.log(data);
    });
});
