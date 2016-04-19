/**
	This module handles all queries into the database, and is handled by the
	function "queryDB". After it queries, it will callback with a message.
*/

// psql command for cmd: psql -d food_test
// check column data types: psql -E ---(then)---> \d [table name]

var pg = require('pg');

var start = function(queryText, callBack) {

    /**
        DB connection info should be specified in "db_config.json" in the main directory. 
        See db_config_example.json for example.
    */
    var fs = require('fs');
    var file = fs.readFile('./db_config.json', 'utf8', function(err, data) {
        if(err)
            throw err;
        file = JSON.parse(data);

        // make connection string
        var connectionString = makeConnectionString(file);
        // then query asynchronously
        query(connectionString, queryText, callBack);
    });
}

function makeConnectionString(obj) {
    return process.env.DATABASE_URL || 'postgres://' + 
                    obj.user + ':' + obj.password + '@' + obj.host +
                    ':' + obj.port + '/' + obj.database;
}

function query(connectionString, queryText, callBack) {

    console.log("queryText: ", queryText);

    var client = new pg.Client(connectionString);

    var mRows = [];

    pg.connect(connectionString, function(err, client, done) {
          
        console.log("Querying database...");

        if(err) {
          done();
          console.log("Throwing the following error: " + err);
          return callBack(err, null);
        }

        if(client == null) {
            done();
            console.log("Having trouble connecting to the DB... :(");
            return callBack("Having trouble connecting to the DB... :(", null);
        }

        var query = client.query(queryText);

        query.on('row', function(row) {

            mRows.push(row);
            //console.log("row: " + JSON.stringify(row, null, 2));
        });

        query.on('error', function(err) {

            done();

            console.log("Problem querying database: " + err);
            return callBack("Problem querying database", err);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {

            done();

            console.log("Done. waiting for next query...");
            return callBack("Query successful!", mRows);
        });

    });
}

module.exports = function queryDB(queryText, callBack) {
    start(queryText, callBack);
}