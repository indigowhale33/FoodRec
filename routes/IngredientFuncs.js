var squel = require("squel");

var PantryFuncs = function() {

    var getAllIngredients = function(res) {

        var queryText = squel.select()
                            .field("nbd_num")
                            .field("name")
                            .from("ingredients")
                            .toString();
        
        var dbQuery = require('../database')(queryText, function(mssg, data) {
            sendMessage(res, mssg, data, "Get all ingredients");
        });
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
                sendMessage(res, mssg, data, "Get ingredient by params");
            });
        }

        else if(ndb_num != null) {

            var queryText = squel.select()
                                .from("ingredients")
                                .where("nbd_num = ?", ndb_num)
                                .toString();
            console.log(queryText);

            var dbQuery = require('../database')(queryText, function(mssg, data) {
                sendMessage(res, mssg, data, "Get ingredient by params");
            })
        }
    }

    function sendMessage(res, mssg, mRows, requestType) {

        var response = {};

        response['result'] = mssg;
        response['requestType'] = requestType;
        response['data'] = mRows;

        if(mssg == "Problem querying database")
            response['status'] = 400;
        else
            response['status'] = 200;

        res.set("Access-Control-Allow-Origin", "*");
        res.json(response);
    }

    return {
        getAllIngredients: getAllIngredients,
        getIngredientByParams: getIngredientByParams
    }

}();

module.exports = PantryFuncs;