var squel = require('squel');

var RecGraph = function() {

	/**
		Represent each recipe as a vector of all ingredients in the kitchen
	
		The value of each ingredient is the mass fraction of what the
			corresponding ingredient takes up in the recipe

		To measure the similarity between two recipes, take the cosine
			similarity between their vectors


		Cosine similarity:
				  x * y
				----------
				||x||||y||

		x is a vector of mass fraction of each ingredient for recipe 1
		y is a vector mass fractions of each ingredient for recipe 2

        x * y is the dot product
        ||y||||x|| is product of the vector magnitude
	*/
	var recommendRecipesCosineSimilarity = function(res, user_name, recipe_id) {

		// get list of possible recipes
		getPossibleRecipes(res, user_name, recipe_id, function(mssg, data) {

            performCalculations(res, user_name, recipe_id, data);
        });
	};

    function performCalculations(res, user_name, recipe_id, data) {

        var allCos = [];
        var x = []; // my recipe
        var myRecipeName = '';

        for(var i = 0; i < data.length; i++) {

            if(data[i]['recipe_id'] == recipe_id) {
                console.log("fond recipe!");
                makeVector(x, data[i]);
                myRecipeName = data[i]['recipe_name'];
                break;
            }
        }

        console.log("x: " + x);

        for(var i = 0; i < data.length; i++) {

            if(data[i]['recipe_id'] == recipe_id)
                continue;
            if(data[i]['recipe_name'] == null)
                continue;

            var y = []; // working recipe
            makeVector(y, data[i]);
            
            //console.log(myRecipeName);
            //console.log(data[i]['recipe_name']);

            /*
            var str1 = myRecipeName.split(" ");
            //console.log("last str1: " + str1);
            var str2 = data[i]['recipe_name'].split(" ");
            //console.log("last str2: " + str2);

            // determine the lowest levenshtein distance
            var curDistance = levenshteinDistance(str1[0], str2[0]);
            for(var m = 0; m < str1.length; m++) {
                for(var n = 0; n < str2.length; n++) {
                    var tmp = levenshteinDistance(str1[m], str2[n]);
                    if(tmp < curDistance) {
                        curDistance = tmp;
                    }
                }
            
            }

            //var levenstein = levenshteinDistance(str1[str1.length-1], str2[str2.length-1]);
            x.push(curDistance);
            y.push(curDistance);
            */

            var cosSimilarity = cosineSimilarity(x,y);
            //console.log("recipe_name: " + data[i]['recipe_name']);
            //console.log("leventstein: " + levenstein);

            //console.log("cos_sim: " + cosSimilarity);
            allCos.push({
                "recipe_id": data[i]['recipe_id'],
                "similarity_percent": cosSimilarity
            });
        }

        allCos.sort(function(a, b) {
            return parseFloat(b['similarity_percent']) - parseFloat(a['similarity_percent']);
        });

        
        //console.log("********************");
        /*
        for(var i = 0; i < allCos.length; i++) {
            
            if(i < 100)
                console.log("ALL: " + JSON.stringify(allCos[i]));
        }
        */
        
        sendMessage(res, 200, "Success", allCos.splice(0,50), "Generate similar recipes by cosine similarity");
    }

    function levenshteinDistance(str1, str2) {

        //console.log("str1; " + str1);

        if(str1.length == 0)
            return str2.length; 
        if(str2.length == 0)
            return str1.length; 

        var matrix = [];

        // increment along the first column of each row
        var i;
        for(i = 0; i <= str2.length; i++){
        matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for(j = 0; j <= str1.length; j++){
        matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for(i = 1; i <= str2.length; i++) {

            for(j = 1; j <= str1.length; j++) {

                if(str2.charAt(i-1) == str1.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } 
                else {

                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                        Math.min(matrix[i][j-1] + 1, // insertion
                                                 matrix[i-1][j] + 1)); // deletion
              }
            }
        }

        return (matrix[str2.length][str1.length]) / (Math.max(str1.length, str2.length));

    }

    function cosineSimilarity(x, y) {

        var dot = dotProduct(x, y);
        var vecMagX = vectorMagnitude(x);
        var vecMagY = vectorMagnitude(y);

        return dot / (vecMagX * vecMagY);
    }

    function vectorMagnitude(vec) {

        var sum = 0;
        for (var i = 0; i < vec.length; i++) {
            sum += vec[i] * vec[i];
        }
        return Math.sqrt(sum);
    }

    function dotProduct(x, y) {

        //console.log(x);
        //console.log("y: " + y);
        var n = 0;
        var lim = Math.min(x.length, y.length);
        //x.sort();
        //y.sort();
       
        for (var i = 0; i < lim; i++) {

            //if(i == lim -1) {
            //    n += x[i];
            //}
            n += x[i] * y[i];
        }

        //console.log("dot product: " + n);
        return n;
    }

    function makeVector(arr, recipeData) {
        
        //console.log("recipedata: " + JSON.stringify(recipeData, null, 2));

        var totalMass = 0.0;
        // determine total mass of current recipe
        for(var i = 0; i < recipeData['ingredients'].length; i++) {
            
            var curNum = parseFloat(recipeData['ingredients'][i]['amount']);

            if(isNaN(curNum))
                continue;

            totalMass += curNum;
        }

        //console.log("totalMass: " + totalMass);
        // determine mass fraction of ingredients
        for(var i = 0; i < recipeData['ingredients'].length; i++) {
            arr.push(parseFloat(recipeData['ingredients'][i]['amount']) / totalMass);
        }

        //console.log(arr);
    }


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


	/**
        Generates ingredients that, when added to the pantry, 
        will allow for more recipes
    */
    var getPossibleRecipes = function(res, user_name, recipe_id, callback) {

    	// limit 10 because we don't need a lot to verify...
        var queryText_check = 
                            "SELECT ri_inner.ingredient_id " +
                            "FROM recipe_ingredients ri_inner JOIN pantries p " +
                            "ON p.owner_name=\'" + user_name + "\' AND ri_inner.ingredient_id = p.ingredient_id " +
                            "LIMIT 5;";

        var queryDB_check = require('../database')(queryText_check, function(mssg, data) { 

            if(data == null || data.length < 1) {
                sendMessage(res, 400, "Either user has an invalid ingredient id or user does not exist: " + user_name, data, "Get possible recipes");
                return;
            }

            next_step(res, user_name, recipe_id, callback);
        });

        function next_step(res, user_name, recipe_id, callback) {

            var queryText = "SELECT recipe_id, recipe_name, ingredient_id, amount " +
                        "FROM recipes, recipe_ingredients ri_outer " +
                        "WHERE (recipes.id = ri_outer.recipe_id) AND (ri_outer.recipe_id = " + recipe_id + " OR ri_outer.ingredient_id NOT IN " +
                        "( " +
                            "SELECT ri_inner.ingredient_id " +
                            "FROM recipe_ingredients ri_inner JOIN pantries p " +
                            "ON p.owner_name=\'" + user_name + "\' AND ri_inner.ingredient_id = p.ingredient_id " +
                        "));";

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

                //console.log("DATA: " + JSON.stringify(formatted, null, 2));
                callback(mssg, formatted);
                
            });
        }
    };

    function getRecipeByID(res, id, callback) {

        var queryText = squel.select()
                            .from("recipes")
                            .where("id = ?", id)
                            .toString();

        var queryDB = require('../database')(queryText, function(mssg, data) {
            
            if(data == null || data.length < 1) {
                sendMessage(res, 400, "Could not find any recipe matching that ID", data, "Get recipe by ID");
            }
            else {
                callback(mssg, data);
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
		recommendRecipesCosineSimilarity: recommendRecipesCosineSimilarity,
		getPossibleRecipes: getPossibleRecipes
	}

}();

module.exports = RecGraph;