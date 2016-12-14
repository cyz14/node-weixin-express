'use strict';
var server = require('./server');

var waterline = require('./waterline');

var weixinCallback = require('./weixin/callback');

var localTunnel = require('./localtunnel');

var dbConfig = require('./config/database');

var running = false;

var index = {
    _config: null,
    _app: null,
    _weixin: null,
    _models: null,
    _info: function info(data, name) {
        if (data) {
            console.info(name + ' initialized');
        } else {
            console.info(name + ' not initialized');
        }
    },
    info: function(config) {
        var dataTypes = ['port', 'host', 'server', 'template', 'message', 'app', 'merchant', 'oauth', 'cerfiticated'];
        for (var i = 0; i < dataTypes.length; i++) {
            var k = dataTypes[i];
            index._info(config[k], k);
        }
    },
    init: function(config, callback) {
        index._config = config;
        index._db = config.db;
        index.info(config);
        index.server(config, callback);
    },
    server: function(config, callback) {
        server(index.onServerUp(callback), config);
    },
    onServerUp: function(callback) {
        return function(app, weixin) {
            index._app = app;
            index._weixin = weixin;
            waterline.init(index._db || dbConfig, index.onOrmReady(app, weixin, callback));
        };
    },
    onOrmReady: function(app, weixin, callback) {
        return function(error, ontology) {
            var models = ontology.collections;
            index._models = models;
            index.callback(app, weixin, models, callback);
        };
    },
    callback: function(app, weixin, models, callback) {
        var config = index._config;
        if (running) {
            return;
        }
        running = true;
        weixinCallback.init(config, models, weixin);
        app.listen(config.port, config.host, index.onListenEnd(callback));
    },
    onListenEnd: function(callback) {
        var config = index._config;
        console.info('Server listening on port', config.port);
        console.info('Your local address is http://' + config.host + ':' + config.port);
        localTunnel(config, config.localtunnel, callback);
        index._tunnel = localTunnel._tunnel;
    }
};
module.exports = index;