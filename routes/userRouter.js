var express = require('express');
var User  = require('../models/user');
var userFuncs = require('./UserFuncs');
var squel = require("squel");
var router = express.Router();

// ROUTE INFO
// =============================================================================
router.route('/auth')
    .get(function(req, res) {
        res.send("You didn't specify any arguments!" +
            "<br/>Here are some which are currently supported:<br><br>" + 
            "auth/log-in<br/><br/>" +
            "Parameters are:<br/>" +
            "userName -- user name<br/>" + 
            "friendName -- friend's name<br/>"
        );
    });

/**
    Update friends.

    Params: userName, newFriend

    ex:
    (1) http://localhost:8080/api/auth/updateFriends/params?userName=Albert&newFriend=Cindy
*/
router.route('/auth/updateFriends/params')
    .post(function(req, res) {
        
        var user = new User(req.query.userName, null);
        user.newFriend = req.query.newFriend;

        userFuncs.updateFriends(user, res);
    });

/*
*   Authenticate user login info
    
    Params: userName
    
    ex: 
    (1) http://localhost:8080/api/auth/login/params?userName=ex1
*/
router.route('/auth/login/params')
    .post(function(req, res) {
        var user = new User(req.body.userName, null);
        userFuncs.login(user, req, res);
    });

/**
    Creates a new user. Automatically creates a new pantry.

    Params: userName

    ex:
    (1) http://localhost:8080/api/auth/signup/params?userName=ex1
*/
router.route('/auth/signup/params')
    .post(function(req, res) {

        var newuser = new User(req.query.userName, null);
        userFuncs.signup(newuser, res);
    });

module.exports = router;