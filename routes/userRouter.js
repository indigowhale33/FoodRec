/**
    Note: all parameters in this file have the old parameters because
    it looks like you already started working with these parameters. I
    won't change it -- it's too much work.
*/

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
            "friendName -- friend's name<br/>" +
            "newFriend -- new friend's name<br/>"
        );
    });

/**
    Update friends.

    Params: userName, newFriend

    ex:
    (1) http://localhost:8080/api/auth/updateFriends/params?userName=Albert&newFriend=Cindy
*/
router.route('/auth/insertNewFriend/params')
    .post(function(req, res) {

        userFuncs.insertNewFriend(req.query.userName, req.query.newFriend, res);
    });

/**
    Delete friend.

    Params: userName, friendName

    ex:
    (1) http://localhost:8080/api/auth/deleteFriend/params?userName=Albert&friendName=Cindy
*/
router.route('/auth/deleteFriend/params')
    .post(function(req, res) {

        userFuncs.deleteFriend(req.query.userName, req.query.friendName, res);
    });

/*
*   Authenticate user login info
    
    Params: userName
    
    ex: 
    (1) http://localhost:8080/api/auth/login/params?userName=ex1
*/
router.route('/auth/login/params')
    .post(function(req, res) {
        //var user = new User(req.body.userName, null);
        
        userFuncs.login(req.body.userName, req, res);
        //userFuncs.login(req.body.userName, req, res);
    });

/**
    Creates a new user. Automatically creates a new pantry.

    Params: userName

    ex:
    (1) http://localhost:8080/api/auth/signup/params?userName=ex1
*/
router.route('/auth/signup/params')
    .post(function(req, res) {

        userFuncs.signup(req.query.userName, res);
    });

module.exports = router;