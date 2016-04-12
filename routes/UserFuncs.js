var squel = require("squel");
var Pantry  = require('../models/pantry');
var pantryFuncs = require('./PantryFuncs');
var User = require('../models/user');

var UserFuncs = function() {

    var login = function(user, res) {

        var queryText = squel.select()
                            .from("users")
                            .where("user_name = ?", user.userName)
                            .toString();
        console.log("queryText: " + queryText);

        var queryDB = require('../database')(queryText, function(mssg, data) { 
            sendMessage(res, mssg, data, "Log in");
        });

        return;
    }

    var signup = function(newuser, res) {

        var queryText = squel.select()
                            .from("pantries")
                            .field("MAX(pantry_id)")
                            .toString();
        console.log("query: ", queryText);

        var queryDB = require('../database')(queryText, function(mssg, data) {
            next(data, res);
        });

        function next(row, res) {
                
            var maxPantryID = row[0]['max'];
            console.log('max: ' + maxPantryID);

            if(maxPantryID == null || maxPantryID == 'undefined')
                maxPantryID = 1;

            newuser.pantryID = parseInt(maxPantryID) + 1;
            addNewUser(newuser, res);
        }

        function addNewUser(newuser, res) {
            
            var addNewUserQuery = squel.insert()
                                        .into("users")
                                        .set("user_name", newuser.userName)
                                        .set("friends", newuser.friendName)
                                        .toString();
            console.log("query text: " + addNewUserQuery);
            
            var queryDB = require('../database')(addNewUserQuery, function(mssg, data) {

                if(mssg == "Problem querying database") {
                   
                   /*
                        USER ALREADY EXISTS
                    */
                }
                else {
                    addNewPantry(newuser, res);
                }
            });
        }

        function addNewPantry(newuser, res) {

            console.log("" + newuser.userName + "'s Pantry");
            var pantry = new Pantry(newuser.pantryID, newuser.userName + '\'\'s Pantry', newuser.userName, '');
            var queryText = squel.insert()
                                .into("pantries")
                                .set("pantry_id", pantry.id)
                                .set("pantry_name", pantry.name)
                                .set("owner_name", pantry.owner)
                                .set("contents", pantry.contents)
                                .toString();
            console.log("query text: " + queryText);

            var queryDB = require('../database')(queryText, function(mssg, data) {
                sendMessage(res, mssg, data, "User signup");
            });
        }
    }

    /**
        Update friends.

        To update friends: 
        (2) Update the friend's "friends" column
    */
    var updateFriends = function(user, res) {

        var queryText = squel.select()
                            .field("friends")
                            .from("users")
                            .where("user_name = ?", user.userName)
                            .toString();
        console.log(queryText);

        console.log("new friend " + user.newFriend);

        var DBquery = require('../database')(queryText, function(mssg, data) {

            var friendsStr = data[0];
            if(friendsStr == null) {
                return;
            }

            var friendsList = friendsStr['friends'];
            if(friendsList == null)
                friendsList = '';

            var friendsArr = friendsList.split(' ');

            for(var i = 0; i < friendsArr.length; i++) {
                if(friendsArr[i] === user.newFriend) {
                    res.status(200).json({"message": "Friend already exists for user " + user.userName, "status": 400, "requestType": "Update friends", "data": null});
                    return;
                }
            }

            friendsList += user.newFriend +' ';
            console.log("friendsList: " + friendsList);

            user.friendName = friendsList;
            changeFriends(user, res);
        });
    }

    var changeFriends = function(user, res) {

        if(user.friendName == null)
            return;

        console.log(user.userName);
        console.log(user.friendName);

        var queryText = squel.update()
                            .table("users")
                            .set("friends", user.friendName)
                            .where("user_name = ?", user.userName)
                            .toString();
        console.log(queryText);

        var DBQuery = require('../database')(queryText, function(mssg, data) {
            sendMessage(res, mssg, data, "Update friends");
        });


        return;
    }

    function sendMessage(res, mssg, mRows, requestType) {

        var response = {};

        response['result'] = mssg;
        response['requestType'] = requestType;
        response['data'] = mRows;

        if(mssg == "Problem querying database")
            response['status'] = 400;
        else
            response['status'] = 200;

        res.set("Access-Control-Allow-Origin", "*");
        res.json(response);
    }

    return {
        login: login,
        signup: signup,
        updateFriends: updateFriends,
        changeFriends: changeFriends
    }

}();

module.exports = UserFuncs;