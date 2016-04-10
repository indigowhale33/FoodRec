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
            res.json({"message": mssg, "requestType": "Get from pantry", "data": mRows});
        });        

        return;    
    }

    /*
        Add new pantry
    */
    var insertIntoPantry = function(pantry, res) {

        var queryText = squel.insert()
                            .into("pantries")
                            .set("pantry_id", pantry.id)
                            .set("pantry_name", pantry.name)
                            .set("owner_name", pantry.owner)
                            .set("contents", pantry.contents)
                            .toString();
        console.log("query text: " + queryText);

        var queryDB = require('../database')(queryText, function(mssg, mRows) {
            res.send({'result': mssg, "requestType": "Insert into pantry", "data": mRows});
        });

        return;
    }

    var updatePantryContents = function(pantry, res) {

        var queryText = squel.update()
                            .table("pantries")
                            .set("contents", pantry.contents)
                            .where("owner_name = ?", pantry.owner)
                            .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) {
            return res.json({"message": mssg, "queryType": "Update pantry contents for user " + pantry.owner, "data": data});
        });
    }

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
            return res.json({"message": mssg, "queryType": "Add user item to pantry", "data": data});
        });

        // Cases: (1) When the ingredient is not there
        // ADD CODE HERE


        // (2) When the ingredients exists for the pantryID and you need
        //         update the amounts of the ingredient
        // ADD CODE HERE

        return;
    }

    return {
        insertIntoPantry: insertIntoPantry,
        insertIntoPantry2: insertIntoPantry2,
        getFromPantry: getFromPantry,
        updatePantryContents: updatePantryContents
    }

}();

module.exports = PantryFuncs;