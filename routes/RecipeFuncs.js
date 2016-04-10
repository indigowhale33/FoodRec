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
            
            console.log("finished...");
            res.status(200).json({"message": mssg, "requestType": "Insert recipe", "data": data});
        
        });

        return;
    }

    /**
        Generates all possible recipes based on
        ingredients from the user's pantry.
    */
    var generateAllPossibleRecipes = function(userName, res) {

        
    }

    return {
        insert: insert,
        generateAllPossibleRecipes: generateAllPossibleRecipes
    }

}();

module.exports = RecipeFuncs;