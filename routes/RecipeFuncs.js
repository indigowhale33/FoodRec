var squel   = require('squel');
var async   = require('async');

var RecipeFuncs = function() {


    var getRecipeIdByName = function(recipeName, res){
        var queryText = squel.select()
                            .from("recipes")
                            .where("recipes.recipe_name = ?", recipeName)
                            .toString();

         var queryDB = require('../database')(queryText, function(mssg, data) {
            if(data == null || data.length < 1)
                sendMessage(res, 400, "No Recipe Id in Recipes table", data, "Get Recipe Id");
            else
                sendMessage(res, 200, mssg, data[0].id, "Get Recipe Id");
        });

    }

    /**
    *   Get recipe by ID
    */
    var getRecipeByID = function(id, res) {

        var queryText = squel.select()
                            .from("recipes, recipe_ingredients, ingredients")
                            .where("recipes.id = ?", id)
                            .where("recipe_ingredients.recipe_id = recipes.id")
                            .where("recipe_ingredients.ingredient_id = ingredients.id")
                            .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) {
            
            //console.log(JSON.stringify(data));

            if(data == null || data.length < 1) {
                sendMessage(res, 400, "Could not find any recipe matching that ID", data, "Get recipe by ID");
                return;
            }
            
            var formatted = [];
            formatted.push({
                "recipe_name": data[0]['recipe_name'],
                "url": data[0]["url"],
                "image": data[0]['image'],
                "date_published": data[0]['date_published'],
                "cook_time": data[0]["cook_time"],
                "source": data[0]["source"],
                "recipe_yield": data[0]['recipe_yield'],
                "id": data[0]['id'],
                "prep_time": data[0]['prep_time'],
                "description": data[0]['description'],
                "ingredients": [] 
            });

            for(var i = 0; i < data.length; i++) {
                formatted[0]['ingredients'].push({
                    "ingredient_id": data[i]["ingredient_id"],
                    "amount": data[i]["amount"],
                    "name": data[i]["name"]
                });
            }


            sendMessage(res, 200, mssg, formatted, "Get recipe by ID");
            
        });
    };

    /**
        Generates all possible recipes based on
        ingredients from the user's pantry.
    */
    var generatePossibleRecipesFromPantry = function(userName, res) {

        // generate all recipes which match exactly the contents in pantry
        /*
        var queryText = "SELECT * " +
                        "FROM " +
                        "( " +
                            "SELECT recipe_id " +
                            "FROM recipe_ingredients ri LEFT JOIN pantries p " +
                                "ON ri.ingredient_id = p.ingredient_id AND p.owner_name = \'" + userName + "\' " +
                            "GROUP BY recipe_id " +
                            "HAVING (COUNT(*) > 1) AND ((COUNT(*) = COUNT(p.ingredient_id)) " +
                                    "OR (COUNT(*)  - 1 = COUNT(p.ingredient_id)) " +
                                    "OR (COUNT(*)  + 1 = COUNT(p.ingredient_id))) " +
                        ") q JOIN recipes r " +
                            "ON q.recipe_id = r.id";
        */

        var queryText = "SELECT * " +
                        "FROM " +
                        "( " +
                            "SELECT recipe_id " +
                            "FROM recipe_ingredients ri LEFT JOIN pantries p " +
                                "ON ri.ingredient_id = p.ingredient_id AND p.owner_name = \'" + userName + "\' " +
                            "GROUP BY recipe_id " +
                            "HAVING COUNT(*) = COUNT(p.ingredient_id) " +
                        ") q JOIN recipes r " +
                            "ON q.recipe_id = r.id";


        var queryDB = require('../database')(queryText, function(mssg, data) {
            
            if(data == null || data.length == 0 || data[0]['recipe_id'] == null) {
                sendMessage(res, 400, "Could not find any recipes from pantry items...", data, 
                                    "Could not find any recipes (recipe_id does not exist)");
           }
           else {
                //console.log("data: " + JSON.stringify(data, null, 2));
                sendMessage(res, 200, "Success!", data.splice(0,100), "Get recipe based on ingredients in pantry");
           }          
        }); 
    };

    /**
    *
    */
    var generateNutritionFacts = function (recipeID, res) {

        var totals = {
                recipe_id: recipeID, serving_size: 0.00, kcals: 0.00,
                protein: 0.00, fat: 0.00, carbohydrates: 0.00,
                fiber: 0.00, calcium: 0.00, iron: 0.00, magnesium: 0.00,
                phosphorous: 0.00, potassium: 0.00, sodium: 0.00,
                zinc: 0.00, copper: 0.00, manganese: 0.00,
                selenium: 0.00, vitc: 0.00, thiamin: 0.00,
                riboflavin: 0.00, niacin: 0.00, pantothenic_acid: 0.00,
                vitb6: 0.00, folate: 0.00, choline: 0.00, vitb12: 0.00,
                vita: 0.00, vite: 0.00, vitd: 0.00,
                vitk: 0.00, cholesterol: 0.00
            }; 

        var queryText = squel.select()
                            .from("recipes, recipe_ingredients as ri")
                            .from("ingredients as i")
                            .where("ri.recipe_id = " + recipeID)
                            .where("ingredient_id = i.id")
                            .where("recipes.id = ri.recipe_id")
                            .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) {                 
            
            if(data == null || data.length < 1) {
                sendMessage(res, 400, "Could not find recipe with id " + recipeID, data, "Generate nutrition facts for recipe");
                return;
            }

            //console.log("data: " + JSON.stringify(data));
            sumNutritionInfo(res, mssg, data);
        });

        function sumNutritionInfo(res, mssg, data) {

            for(var i = 0; i < data.length; i++) {

                var amountStr = data[i]['amount'];

                if(isNaN(amountStr) && isFinite(amountStr)) {
                    console.log("NaN!!");
                    continue;
                }

                var gramVal = parseFloat(amountStr); /// WHY DIVIDE BY 100???
                var recipeYield = parseFloat(data[i]['recipe_yield']);
                
                //console.log(data);

                updateTotals(res, totals, gramVal, recipeYield, data, i);
            }

            sendMessage(res, 200, mssg, totals, "Generate nutrition facts for recipe");
        }

        function updateTotals(res, totals, gramVal, recipeYield, data, i) {

            // nutrient content: V = (N * CM)/100; pg 44
            // grams
            totals['serving_size']      += gramVal;
            //console.log("gramVal: " + gramVal);
            //console.log("serving: " + recipeYield);
            //console.log("float: " + parseFloat(data[i]['kcals']));

            var mfloat = parseFloat(data[i]['kcals']);
            if(mfloat == 0 || gramVal == 0)
                return; 

            totals['kcals']             += (gramVal / 100) * (parseFloat(data[i]['kcals']));
            totals['protein']           += (gramVal / 100) * (parseFloat(data[i]['protein']));
            totals['fat']               += (gramVal / 100) * (parseFloat(data[i]['fat']));
            totals['carbohydrates']     += (gramVal / 100) * (parseFloat(data[i]['carbohydrates']));   

            // daily % value             
            totals['fiber']             += (parseFloat(data[i]['fiber']) * (gramVal / 100));
            totals['calcium']           += (parseFloat(data[i]['calcium']) * (gramVal / 100));
            totals['iron']              += (parseFloat(data[i]['iron']) * (gramVal / 100));
            totals['magnesium']         += (parseFloat(data[i]['magnesium']) * (gramVal / 100));
            totals['phosphorous']       += (parseFloat(data[i]['phosphorous']) * (gramVal / 100));
            totals['potassium']         += (parseFloat(data[i]['potassium']) * (gramVal / 100));
            totals['sodium']            += (parseFloat(data[i]['sodium']) * (gramVal / 100));
            totals['zinc']              += (parseFloat(data[i]['zinc']) * (gramVal / 100));
            totals['copper']            += (parseFloat(data[i]['copper'])  * (gramVal / 100));
            totals['manganese']         += (parseFloat(data[i]['manganese']) * (gramVal / 100));
            //console.log("manganese: " + parseFloat(data[i]['manganese'])/recipeYield * (gramVal / 100));

            totals['selenium']          += (parseFloat(data[i]['selenium']) * (gramVal / 100));
            totals['vitc']              += (parseFloat(data[i]['vitc']) * (gramVal / 100));
            totals['thiamin']           += (parseFloat(data[i]['thiamin']) * (gramVal / 100));
            totals['riboflavin']        += (parseFloat(data[i]['riboflavin']) * (gramVal / 100));
            totals['niacin']            += (parseFloat(data[i]['niacin']) * (gramVal / 100));
            totals['pantothenic_acid']  += (parseFloat(data[i]['pantothenic_acid']) * (gramVal / 100));
            totals['vitb6']             += (parseFloat(data[i]['vitb6']) * (gramVal / 100));
            totals['folate']            += (parseFloat(data[i]['folate']) * (gramVal / 100));
            totals['choline']           += (parseFloat(data[i]['choline']) * (gramVal / 100));
            totals['vitb12']            += (parseFloat(data[i]['vitb12']) * (gramVal / 100));
            totals['vita']              += (parseFloat(data[i]['vita']) * (gramVal / 100));
            totals['vite']              += (parseFloat(data[i]['vite']) * (gramVal / 100));
            totals['vitd']              += (parseFloat(data[i]['vitd']) * (gramVal / 100));
            totals['vitk']              += (parseFloat(data[i]['vitk']) * (gramVal / 100));
            totals['cholesterol']       += (parseFloat(data[i]['cholesterol']) * (gramVal / 100));
        }
    };

    /**
        Generates ingredients that, when added to the pantry, 
        will allow for more recipes
    */
    var getPossibleRecipes = function(user_name, res) {

        var queryText_check = "SELECT ri_inner.ingredient_id " +
                            "FROM recipe_ingredients ri_inner JOIN pantries p " +
                            "ON p.owner_name=\'" + user_name + "\' AND ri_inner.ingredient_id = p.ingredient_id " +
                            "LIMIT 1;";

        var queryDB_check = require('../database')(queryText_check, function(mssg, data) { 

            //console.log("data_check: " + JSON.stringify(data, null, 2));

            if(data == null || data.length < 1) {
                sendMessage(res, 400, "Either user has an invalid ingredient id or user does not exist: " + user_name, data, "Get possible recipes");
                return;
            }

            next_step(user_name, res);
        });

    function next_step(user_name, res) {

        var queryText = "SELECT * " +
                    "FROM recipe_ingredients ri_outer " +
                    "WHERE ri_outer.ingredient_id NOT IN " +
                    "( " +
                        "SELECT ri_inner.ingredient_id " +
                        "FROM recipe_ingredients ri_inner JOIN pantries p " +
                        "ON p.owner_name=\'" + user_name + "\' AND ri_inner.ingredient_id = p.ingredient_id " +
                    ");";

        var queryDB = require('../database')(queryText, function(mssg, data) {                 

            //console.log("data: ")
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
                        formatted[j]['ingredients_needed'].push({"ingredient_id":data[i]['ingredient_id'], "amount":data[i]['amount']});
                        formatted[j]['ingredients_needed_count'] += 1;
                    }
                }

                if(!keyExistsInArr) {

                    formatted.push(
                        {
                            "recipe_id": data[i]['recipe_id'],
                            "ingredients_needed_count": 1,
                            "ingredients_needed": [{"ingredient_id": data[i]['ingredient_id'], 
                                            "amount":data[i]['amount']
                            }]
                        }
                    );
                }
            }

            if(formatted.length == 0) {
                sendMessage(res, 400, "Could not find any other ingredients for any other recipes", [], "Get ingredients that, when added, will allow for more recipes");
            }

            formatted.sort(function(a, b) {
                return parseInt(a['ingredients_needed_count']) - parseInt(b['ingredients_needed_count']);
            });

                sendMessage(res, 200, mssg, formatted.slice(0,25), "Get ingredients that, when added, will allow for more recipes");
            });
        }
    };

    var getPossibleRecipesCombinedWithFriendsPantry = function(user_name, friend_name, res) {

        /*
        var queryText = 
                "SELECT * " +
                "FROM recipes " +
                "WHERE id IN (" +
                    "SELECT recipe_id as id " +
                    "FROM pantries, recipe_ingredients " +
                    "WHERE (recipe_ingredients.ingredient_id = pantries.ingredient_id) AND " + 
                    "(owner_name=\'" + user_name + "\' OR owner_name=\'" + friend_name + "\')" +
                ");"
        */

        var queryText = 
            "SELECT * " +
            "FROM " +
            "( " +
                "SELECT recipe_id " +
                "FROM recipe_ingredients ri LEFT JOIN pantries p " +
                    "ON ri.ingredient_id = p.ingredient_id " + 
                    "AND (p.owner_name = \'" + user_name + "\' OR p.owner_name = \'" + friend_name + "\') " +
                "GROUP BY recipe_id " +
                "HAVING COUNT(*) = COUNT(p.ingredient_id) " +
            ") q JOIN recipes r " +
                "ON q.recipe_id = r.id;";

        var queryDB = require('../database')(queryText, function(mssg, data) {
            //console.log(JSON.stringify(data, null, 2));

            if(data == null || data.length < 1) {
                sendMessage(res, 400, "Failed", data, "get possible recipes combining two pantries");
            }
            else{
                sendMessage(res, 200, mssg, data, "get possible recipes combining two pantries");
            }
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
        generatePossibleRecipesFromPantry: generatePossibleRecipesFromPantry,
        getRecipeByID: getRecipeByID,
        generateNutritionFacts: generateNutritionFacts,
        getPossibleRecipes: getPossibleRecipes,
        getPossibleRecipesCombinedWithFriendsPantry: getPossibleRecipesCombinedWithFriendsPantry,
        getRecipeIdByName: getRecipeIdByName
    };

}();

module.exports = RecipeFuncs;