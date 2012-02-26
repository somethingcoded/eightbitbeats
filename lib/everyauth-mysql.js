var conf = require('../conf'),
    everyauth = require('everyauth'),
    mysql = require('db-mysql'),
    crypto = require('crypto'),
    models = require('../models');

exports.findOrCreateUser = function (session, accessToken, accessTokenSecret, userMetadata) {
    var promise = new everyauth.Promise();

    var user = new models.User(userMetadata);

    // -- Connect to MySQL --
    new mysql.Database(conf.dbOptions).connect(function(error) {
        if(error) {
            console.log('ERROR: ' + error);
            return promise.fail(error);
        }

        var dbCursor = this;
        dbCursor.query().
            select('*').
            from('users').
            where('service = ? AND service_id = ?', [user.service, user.service_id]).
            execute(function(error, rows, cols) {
                if (error) {
                    console.log('ERROR: ' + error);
                    return promise.fail(error);
                }

                // Create new user if not found
                else if (rows.length == 0) {
                    // Generate sha256 id for new user
                    shaObj = crypto.createHash('sha256');
                    shaObj.update(user.service + ':' + user.service_id + ':' + 'gamechanger');
                    newID = shaObj.digest('hex');
                    dbCursor.query().
                        insert('users',
                            ['id', 'display_name', 'service', 'service_id', 'service_username', 'service_name', 'last_login', 'total_logins'],
                            [newID, 'dj '+user.display_name, user.service, user.service_id, user.service_username, user.service_name, {value: 'NOW()', escape: false}, 1]
                        ).
                        execute(function(error, result) {
                            if (error) {
                                console.log('ERROR: ' + error);
                                return promise.fail(error);
                            }
                            console.log('CREATED USER');
                            console.log(result);
                            console.log({id: newID, username: 'DJ Bundy'});
                            return promise.fulfill({id: newID, username: user.display_name});
                        });
                }

                // Return previously created user
                else {
                    console.log('LOADED USER');
                    console.log({id: rows[0].id, username: rows[0].display_name});
                    return promise.fulfill({id: rows[0].id, username: rows[0].display_name});
                }
        });
    });


    return promise;
}

exports.findUserById = function(id, callback) {
    console.log('FINDING USER BY ID: ' + id);
    new mysql.Database(conf.dbOptions).connect(function(error) {
        if(error) {
            console.log('ERROR: ' + error);
            callback(null, {});
        }

        var dbCursor = this;
        dbCursor.query().
            select('*').
            from('users').
            where('id = ?', [id]).
            execute(function(error, rows, cols) {
                if (error) {
                    console.log('ERROR: ' + error);
                    callback(null, {});
                }

                // Create new user if not found
                else if (rows.length == 0) {
                    callback(null, {});
                }
                // Return previously created user
                else {
                    console.log('FOUND USER');
                    console.log({id: rows[0].id, username: rows[0].display_name});
                    callback(null, {id: rows[0].id, username: rows[0].display_name});
                }
        });
    });
}
