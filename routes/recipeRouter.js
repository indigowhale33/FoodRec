var express = require('express');
var app        = express();
var router  = express.Router();
var squel   = require("squel");
var Recipe  = require('../models/recipe');
var recipeFuncs = require('./RecipeFuncs');

// ROUTES
// =============================================================================
router.route('/recipes')
    .get(function(req, res) {
        res.send("You didn't specify any arguments!<br/>" +
                "Here are some which are currently supported:<br/><br/>" + 
                "Parameters:<br/>" +
                "user_name -- user name<br/>" +
                "recipe_name -- name of recipe<br/>" +
                "ingredients -- ingredients for that recipe<br/>" +
                "url -- url to original recipe page<br/>" +
                "image -- url to image of recipe<br/>" +
                "date_published -- date published<br/>" +
                "cook_time -- cook time<br/>" +
                "source -- web source of recipe<br/>" +
                "recipe_yield -- how many people does this recipe serve?<br/>" +
                "id -- recipe id<br/>" +
                "prep_time -- how long does it take to prep recipe before cooking?<br/>" +
                "description -- description of recipe<br/>"
            );
    });

/**
    WORKS -- TESTED ON REMOTE DB

    Generate possible recipes from the ingredients in user's pantry
    Does not calculate possible recipes based on amounts.

    Params: user_name

    http://localhost:8080/api/recipes/generatePossibleRecipesFromPantry/params?user_name=Martha
*/
router.route('/recipes/generatePossibleRecipesFromPantry/params')

    .get(function(req, res) {

        recipeFuncs.generatePossibleRecipesFromPantry(req.query.user_name, res);
    });

/**
    WORKS -- I TESTED W/ REMOTE DB
        NOTE: the basic JSON return structure is ready, but I need to revise the underlying logic

    Generate nutrition facts for a particular recipe. Per specification:

    serving_size, kcals, protein, fat, and carbohydrates are in grams
    all other nutrients are in daily percent % (per 2,000 calories)

    Params: id

    ex:
    (1) http://localhost:8080/api/recipes/generateNutritionFacts/params?id=10000
*/
router.route('/recipes/generateNutritionFacts/params')
    .get(function(req, res) {

        recipeFuncs.generateNutritionFacts(req.query.id, res);
    });

/**
    WORKS -- I TESTED W/ REMOTE DB

    Get a particular recipe by id

    Params: id

    ex:
    (1) http://localhost:8080/api/recipes/getRecipe/params?id=1
*/
router.route('/recipes/getRecipe/params')
    .get(function(req, res) {

        recipeFuncs.getRecipeByID(req.query.id, res);
    });

/**

    WORKS! TESTED W/ REMOTE DB

    Generates ingredients that, when added to the pantry, 
    will allow for more recipes. Logic behind it WORKS...

    Params: user_name

    ex: 
    (1) http://localhost:8080/api/recipes/getPossibleRecipes/params?user_name=10000

    Returns: 

    {
      "status": 200,
      "result": "Query successful!",
      "requestType": "Get ingredients that, when added, will allow for more recipes",
      "data": [
        {
          "recipe_id": 10299,
          "ingredients_needed_count": 1,
          "ingredients_needed": [
            {
              "ingredient_id": 13880,
              "amount": "teaspoon 1"
            }
          ]
        },
        {
          "recipe_id": 10050,
          "ingredients_needed_count": 1,
          "ingredients_needed": [
            {
              "ingredient_id": 13539,
              "amount": "ounce 1"
            }
          ]
        },
        ...
    }

    This call will return a JSON that looks like the above. Each JSON returns a 
    list of recipes that can potentially be made with a few more ingredients. 

    It's sorted by "ingredients_needed_count", which is the total number of ingredients still needed to 
    cook that recipe. I also gave the list of ingredients that the user would need on top of 
    items in the pantry in order to cook that recipe.
*/
router.route('/recipes/getPossibleRecipes/params')
    .get(function(req, res) {

        recipeFuncs.getPossibleRecipes(req.query.user_name, res);
    });

router.route('/recipes/getPossibleRecipesCombinedWithFriendsPantry/params')
    .get(function(req, res) {

        recipeFuncs.getPossibleRecipesCombinedWithFriendsPantry(req.query.user_name, req.query.friend_name, res);
    });

module.exports = router;