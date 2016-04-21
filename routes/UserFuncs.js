var squel = require("squel");
var Pantry  = require('../models/pantry');
var pantryFuncs = require('./PantryFuncs');
var User = require('../models/user');
var session = require('client-sessions');

var UserFuncs = function() {

    var login = function(userName, req, res) {
        var queryText = squel.select()
                            .from("users")
                            .where("user_name = ?", userName)
                            .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) { 

            console.log(data);

            if(data.length > 0){
                console.log("data[0]: " + data[0]);
                req.session.user = data[0];
                console.log(data);
                res.redirect('/main');
            }else{
                res.send("Log-in Failure(No/incorrect user info)");
            }
            //sendMessage(res, mssg, data, "Log in");
        });
    };

    var signup = function(userName, res) {

        var addNewUserQuery = squel.insert()
                                    .into("users")
                                    .set("user_name", userName)
                                    .toString();
        
        var queryDB = require('../database')(addNewUserQuery, function(mssg, data) {

            if(mssg == "Problem querying database") {
               sendMessage(res, 400, "User already exists or problem querying database", "sign up", data);
            }
            else {
                sendMessage(res, 200, "Sign up successful", "sign up", data);
            }
        });
    };

    /**
        Insert new friend. Does not insert mutually for both people, only for
        one person.
    */
    var insertNewFriend = function(userName, newFriend, res) {

        checkUserExists(userName, function(mssg, data) {

            if(data == null || data.length < 1) {
                sendMessage(res, 400, "User " + userName + " does not exist", "add friend", data);
            }
            else {
                startInsertingNewFriend(userName, newFriend, res);
            }

        });
    };

    function startInsertingNewFriend(userName, newFriend, res) {

        var queryText = squel.select()
                            .from("friends")
                            .where("username_1 = ?", userName)
                            .where("username_2 = ?", newFriend)
                            .toString();

        var DBquery = require('../database')(queryText, function(mssg, data) {

            console.log(JSON.stringify(data, null, 2));

            if(data == null || data.length < 1) {
                insertPair(userName, newFriend, res);
            }
            else {
                sendMessage(res, 400, "User " + userName + " and " + newFriend + " are already friends.", "add friend", data);
            }
        });

        function insertPair(userName, newFriend, res) {

            var pairQuery = 
                    "INSERT " + 
                    "INTO friends " +
                    "VALUES(\'" + userName + "\',\'" + newFriend + "\');";

            var DBQuery2 = require('../database')(pairQuery, function(mssg, data) {

                if(mssg == "Problem querying database") {
                    sendMessage(res, 400, "Problem inserting into friends table", "add friend", data);
                }
                else {
                    sendMessage(res, 200, mssg, "Add friend", data);
                }
            });
        }
    }

    function checkUserExists(userName, callback) {

        var queryText = squel.select()
                            .from("users")
                            .where("user_name = ?", userName)
                            .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) {
            callback(mssg, data);
        });
    }

    var deleteFriend = function(userName, friendName, res) {

        var queryText = squel.delete()
                            .from("friends")
                            .where("username_1 = ?", userName)
                            .where("username_2 = ?", friendName)
                            .toString();

        var DBQuery = require('../database')(queryText, function(mssg, data) {

            if(mssg == 'Problem querying database')
                sendMessage(res, 400, "Problem deleting friend", "delete friend", data);
            else
                sendMessage(res, 200, "Friends deleted: " + userName + " " + friendName, "delete friend",  data);
        });
    };

    function sendMessage(res, status, mssg, requestType, mRows) {

        var response = {};

        response['status'] = status;
        response['result'] = mssg;
        response['requestType'] = requestType;
        response['data'] = mRows;

        res.set("Access-Control-Allow-Origin", "*");
        res.json(response);
    }

    return {
        login: login,
        signup: signup,
        insertNewFriend: insertNewFriend,
        deleteFriend: deleteFriend
    }

}();

module.exports = UserFuncs;