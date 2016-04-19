var squel   = require('squel');
var async   = require('async');

var RecipeFuncs = function() {

    /**
    *   Get recipe by ID
    */
    var getRecipeByID = function(id, res) {

        var queryText = squel.select()
                            .from("recipes")
                            .where("id = ?", id)
                            .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) {
            
            if(data == null || data.length < 1) {
                sendMessage(res, 400, "Could not find any recipe matching that ID", data, "Get recipe by ID");
            }
            else {
                sendMessage(res, 200, mssg, data, "Get recipe by ID");
            }
        });
    };

    /**
        Generates all possible recipes based on
        ingredients from the user's pantry.
    */
    var generatePossibleRecipesFromPantry = function(userName, res) {

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
                sendMessage(res, 200, "Success!", data, "Get recipe based on ingredients in pantry");
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

        var units = ['cup', 'teaspoon', 'tablespoon', 'inch', 
                    'ounce', 'oz', 'pound', 'lb', 'pint', 'gram', 'g'];

        var queryText = squel.select()
                                .from("recipe_ingredients as ri")
                                .from("ingredients as i")
                                .where("ri.recipe_id = " + recipeID)
                                .where("ingredient_id = i.id")
                                .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) {                 
            
            if(data == null || data.length < 1) {
                sendMessage(res, 400, "Could not find recipe with id " + recipeID, data, "Generate nutrition facts for recipe");
                return;
            }

            sumNutritionInfo(res, mssg, data);
        });

        function sumNutritionInfo(res, mssg, data) {

            for(var i = 0; i < data.length; i++) {

                var amountStr = data[i]['amount'];
                var amountArr = amountStr.split(' ');

                var j;
                var unitsNdx;
                for(j = 0; j < amountArr.length; j++) {
                    unitsNdx = findInArray(units, amountArr[j]);
                    if(unitsNdx >= 0) {
                        break;
                    }
                }

                if(j >= amountArr.length - 1)
                    continue;

                var parsed;

                // check if fraction
                if(findInArray(amountArr[j+1], '/') >= 0) {
                    parsed = eval(amountArr[j+1]);
                }
                // else if not fraction but is a numeric value
                else if(!isNaN(parseFloat(amountArr[j+1])) && isFinite(amountArr[j+1])) {
                    parsed = parseFloat(amountArr[j+1]);                        
                }
                // else if NaN
                else {
                    console.log("NaN!!");
                    continue;
                }

                var gramVal = convertToGrams(parsed, unitsNdx)/100;
                updateTotals(res, totals, gramVal, data, i);
            }

            sendMessage(res, 200, mssg, totals, "Generate nutrition facts for recipe");
        }

        function updateTotals(res, totals, gramVal, data, i) {

            // nutrient content: V = (N * CM)/100; pg 44
            // grams
            totals['serving_size']      += gramVal;
            totals['kcals']             += (parseFloat(data[i]['kcals']) * gramVal)/100;
            totals['protein']           += (parseFloat(data[i]['protein']) * gramVal)/100; 
            totals['fat']               += (parseFloat(data[i]['fat']) * gramVal)/100;
            totals['carbohydrates']     += (parseFloat(data[i]['carbohydrates']) * gramVal)/100;   

            // daily % value             
            totals['fiber']             += (parseFloat(data[i]['fiber']) * gramVal);
            totals['calcium']           += (parseFloat(data[i]['calcium']) * gramVal);
            totals['iron']              += (parseFloat(data[i]['iron']) * gramVal);
            totals['magnesium']         += (parseFloat(data[i]['magnesium']) * gramVal);
            totals['phosphorous']       += (parseFloat(data[i]['phosphorous']) * gramVal);
            totals['potassium']         += (parseFloat(data[i]['potassium']) * gramVal);
            totals['sodium']            += (parseFloat(data[i]['sodium']) * gramVal);
            totals['zinc']              += (parseFloat(data[i]['zinc']) * gramVal);
            totals['copper']            += (parseFloat(data[i]['copper'])  * gramVal);
            totals['manganese']         += (parseFloat(data[i]['manganese']) * gramVal);
            totals['selenium']          += (parseFloat(data[i]['selenium']) * gramVal);
            totals['vitc']              += (parseFloat(data[i]['vitc']) * gramVal);
            totals['thiamin']           += (parseFloat(data[i]['thiamin']) * gramVal);
            totals['riboflavin']        += (parseFloat(data[i]['riboflavin']) * gramVal);
            totals['niacin']            += (parseFloat(data[i]['niacin']) * gramVal);
            totals['pantothenic_acid']  += (parseFloat(data[i]['pantothenic_acid']) * gramVal);
            totals['vitb6']             += (parseFloat(data[i]['vitb6']) * gramVal);
            totals['folate']            += (parseFloat(data[i]['folate']) * gramVal);
            totals['choline']           += (parseFloat(data[i]['choline']) * gramVal);
            totals['vitb12']            += (parseFloat(data[i]['vitb12']) * gramVal);
            totals['vita']              += (parseFloat(data[i]['vita']) * gramVal);
            totals['vite']              += (parseFloat(data[i]['vite']) * gramVal);
            totals['vitd']              += (parseFloat(data[i]['vitd']) * gramVal);
            totals['vitk']              += (parseFloat(data[i]['vitk']) * gramVal);
            totals['cholesterol']       += (parseFloat(data[i]['cholesterol']) * gramVal);
        }

        function convertToGrams(parsed, unitsNdx) {

            var gramVal;

            // cup
            if(unitsNdx == 0) {
                gramVal = parsed * 236.58824;
            }
            // teaspoon
            else if(unitsNdx == 1) {
                gramVal = parsed * 5;
            }
            // tablespoon
            else if(unitsNdx == 2) {
                gramVal = parsed * 15; 
            }
            // cubic inch
            else if(unitsNdx == 3) {
                gramVal = parsed * parsed * parsed * 16.3870640693;
            }
            // ounce
            else if(unitsNdx == 4 || unitsNdx == 5) {
                gramVal = parsed * 28.3495;
            }
            // pound mass
            else if(unitsNdx == 6 || unitsNdx == 7) {
                gramVal = parsed * 453.592;
            }
            // pint
            else if(unitsNdx == 8) {
                gramVal = parsed * 473.1764750005525;
            }

            // more to add if i find more in recipe_inredients table

            return gramVal;
        }

        function findInArray(arr, word) {
            return arr.indexOf(word);
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
        generatePossibleRecipesFromPantry: generatePossibleRecipesFromPantry,
        getRecipeByID: getRecipeByID,
        generateNutritionFacts: generateNutritionFacts
    };

}();

module.exports = RecipeFuncs;