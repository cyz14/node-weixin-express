var express = require('express');
var app = express();
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var skipper = require('skipper');

var nodeWeixinExpress = require('./weixin');

// trust first proxy
app.set('trust proxy', 1);

app.use(session({
    secret: process.env.NODE_WEIXIN_EXPRESS_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(bodyParser.raw({
    type: 'text/xml'
}));

app.use(cookieParser());
app.use(skipper());

console.log(__dirname);
app.use(express.static(path.join(__dirname, '/public')));

module.exports = function(cb, config) {
    nodeWeixinExpress(function(app, weixin) {
        cb(app, weixin);
    }, app, config);
};