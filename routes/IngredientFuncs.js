var squel = require("squel");

var PantryFuncs = function() {

    var getAllIngredients = function(res) {

        var queryText = squel.select()
                            .from("ingredients")
                            .toString();
        
        var dbQuery = require('../database')(queryText, function(mssg, data) {
            res.status(200).json({"message": mssg, "requestType": "Get all ingredients", "data": data});
        });

        return;
    }

    var getIngredientByParams = function(input, res) {

        var name = input.ingredName;
        var ndb_num = input.ndbNum;

        console.log(name);
        console.log(ndb_num);

        if(name != null) {
            
            var queryText = squel.select()
                            .from("ingredients")
                            .where("name = ?", name)
                            .toString();
                            
            console.log(queryText);

            var dbQuery = require('../database')(queryText, function(mssg, data) {
                res.json({"message": mssg, "requestType": "Get ingredient by params", "data": data});
            });
        }

        else if(ndb_num != null) {

            var queryText = squel.select()
                                .from("ingredients")
                                .where("ndb_num = ?", ndb_num)
                                .toString();
            console.log(queryText);

            var dbQuery = require('../database')(queryText, function(mssg, data) {
                res.json({"message": mssg, "requestType": "Get by params", "data": data});
            })
        }
    }

    return {
        getAllIngredients: getAllIngredients,
        getIngredientByParams: getIngredientByParams
    }

}();

module.exports = PantryFuncs;