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
    (1) http://localhost:8080/api/generateNutritionFacts/params?id=10000
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
    (1) http://localhost:8080/api/getRecipe/params?id=1
*/
router.route('/recipes/getRecipe/params')
    .get(function(req, res) {

        recipeFuncs.getRecipeByID(req.query.id, res);
    });


module.exports = router;