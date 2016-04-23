var squel = require("squel");

var PantryFuncs = function() {

    var suggestIngredients = function(user_name, res) {

        var queryText = 
            "SELECT ingredients.id, " + 
                "ingredients.name, " +
                "count(*) num_recipes " +
            "FROM ingredients " +
                "INNER JOIN recipe_ingredients on ingredients.id = recipe_ingredients.ingredient_id " +
                "INNER JOIN ( " +
                    "SELECT id, count(*) " +
                    "FROM recipes " +
                        "INNER JOIN recipe_ingredients on recipes.id = recipe_ingredients.recipe_id " +
                        "LEFT JOIN pantries on recipe_ingredients.ingredient_id = pantries.ingredient_id " +
                                            "AND pantries.owner_name = \'" + user_name + "\' " +
                    "WHERE pantries.ingredient_id is null " +
                    "GROUP BY id " +
                    "HAVING count(*) = 1) q " +
                        "ON recipe_ingredients.recipe_id = q.id " +
                "LEFT JOIN pantries ON recipe_ingredients.ingredient_id = pantries.ingredient_id " +
            "WHERE pantries.ingredient_id is null " +
            "GROUP BY ingredients.id, ingredients.name " +
            "ORDER BY num_recipes DESC " +
            "LIMIT 50;";

        var queryDB = require('../database')(queryText, function(mssg, data) {

            if(data == null || data.length < 1 || mssg == "Problem querying database...") {
                sendMessage(res, 400, "Cannot suggest an ingredient: " + mssg, data, "Suggest ingredient");
            }
            else {
                sendMessage(res, 200, mssg, data, "Suggest an ingredient");
            }
        });

    };

    var getAllName = function(res) {

        var queryText = squel.select()
                            .field("name")
                            .from("ingredients")
                            .toString();
        
        var dbQuery = require('../database')(queryText, function(mssg, data) {

            if(data == null || data.length < 1)
                sendMessage(res, 400, "No ingredients in ingredients table", data, "Get all ingredients name");
            else
                sendMessage(res, 200, mssg, data, "Get all ingredients name");
        });
    };

    var getAllIngredients = function(res) {

        var queryText = squel.select()
                            .field("id")
                            .field("name")
                            .from("ingredients")
                            .toString();
        
        var dbQuery = require('../database')(queryText, function(mssg, data) {

            if(data == null || data.length < 1)
                sendMessage(res, 400, "No ingredients in ingredients table", data, "Get all ingredients");
            else
                sendMessage(res, 200, mssg, data, "Get all ingredients");
        });
    };

    

    var getIngredientByParams = function(input, res) {

        var name = input.ingredName;
        var id = input.ndbNum;

        if(name != null) {
            
            var queryText = squel.select()
                            .from("ingredients")
                            .where("name = ?", name)
                            .toString();

            var dbQuery = require('../database')(queryText, function(mssg, data) {
                
                if(data == null || data.length < 1)
                    sendMessage(res, 400, "Could not find ingredient by name " + name, data, "Get ingredient by params");
                else
                    sendMessage(res, 200, mssg, data, "Get ingredient by params");

            });
        }

        else if(id != null) {

            var queryText = squel.select()
                                .from("ingredients")
                                .where("id = " + id)
                                .toString();

            var dbQuery = require('../database')(queryText, function(mssg, data) {

                if(data == null || data.length < 1)
                    sendMessage(res, 400, "Could not find ingredient by id: " + id, data, "Get ingredient by params");
                else
                    sendMessage(res, 200, mssg, data, "Get ingredient by params");
            });
        }
    };

    var getIngredientBySubstring = function(substring, res) {

        var queryText = squel.select()
                            .field("id")
                            .field("name")
                            .from("ingredients")
                            .where("UPPER(name) LIKE UPPER(\'%" + substring + "%\')")
                            .toString();

        var dbQuery = require('../database')(queryText, function(mssg, data) {
            
            if(data == null || data.length < 1)
                    sendMessage(res, 400, "Could not find ingredient with substring: " + substring, data, "Get ingredient containing substring");
            else
                sendMessage(res, 200, mssg, data, "Get ingredient containing substring");
        });
    };

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
        getAllIngredients: getAllIngredients,
        getAllName: getAllName,
        getIngredientByParams: getIngredientByParams,
        getIngredientBySubstring: getIngredientBySubstring,
        suggestIngredients: suggestIngredients
    };

}();

module.exports = PantryFuncs;