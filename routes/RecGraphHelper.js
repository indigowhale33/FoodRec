////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

var RecGraphHelper = function() {

    var getPossibleRecipes = function(res, user_name, recipe_id, callback) {

    	// limit 1 because we don't need a lot to verify...
        var queryText_check = 
                            "SELECT ri_inner.ingredient_id " +
                            "FROM recipe_ingredients ri_inner JOIN pantries p " +
                            "ON p.owner_name=\'" + user_name + "\' AND ri_inner.ingredient_id = p.ingredient_id " +
                            "LIMIT 1;";

        var queryDB_check = require('../database')(queryText_check, function(mssg, data) { 

            if(data == null || data.length < 1) {
                sendMessage(res, 400, "Either user has an invalid ingredient id or user does not exist: " + user_name, data, "Get possible recipes");
                return;
            }

            next_step(res, user_name, recipe_id, callback);
        });

        function next_step(res, user_name, recipe_id, callback) {

            var queryText = 
                        "SELECT recipe_id, recipe_name, ingredient_id, amount, description " +
                        "FROM recipes, recipe_ingredients ri_outer " +
                        "WHERE (recipes.id = ri_outer.recipe_id) AND ri_outer.ingredient_id IN " +
                        "( " +
                            "SELECT ri_inner.ingredient_id " +
                            "FROM recipe_ingredients ri_inner " +
                            "WHERE ri_inner.recipe_id = " + recipe_id +
                        ");";

            var queryDB = require('../database')(queryText, function(mssg, data) {                 

                //console.log("DATA: " + JSON.stringify(data, null, 2));

                if(data == null || data.length < 1) {
                    sendMessage(res, 400, "Could not find any ingredients that will help : " + user_name, data, "Get possible recipes");
                    return;
                }
                
                
                var formatted = [];
                for(var i = 0; i < data.length; i++) {

                    var keyExistsInArr = false;
                    for(var j = 0; j < formatted.length; j++) {

                        if(formatted[j] == null)
                            continue;
                        
                        if(formatted[j]['recipe_id'] == data[i]['recipe_id']) {
                            keyExistsInArr = true;
                            formatted[j]['ingredients'].push({"ingredient_id":data[i]['ingredient_id'], "amount":data[i]['amount']});
                            formatted[j]['ingredients_needed_count'] += 1;
                        }
                    }

                    if(!keyExistsInArr) {

                        formatted.push(
                            {
                                "recipe_id": data[i]['recipe_id'],
                                "recipe_name": data[i]['recipe_name'],
                                "description": data[i]['description'],
                                "ingredients_needed_count": 1,
                                "ingredients": [{"ingredient_id": data[i]['ingredient_id'], 
                                                "amount":data[i]['amount']
                                }]
                            }
                        );
                    }
                }

                formatted.sort(function(a, b) {
                    return parseInt(a['ingredients_needed_count']) - parseInt(b['ingredients_needed_count']);
                });

                if(formatted.length == 0) {
                    sendMessage(res, 400, "Could not find any other ingredients for any other recipes", [], "Get ingredients that, when added, will allow for more recipes");
                }

                console.log(JSON.stringify(formatted.splice(0,100), null, 2));
                callback(mssg, formatted);
                
            });
        }
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
        getPossibleRecipes: getPossibleRecipes
    }

}();

module.exports = RecGraphHelper;