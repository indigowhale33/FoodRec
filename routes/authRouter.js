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

	ex:
	(1) http://localhost:8080/api/auth/updateFriends?userName=Albert&newFriend=Cindy
*/
router.route('/auth/updateFriends')
	.post(function(req, res) {
		
		var user = new User(req.query.userName, null);
		user.newFriend = req.query.newFriend;

		userFuncs.updateFriends(user, res);
	});

/*
*	Authenticate user login info
	
	Params: userName
	
	ex: 
	(1) http://localhost:8080/api/auth/login/params?userName=ex1
*/
router.route('/auth/login/params')
	.get(function(req, res) {

		var user = new User(req.query.userName, null);
		userFuncs.login(user, res);
	});

/**
	To create a new user, 
	(1) create newuser in "users" table,
	(2) create a new empty pantry with a unique ID for that user

	Params: userName

	ex:
	(1) http://localhost:8080/api/auth/signup/params?userName=ex1
*/
router.route('/auth/signup/params')
	.put(function(req, res) {

		var newuser = new User(req.query.userName, null);

		userFuncs.signup(newuser, res);
	});

module.exports = router;