var express = require('express');
var router = express.Router();
var ingredientFuncs = require('./IngredientFuncs');
var Ingredient = require('../models/ingredient');

// ROUTES
// =============================================================================
router.route('/ingredients')
    .get(function(req, res) {
        res.send("You didn't specify any arguments!<br/>" +
                "Here are some which are currently supported:<br/><br/>" + 
                "Parameters:<br/>" +
                "name -- name column of ingredients table<br/>" +
                "id -- id column of the ingredients table>br/>");
    });

/**

    WORKS -- I TESTED w/ REMOTE DB

    Obtains all possible ingredient names from 
    the ingredients table.

    Params: none
*/
router.route('/ingredients/getAll')
    .get(function(req, res) {
        ingredientFuncs.getAllIngredients(res);
    });






/*
    WORKS -- I TESTED w/ REMOTE DB

    Get ingredients containing a certain substring.
    Useful for filtering ingredients based on what user inputs.
    Case insensitive.

    Params: substring

    ex: 
    (1) http://localhost:8080/api/ingredients/params?substring=chicken
*/
router.route('/ingredients/getIngredientBySubstring/params')
    .get(function(req, res) {

        ingredientFuncs.getIngredientBySubstring(req.query.substring, res);
    })

router.route('/ingredients/getAllName')
    .get(function(req, res) {
        ingredientFuncs.getAllName(res);
    });


/*
    WORKS -- I TESTED W/ REMOTE DB

    Get ingredients by either their name OR id

    Params: name OR id

    ex: 
    (1) http://localhost:8080/api/ingredients/params?ingredName=Butter
    (2) http://localhost:8080/api/ingredients/params?id=2222
*/
router.route('/ingredients/getIngredient/params')
    .get(function(req, res) {
        var ingred = new Ingredient(req.query.name, req.query.id);
        ingredientFuncs.getIngredientByParams(ingred, res);
    });

module.exports = router;