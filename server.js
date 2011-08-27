var express = require('express'),
    nko = require('nko')('ifZu/MT8VJF/wtlB');

var app = express.createServer();

app.use('/media', express.static(__dirname + '/media'));
app.use('/', express.static(__dirname + '/'));

app.listen(7777);
console.log('8bitbeats! Listening on port ' + app.address().port);
