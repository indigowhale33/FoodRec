var squel   = require('squel');
var async   = require('async');

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
    };

    var getRecipeByID = function(id, res) {

        var queryText = squel.select()
                            .from("recipes")
                            .where("id = ?", id)
                            .toString();
        console.log(queryText);

        var queryDB = require('../database')(queryText, function(mssg, data) {
            sendMessage(res, mssg, data, "Get recipe by ID");
        });
    };

    /**
        Generates all possible recipes based on
        ingredients from the user's pantry.
    */
    var generatePossibleRecipesFromPantry = function(userName, res) {
    	
    	var queryText = squel.select()
                            .field("DISTINCT(recipe_ID)")
                            .from("recipe_ingredients")
                            .where("ingredient_id IN ?", 
                                squel.select()
                                    .field("ingredient_id")
                                    .from("pantries")
                                    .where("owner_name = ?", userName) )
                            .toString();
        console.log("queryText: " + queryText);

        var queryDB = require('../database')(queryText, function(mssg, data) {
            
            if(data == null || data.length == 0 || data[0]['recipe_id'] == null) {
                sendMessage(res, "Problem querying database...", data, "Could not find any recipes (recipe_id does not exist)");
                return;
           }
        
            getRecipes(data, res);
        }); 

        function getRecipes(data_recipe_ids, res) {

            console.log(JSON.stringify(data_recipe_ids, null, 2));

            if(data_recipe_ids == null || data_recipe_ids.length == 0) {
                sendMessage(res, "Could not find any recipes from pantry items...", data_recipe_ids, "Get all possible recipes based on ingredients from user's pantry.");
                return;
            }

            console.log("data before: " + JSON.stringify(data_recipe_ids, null, 2));
            console.log("--------------------------------------------");

            var tasks = [];
            for(var i = 0; i < data_recipe_ids.length; i++) {
                var obj = data_recipe_ids[i];
                console.log("obj: " + JSON.stringify(obj, null, 2));
                tasks.push(getExtractor(obj['recipe_id']));
            }

            console.log("--------------------------------------------");

            async.series(tasks,
            function(err, tasks) {
                console.log("result of async: " + JSON.stringify(tasks, null, 2));

                if(err) {
                    console.log("ERR: " + err);
                    return sendMessage(res, "Could not find any recipes from pantry items...", data_recipe_ids, "Get all possible recipes based on ingredients from user's pantry.");
                }
                else {
                    console.log("RETURNING OUTPUT");
                    return sendMessage(res, "Success!", tasks, "Get recipe based on ingredients in pantry");
                }


            });

        }

        function getExtractor(i, output) {

            return function(callback) {

                console.log("input recipes: " + i);

                var queryText3 = squel.select()
                        .from("recipes")
                        .where("id = " + i)
                        .toString();
                console.log(queryText);

                var queryDB3 = require('../database')(queryText3, function(mssg, data_to_push) {        
                    
                    for(var j = 0; j < data_to_push.length; j++) {
                        addIngredients(j, data_to_push[j]['id'], data_to_push[0], callback);
                    }
                });
            }

            function addIngredients(ndx, id, data_to_push, callback) {

                console.log("adding ingredients ++ id = " + id);
                var queryText4 = squel.select()
                                    .field("ingredient_id, name")
                                    .from("recipe_ingredients, ingredients")
                                    .where("recipe_ID = " + id)
                                    .where("ingredient_id = nbd_num")
                                    .toString();

                var queryDB4 = require('../database')(queryText4, function(mssg, data_to_push2) {        

                    data_to_push['ingredients'] = [];

                    for(var k = 0; k < data_to_push2.length; k++) {
                        data_to_push['ingredients'].push(data_to_push2[k]);
                    }
                    
                    return callback(null, data_to_push);
                });
            }
        }

        function callback(mssg) {
            console.log("Call back mssg: " + mssg);
        }
    };

    function sendMessage(res, mssg, mRows, requestType) {

        var response = {};

        response['result'] = mssg;
        response['requestType'] = requestType;
        response['data'] = mRows;

        if(mssg == "Problem querying database...")
            response['status'] = 400;
        else
            response['status'] = 200;

        res.set("Access-Control-Allow-Origin", "*");
        res.json(response);
    }

    return {
        insert: insert,
        generatePossibleRecipesFromPantry: generatePossibleRecipesFromPantry,
        getRecipeByID: getRecipeByID
    };

}();

module.exports = RecipeFuncs;