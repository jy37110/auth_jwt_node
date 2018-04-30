var express = require("express");
var router = express.Router();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var User = require('../modules/user');

mongoose.connect('mongodb://localhost/auth');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("mongodb connected");
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

var secret = "show me the secret";

router.use(cookieParser());

router.use(expressJWT({
    secret: secret
}).unless({
    path: ['/getToken', '/login', '/register']
}));

router.use(function(err, req, res, next){
    if (err.name === 'UnauthorizedError'){
        console.log(err.message);
        res.status(401).send('invalid token...');
    }
});

router.get("/", function(req, res){
   res.send("This is the root");
});

router.get('/test', function(req, res){
    res.send("/test path");
});

router.post('/register', function(req, res){
    if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        res.send("passwords dont match");
        return;
    }

    var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        passwordConf: req.body.passwordConf,
    };

    User.create(userData, function (error, user) {
        if (error) {
            res.send(error);
        } else {
            var token = issueToken(user._id);
            res.cookie('jwt', token);
            res.json(token);
        }
    });
});

router.post('/login', function(req, res){
    User.authenticate(req.body.email, req.body.password, function (error, user) {
        if (error || !user) {
            res.send(401, {"result":"error"});
        } else {
            var token = issueToken(user._id);
            res.cookie('jwt', token);
            res.json(token);
            //return res.redirect('/');
        }
    });
});

var issueToken = function(userId) {
    return {
        result: 'ok',
        token: jwt.sign({
            userId: userId,
        }, secret, {
            expiresIn: "30 days"})
    }
};

module.exports = router;