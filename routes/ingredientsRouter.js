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
                "ingredName -- name of ingredient<br/>" +
                "ndbNum -- ndb_num of the ingredient>br/>");
    });

/**
    Obtains all possible ingredient names from 
    the ingredients table.

    Params: none
*/
router.route('/ingredients/getAll')
    .get(function(req, res) {
        ingredientFuncs.getAllIngredients(res);
    });

/*
    Get ingredients by either their names OR their ndb_num

    Params: ingredName OR nbdNum OR both

    ex: 
    (1) http://localhost:8080/api/ingredients/params?ingredName=Butter
    (2) http://localhost:8080/api/ingredients/params?ndbNum=2222
    (3) http://localhost:8080/api/ingredients/params?ingredName=Butter&ndbNum=1
*/
router.route('/ingredients/getIngredient/params')
    .get(function(req, res) {

        console.log("get ingredient");

        var ingred = new Ingredient(req.query.ingredName, req.query.nbdNum);
        ingredientFuncs.getIngredientByParams(ingred, res);
    })

    /**
        Cannot insert ingredient because we are using an existing set of ingredients
    */

module.exports = router;