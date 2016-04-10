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
            res.json({"message": mssg, "requestType": "Log in", "data": data});
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
            next(data);
        });

        function next(row) {
                
            var maxPantryID = row[0]['max'];
            console.log('max: ' + maxPantryID);

            if(maxPantryID == null || maxPantryID == 'undefined')
                maxPantryID = 1;

            newuser.pantryID = parseInt(maxPantryID) + 1;
            addNewUser(newuser);
        }

        function addNewUser(newuser) {
            
            var addNewUserQuery = squel.insert()
                                        .into("users")
                                        .set("user_name", newuser.userName)
                                        .set("friends", newuser.friendName)
                                        .toString();
            console.log("query text: " + addNewUserQuery);
            
            var queryDB = require('../database')(addNewUserQuery, function(mssg, data) {
                addNewPantry(newuser);
            });
        }

        function addNewPantry(newuser) {

            var pantry = new Pantry(newuser.pantryID, "New Pantry", newuser.userName, '');
            pantryFuncs.insertIntoPantry2(pantry, res);
        }

        return;
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
                    res.json({"message": "Friend already exists for user " + user.userName, "requestType": "Update friends", "data": null});
                    return;
                }
            }

            friendsList += user.newFriend +' ';
            console.log("friendsList: " + friendsList);

            user.friendName = friendsList;
            changeFriends(user, res);
        });

        return;
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
            res.json({"message": mssg, "requestType": "Update friends", "data": data});
        });


        return;
    }

    return {
        login: login,
        signup: signup,
        updateFriends: updateFriends,
        changeFriends: changeFriends
    }

}();

module.exports = UserFuncs;