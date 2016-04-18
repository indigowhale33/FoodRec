var squel = require("squel");

var PantryFuncs = function() {

    var getAllIngredients = function(res) {

        var queryText = squel.select()
                            .field("id")
                            .field("name")
                            .from("ingredients")
                            .toString();
        
        var dbQuery = require('../database')(queryText, function(mssg, data) {

            if(data == null || data.length < 1)
                sendMessage(res, 400, "No ingredients in ingredients table", data, "Get all ingredients");
            else
                sendMessage(res, 200, mssg, data, "Get all ingredients");
        });
    };

    var getIngredientByParams = function(input, res) {

        var name = input.ingredName;
        var id = input.ndbNum;

        if(name != null) {
            
            var queryText = squel.select()
                            .from("ingredients")
                            .where("name = ?", name)
                            .toString();

            var dbQuery = require('../database')(queryText, function(mssg, data) {
                
                if(data == null || data.length < 1)
                    sendMessage(res, 400, "Could not find ingredient by name " + name, data, "Get ingredient by params");
                else
                    sendMessage(res, 200, mssg, data, "Get ingredient by params");

            });
        }

        else if(id != null) {

            var queryText = squel.select()
                                .from("ingredients")
                                .where("id = " + id)
                                .toString();

            var dbQuery = require('../database')(queryText, function(mssg, data) {

                if(data == null || data.length < 1)
                    sendMessage(res, 400, "Could not find ingredient by id: " + id, data, "Get ingredient by params");
                else
                    sendMessage(res, 200, mssg, data, "Get ingredient by params");
            });
        }
    };

    var getIngredientBySubstring = function(substring, res) {

        var queryText = squel.select()
                            .field("id")
                            .field("name")
                            .from("ingredients")
                            .where("UPPER(name) LIKE UPPER(\'%" + substring + "%\')")
                            .toString();

        var dbQuery = require('../database')(queryText, function(mssg, data) {
            
            if(data == null || data.length < 1)
                    sendMessage(res, 400, "Could not find ingredient with substring: " + substring, data, "Get ingredient containing substring");
            else
                sendMessage(res, 200, mssg, data, "Get ingredient containing substring");
        });
    };

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
        getAllIngredients: getAllIngredients,
        getIngredientByParams: getIngredientByParams,
        getIngredientBySubstring: getIngredientBySubstring
    };

}();

module.exports = PantryFuncs;