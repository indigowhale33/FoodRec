var Pantry  = require('../models/pantry');
var squel = require("squel");

var PantryFuncs = function() {

    var getPantry = function(owner_name, res) {

        var queryText = squel.select()
                            .from("pantries")
                            .where("owner_name= ?", owner_name)
                            .toString();    

        var queryDB = require('../database')(queryText, function(mssg, data){
            
            if(data == null || data.length < 1)
                sendMessage(res, 400, "Could not get pantry where owner name: " + owner_name, data, "Get pantry");
            else
                sendMessage(res, 200, mssg, data, "Get pantry");
        });           
    };

    var deleteIngredientFromPantry = function (userName, ingredientToDelete, res) {

        var queryText = squel.delete()
                            .from("pantries")
                            .where("owner_name = ?", userName)
                            .where("ingredient_id = " + ingredientToDelete)
                            .toString();

        var queryDB = require('../database')(queryText, function(mssg, data){
            
            console.log(mssg);
            if(data == null)
                sendMessage(res, 400, "Could not delete ingredient from pantry", "Delete ingredient");
            else
                sendMessage(res, 200, mssg, data, "Delete ingredient");
        });    
    };

    var getPantryIDFromOwnerName = function (owner_name, callback) {

        var queryText = squel.select()
                                .field("pantry_id")
                                .from("pantries")
                                .where("owner_name = ?", owner_name)
                                .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) {
            callback(mssg, data);
        });      
    };

    function addIngredientToPantry(userName, ingredientToAdd, amount, res) {


        // check if user has a pantry
        var existsText = squel.select()
                                .from("pantries")
                                .where("owner_name = ?", userName)
                                .toString();

        var queryDB = require('../database')(existsText, function(mssg, data) {

            // if user does not have an existing pantry, make one
            if(data.length === 0) {

                var insertNewPantryQuery = 
                    "INSERT INTO pantries " +
                        "VALUES ( " +
                            "COALESCE((SELECT MAX(pantry_id) + 1 FROM pantries), 1), " +
                            "\'" + userName + "\'\'s pantry\', " +
                            "\'" + userName + "\', " +
                            ingredientToAdd + ", " +
                            amount + 
                        ");";
                
                insertNewPantry(insertNewPantryQuery, res);
            }
            else {

                // check if user already has ingredient
                var hasIngredientText = squel.select()
                                            .from("pantries")
                                            .where("owner_name = ?", userName)
                                            .where("ingredient_id = ?", ingredientToAdd)
                                            .toString();

                queryIngredientExists(hasIngredientText, ingredientToAdd, res);
            }
        });

        function queryIngredientExists(hasIngredientText, ingredientToAdd, res) {

            var queryDB = require('../database')(hasIngredientText, function(mssg, data) {

                if(data.length < 1) {

                    // user does not have ingredient in pantry, so add it
                    getPantryIDFromOwnerName(userName, function(mssg, data) {

                        //console.log(mssg + " data: " + JSON.stringify(data, null, 2));
                        if(data == null || data.length < 1 || !data[0].hasOwnProperty('pantry_id')) {
                            sendMessage(400, "Could not find pantry_id", data, "Insert new ingredient");
                            return;
                        }

                        var insertNewIngredientNewPantryText = 
                                "INSERT " +
                                "INTO pantries " +
                                "VALUES(" + data[0]['pantry_id'] + "," + 
                                        "\'" + userName + "\'\'s pantry\'," +
                                        "\'" + userName + "\'," +
                                        ingredientToAdd + "," +
                                        amount +
                                ");";

                        insertNewPantry(insertNewIngredientNewPantryText, res);
                    });                             
                }
                else {
                    // user already has ingredient in pantry

                    // update amount if amount differs
                    if(amount != data[0]['amount']) {

                        var updateAmountText = squel.update()
                                                    .table("pantries")
                                                    .set("amount = " + amount)
                                                    .where("owner_name = ?", userName)
                                                    .where("ingredient_id = " + ingredientToAdd)
                                                    .toString();
                        updateAmount(updateAmountText, res);
                    }
                    else {
                        sendMessage(res, 400, "User already has that same ingredient and amount in pantry", data, "Insert ingredient");
                    }
                }
            });
        }

        function updateAmount(updateAmountText, res) {

            var queryDB = require('../database')(updateAmountText, function(mssg, data) {

                if(mssg == "Query successful!") {
                    sendMessage(res, 200, mssg, data, "Ingredient already exists for user. Updated ingredient amount.");
                }
                else {
                    sendMessage(res, 400, mssg, data, "Ingredient already exists for user. Updated ingredient amount.");
                }

            });
        }

        function insertNewPantry(insertNewPantryQuery, res) {

            var queryDB = require('../database')(insertNewPantryQuery, function(mssg, data) {

                if(mssg == "Query successful!") {
                    sendMessage(res, 200, mssg, data, "Insert new pantry");
                }
                else {
                    sendMessage(res, 200, mssg, data, "Insert new pantry");
                }
            });
        }

        function sendMessage(res, status, mssg, mRows, requestType) {

            var response = {};

            response['status'] = status;
            response['result'] = mssg;
            response['requestType'] = requestType;
            response['data'] = mRows;

            res.set("Access-Control-Allow-Origin", "*");
            res.json(response);
        }
    }

    function sendMessage(res, status, mssg, mRows, requestType) {

        var response = {};

        response['status'] = status;
        response['result'] = mssg;
        response['requestType'] = requestType;
        response['data'] = mRows;

        res.set("Access-Control-Allow-Origin", "*");
        res.json(response);
    }

    return {

        getPantry: getPantry,
        getPantryIDFromOwnerName: getPantryIDFromOwnerName,
        addIngredientToPantry: addIngredientToPantry,
        deleteIngredientFromPantry: deleteIngredientFromPantry
    }

}();

module.exports = PantryFuncs;