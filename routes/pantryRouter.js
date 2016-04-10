var express = require('express');
var Pantry  = require('../models/pantry');
var squel = require("squel");
var router = express.Router();
var pantryFuncs = require('./pantryFuncs');

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
                "pantryID -- pantry id<br/>" +
                "pantryName -- pantry name<br/>" +
                "ownerName -- name of owner<br/>" +
                "contents -- ingredients inside pantry<br/>" + 
                "toAdd -- ingredient to add into contents<br/>"
        );
    });

/*
    Retrieve pantry.

    Params: pantryID, ownerName

    ex:
    (1) http://localhost:8080/api/pantry/params?ownerName=alien3&pantryID=3
*/
router.route('/pantry/getPantry/params')
    .get(function(req, res) {

        var pantry = new Pantry(
                        req.query.pantryID,
                        null,
                        req.query.ownerName,
                        null);

        pantryFuncs.getFromPantry(pantry, res);
    })

/**
    Insert a new pantry

    Params: pantryID, pantryName, ownerName, contents

    ex: http://localhost:8080/api/pantry/params?pantryID=1&pantryName=newName&ownerName=ex1&contents=Apples Bananas Oranges
*/
router.route('/pantry/insertNewPantry/params')
    .put(function(req, res) {

        var pantry = new Pantry(
                            req.query.pantryID,
                            req.query.pantryName,
                            req.query.ownerName,
                            req.query.contents );

        pantryFuncs.insertIntoPantry(pantry, res);
    })

/*
    Insert ingredient into user pantry

    Params: pantryID, pantryName, ownerName, toAdd

    http://localhost:8080/api/pantry/addItemToPantry/params?pantryName=New Pantry&ownerName=ex1&pantryID=4&toAdd=Cheese
*/
router.route('/pantry/addIngredientToPantry/params')
    .post(function(req, res) {

        var userName = req.query.ownerName;
        var ingredientToAdd = req.query.toAdd;
        var pantryID = req.query.pantryID;
        var pantryName = req.query.pantryName;

        console.log("to add: ", ingredientToAdd);

        // check if ingredient already exists
        var mRows = [];
        var existsText = squel.select()
                                .from("pantries")
                                .where("contents = ?", ingredientToAdd)
                                .where("owner_name = ?", userName)
                                .toString();
        console.log(existsText);

        var queryDB = require('../database')(existsText, function(mssg, data) {

            // if ingredient not in pantry, add it
            if(mRows.length === 0) {
                var pantry = new Pantry(pantryID, pantryName, userName, ingredientToAdd);
                pantryFuncs.updatePantryContents(pantry, res);
            }
            // ingredient already in pantry, 
            else {
                return res.json({"message": "Ingredient already exists...", "queryType": "Insert into pantry", "data": data});
            }
        });
    });

module.exports = router;