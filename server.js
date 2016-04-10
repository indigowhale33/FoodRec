var express    = require('express');
var app        = express();
var router     = express.Router(); 
var path       = require('path');
var bodyParser = require('body-parser');

var ingredientsRouter	= require('./routes/ingredientsRouter');
var recipeRouter = require('./routes/recipeRouter');
var pantryRouter = require('./routes/pantryRouter');
var authRouter = require('./routes/authRouter');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// REGISTER OUR ROUTES -------------------------------
// all routes will be prefixed with /api
app.use('/api', recipeRouter);
app.use('/api', ingredientsRouter);
app.use('/api', pantryRouter);
app.use('/api', authRouter);

app.use(express.static(path.join(__dirname, 'public')));

// START THE SERVER
// =====================================================
app.listen(port);
console.log('Listening on port ' + port + '...');
console.log('Server time: ' + getDateTime());

function getDateTime() {

    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}