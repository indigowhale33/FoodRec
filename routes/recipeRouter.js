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
                "userName -- user name<br/>" +
                "recipeName -- name of recipe<br/>" +
                "ingredients -- ingredients for that recipe<br/>" +
                "prepTime -- time to prepare ingredient<br/>" +
                "description -- description of recipe<br/>" +
                "directions -- recipe directions<br/>"
            );
    });

/**
    Generate possible recipes from the ingredients in user's pantry

    Params: userName
*/
router.route('/recipes/generatePossibleRecipesFromPantry/params')

    .get(function(req, res) {

        var userName = req.query.userName;

        console.log(userName);
        recipeFuncs.generatePossibleRecipesFromPantry(userName, res);
    });

/**
    Insert recipe

    Params: recipeName, ingredients, prepTime, description, directions

    ex:
    (1) http://localhost:8080/api/insertRecipe/params?recipeName=Chicken Soup&
        ingredients=Chicken Broth Garlic&prepTime=00:35&description=A sweet meal&
        directions=First, cook broth, then add chicken
*/
router.route('/recipes/insertRecipe/params')
    .post(function(req, res) {

        var newRecipe = new Recipe (
                            req.query.recipeName,
                            req.query.ingredients,
                            req.query.prepTime,
                            req.query.description,
                            req.query.directions
                        );

        recipeFuncs.insert(newRecipe, res);
    });

/**
    Generate nutrition facts for a particular recipe

    Params: recipeName

    ex:
    (1) http://localhost:8080/api/insertRecipe/params?recipeName=Chicken Soup
*/
router.route('/recipes/generateNutritionFacts/params')
    .get(function(req, res) {

        // TODO
    });

/**
    Get a particular recipe by id

    Params: recipeID

    ex:
    (1) http://localhost:8080/api/getRecipe/params?recipeID=1
*/
router.route('/recipes/getRecipe/params')
    .get(function(req, res) {
        recipeFuncs.getRecipeByID(req.query.recipeID, res);
    });


module.exports = router;