module.exports = {
    // social networks
    fb: {
        appId: '111565172259433'
      , appSecret: '85f7e0a0cc804886180b887c1f04a3c1'
    },
    twit: {
        consumerKey: 'JLCGyLzuOK1BjnKPKGyQ'
      , consumerSecret: 'GNqKfPqtzOcsCtFbGTMqinoATHvBcy1nzCTimeA9M0'
    },
    github: {
        appId: '11932f2b6d05d2a5fa18'
      , appSecret: '2603d1bc663b74d6732500c1e9ad05b0f4013593'
    },
    instagram: {
        clientId: 'be147b077ddf49368d6fb5cf3112b9e0'
      , clientSecret: 'b65ad83daed242c0aa059ffae42feddd'
    },
    foursquare: {
        clientId: 'VUGE4VHJMKWALKDKIOH1HLD1OQNHTC0PBZZBUQSHJ3WKW04K'
      , clientSecret: '0LVAGARGUN05DEDDRVWNIMH4RFIHEFV0CERU3OITAZW1CXGX'
    },

    // mysql db
    dbOptions: {
        hostname: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'eightbitbeats'
    }
};

module.exports.port = 7777;
module.hostname = 'http://local.host:'+ module.exports.port;
