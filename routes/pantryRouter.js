var express = require('express');
var Pantry  = require('../models/pantry');
var squel = require("squel");
var router = express.Router();
var pantryFuncs = require('./PantryFuncs');

router.use(function(req, res, next) {
    console.log("REQUEST: ", req.method, req.url);
    next();
});

// ROUTE INFO
// =============================================================================
router.route('/pantry')
    .get(function(req, res) {
        res.send("You didn't specify any arguments!<br>Here are some which are currently supported:<br><br>" + 
                "pantry/params<br><br>" +
                "Parameters are:<br/>" + 
                "pantry_id -- pantry id<br/>" +
                "pantry_name -- pantry name<br/>" +
                "owner_name -- name of owner<br/>" +
                "ingredient_id -- ingredients inside pantry<br/>" + 
                "amount -- amount of the ingredient<br/>"
        );
    });

/**
    WORKS -- I TESTED W/ REMOTE DB

    Retrieve pantry by owner_name

    Params: owner_name

    ex:
    (1) http://localhost:8080/api/getPantry/params?owner_name=alien1
*/
router.route('/pantry/getPantry/params')
    .get(function(req, res) {

        pantryFuncs.getPantry(req.query.owner_name, res);
    });

/*

    WORKS -- I TESTED W/ REMOTE DB

    Insert ingredient into user pantry

    Params: owner_name, ingredient_id, amount

    http://localhost:8080/api/pantry/addIngredientToPantry/params?owner_name=Martha&ingredient_id=10000&amount=59
*/
router.route('/pantry/addIngredientToPantry/params')
    .post(function(req, res) {

        var userName = req.query.owner_name;
        var ingredientToAdd = req.query.ingredient_id;
        var amount = req.query.amount;

        pantryFuncs.addIngredientToPantry(userName, ingredientToAdd, amount, res);
    });

/**
    WORKS -- I TESTED ON REMOTE DB

    Delete ingredients from user pantry

    Params: owner_name, ingredient_id

    http://localhost:8080/api/pantry/deleteIngredient/params?owner_name=Martha&ingredient_id=10000
*/
router.route('/pantry/deleteIngredient/params')
    .post(function(req, res) {

        pantryFuncs.deleteIngredientFromPantry(req.query.owner_name, 
            req.query.ingredient_id, res);
    });

module.exports = router;