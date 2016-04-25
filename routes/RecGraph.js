var Helper = require('./RecGraphHelper');

var RecGraph = function() {

	/**

        (1) Build a network of recipes that share common ingredients.
            --> done by building a subset of other recipes the input
                recipe closely shares with other ingredients. This is
                done with a query, then ordering recipes in descending
                order of how many ingredients they share with each other.
        (2) In this network, recipes that share similar ingredients are
            linked together, and recipes that share the most ingredients 
            together are neighbors.
        (3) However, defining recipe neighborhood by the number of
            ingredients that they share in common is not helpful for
            recommendation. For instance, a pecan cake and an apple pie
            share many ingredients in common, but they are defined by several
            key ingredients
        (4) Therefore, it would be more useful to see the mass fraction
            that each ingredient contributes to the overall recipe.
        (5) Represent each recipe as a vector of all ingredients needed
            to cook them
		(6) The value of each ingredient is the mass fraction of what the
			corresponding ingredient takes up in the recipe
        (7) To measure the similarity between two recipes, take the cosine
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
		Helper.getPossibleRecipes(res, user_name, recipe_id, function(mssg, data) {

            performCalculations(res, user_name, recipe_id, data);
        });
	};

    function performCalculations(res, user_name, recipe_id, data) {

        var allCos = [];
        var x = []; // my recipe
        var myRecipeName = '';

        for(var i = 0; i < data.length; i++) {

            if(data[i]['recipe_id'] == recipe_id) {
                //console.log("fond recipe!");
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
            if(isNaN(cosSimilarity))
                continue;

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
        
        sendMessage(res, 200, "Success", allCos.splice(0,100), "Generate similar recipes by cosine similarity");
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

        var n = 0;
        var lim = Math.min(x.length, y.length);
       
        for (var i = 0; i < lim; i++) {
            n += x[i] * y[i];
        }

        return n;
    }

    function makeVector(arr, recipeData) {
        
        var totalMass = 0.0;

        // determine total mass of current recipe
        for(var i = 0; i < recipeData['ingredients'].length; i++) {
            
            var curNum = parseFloat(recipeData['ingredients'][i]['amount']);

            if(isNaN(curNum))
                continue;
            if(ingredientIsUnimportant(recipeData['ingredients'][i]['recipe_id']))
                continue;

            totalMass += curNum;
        }

        // determine mass fraction of ingredients
        for(var i = 0; i < recipeData['ingredients'].length; i++) {
            arr.push(parseFloat(recipeData['ingredients'][i]['amount']) / totalMass);
        }
    }

    function ingredientIsUnimportant(curRecipe) {

        /* 
            long boolean chain statement because
            of time complexity concerns (i didn't want
            it to search linearly through an array)
        */
        return curRecipe == 13643 || curRecipe == 13651 || 
                curRecipe == 12191 || curRecipe == 10000 || 
                curRecipe == 10001 || curRecipe == 10002 || 
                curRecipe == 10078 || curRecipe == 12931 ||
                curRecipe == 12979 || curRecipe == 12902 ||
                curRecipe == 10161 || curRecipe == 13034 ||
                curRecipe == 11445 || curRecipe == 11462 ||
                curRecipe == 11492 || curRecipe == 13427 ||
                curRecipe == 11378 || curRecipe == 13023 ||
                curRecipe == 13063 || curRecipe == 13020
                ;
    }

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
        recommendRecipesCosineSimilarity: recommendRecipesCosineSimilarity
    }
}();

module.exports = RecGraph;