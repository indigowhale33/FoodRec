var squel   = require("squel");

var RecipeFuncs = function() {

    var insert = function(newRecipe, res) {

        var queryText = squel.insert()
                            .into("recipes")
                            .set("recipe_name", newRecipe.recipeName)
                            .set("ingredients", newRecipe.ingredients)
                            .set("prep_time", newRecipe.prepTime)
                            .set("description", newRecipe.description)
                            .set("directions", newRecipe.directions)
                            .toString();

        console.log(queryText);

        var queryDB = require('../database')(queryText, function(mssg, data) {
            sendMessage(res, mssg, data, "Insert recipe");
        });

        return;
    }

    var getRecipeByID = function(id, res) {

        var queryText = squel.select()
                            .from("recipes")
                            .where("id = ?", id)
                            .toString();
        console.log(queryText);

        var queryDB = require('../database')(queryText, function(mssg, data) {
            sendMessage(res, mssg, data, "Get recipe by ID");
        });
    }

    /**
        Generates all possible recipes based on
        ingredients from the user's pantry.
    */
    var generateAllPossibleRecipes = function(userName, res) {

        
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
        insert: insert,
        generateAllPossibleRecipes: generateAllPossibleRecipes,
        getRecipeByID: getRecipeByID
    }

}();

module.exports = RecipeFuncs;