var Pantry  = require('../models/pantry');
var squel = require("squel");

var PantryFuncs = function() {

    var getFromPantry = function(pantry, res) {

        var queryText = squel.select()
                            .from("pantries")
                            .where("pantry_id=" + pantry.id)
                            .where("owner_name= ?", pantry.owner)
                            .toString();
        console.log("query text: ", queryText);    

        var queryDB = require('../database')(queryText, function(mssg, mRows){
            sendMessage(res, mssg, mRows, "Get pantry");
        });           
    };

    /*
        Add new pantry
    */
    var insertIntoPantry = function(pantry, res) {

        // Add pantry to pantries table
        var queryText = squel.insert()
                            .into("pantries")
                            .set("pantry_id", pantry.id)
                            .set("pantry_name", pantry.name)
                            .set("owner_name", pantry.owner)
                            .set("ingredient_id", pantry.ingred_id)
                            .set("amount", pantry.amount)
                            .toString();
        console.log("query text: " + queryText);

        var queryDB = require('../database')(queryText, function(mssg, mRows) {
            sendMessage(res, mssg, mRows, "Insert into pantry");
        });

        return;
    };

    var updatePantryContents = function(pantry, res) {

        var queryText = squel.update()
                            .table("pantries")
                            .set("ingredient_id", pantry.contents)
                            .where("owner_name = ?", pantry.owner)
                            .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) {
            sendMessage(res, mssg, mRows, "Update pantry contents for user");
        });
    };

    /*
        Add ingredeitn to pantry contents
    */
    var insertIntoPantry2 = function(pantry, res) {

        var queryText = squel.insert()
                                .into("pantries")
                                .set("pantry_id", pantry.id)
                                .set("pantry_name", pantry.name)
                                .set("owner_name", pantry.owner)
                                .set("contents", pantry.contents)
                                .toString();
        console.log("query text: " + queryText);

        var queryDB = require('../database')(queryText, function(mssg, data) {
            sendMessage(res, mssg, mRows, "Add user item to pantry");
        });

        // Cases: (1) When the ingredient is not there
        // ADD CODE HERE


        // (2) When the ingredients exists for the pantryID and you need
        //         update the amounts of the ingredient
        // ADD CODE HERE

        return;
    };

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
        insertIntoPantry: insertIntoPantry,
        insertIntoPantry2: insertIntoPantry2,
        getFromPantry: getFromPantry,
        updatePantryContents: updatePantryContents
    }

}();

module.exports = PantryFuncs;