var http = require('http'),
    nko = require('nko')('ifZu/MT8VJF/wtlB')

var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('8bitbeats!');
});
app.listen(parseInt(process.env.PORT) || 7777);
console.log('Listening on ' + app.address().port);
