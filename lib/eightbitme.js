// eightbit.me adapter

exports.sendRequest = function(id, promise) {
        var options = {
            host: 'api.eightbit.me',
            port: 80,
            path: '/1/user/'+ id
        }

        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                _.extend(user, chunk);

                return promise.fulfill(user)
            });
        });

        req.on('error', function(e) {
            return promise.err(e.message);
        });

        req.end();
}

exports.getUserWithTwitter = function(twitterUserMetadata, promise) {
        return this.sendRequest(twitterUserMetadata.id_str, promise)
}

