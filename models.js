var User = function(userData) {
    this.normalizeData(userData);
}

User.prototype.normalizeData = function(userData) {
    if (userData.screen_name) {
        // handle twitter user object
        this.service = 'twitter';
        this.service_id = userData.id_str;
        this.service_username = userData.screen_name
        this.service_name = userData.name
        this.display_name = userData.screen_name;
    } else {
        // handle facebook user object
        this.service = 'facebook';
        this.service_id = userData.id;
        this.service_username = userData.username;
        this.service_name = userData.name
        this.display_name = userData.username;
    }
}

exports.User = User;
