var express    = require('express');
var app        = express();
var router     = express.Router(); 
var path       = require('path');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var http = require('http');

var ingredientsRouter	= require('./routes/ingredientsRouter');
var recipeRouter = require('./routes/recipeRouter');
var pantryRouter = require('./routes/pantryRouter');
var authRouter = require('./routes/userRouter');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// REGISTER OUR ROUTES -------------------------------
// all routes will be prefixed with /api
app.use(session({
    cookieName: 'session',
    secret: 'random_string',
    duration: 30* 60 * 1000,
    activeDuration: 5* 60 * 1000,
}));
app.use('/', express.static(__dirname + '/index'));
app.set('views', __dirname+ '/index/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.get('/', function(req,res){
    console.log("even?")
    if(req.session.user === undefined){
        res.render(__dirname+ '/index/index.html');
    }else{
        res.redirect(__dirname+ '/index/main.html');
    }
});
app.get('/main', function(req,res){
    //console.log("req session");
    //console.log(req.session.user.user_name);
    if(req.session.user === undefined){
        res.send("Forbidden(Login failure/Need to login!)<br/>");
        //res.render(__dirname+ '/index/index.html').end();
    }
    var options = {
        host: 'localhost',
        port : 8080,
        path: '/api/recipes/getRecipe/params?id=10000'
       // path: '/api/recipes/generatePossibleRecipesFromPantry/params?userName='+req.session.user.user_name
  };
    var myObject = { title:'data', data:'' };
    callback = function(response) {
        //console.log('STATUS: ' + res.statusCode);
  //console.log('HEADERS: ' + JSON.stringify(res.headers));
  response.setEncoding('utf8');

        response.on('data', function (chunk) {
            //console.log(chunk);
              myObject = chunk;
              console.log("hmm");
              console.log(JSON.parse(myObject).data[0]);

            res.render(__dirname+ '/index/main.html', {user_name: req.session.user.user_name, dat: JSON.stringify((JSON.parse(myObject)).data[0])});
        });

        response.on('end', function () {
              //console.log(myObject);
              //console.log(myObject.data);
        });

        //return str;
  }
  callback2 = function(res){
    console.log(myObject);
    res.render(__dirname+ '/index/main.html', {user_name: req.session.user.user_name, dat: myObject});
  }
    
    if(req.session.user === undefined){
        res.send("Forbidden(Login failure/Need to login!)<br/>");
        res.render(__dirname+ '/index/index.html');
    }else{
        var reqst = http.request(options, callback).end();
         
    }
    
});

app.get('/logout', function(req, res){
    req.session.destroy();
    res.send("logout Success<br/><a href='http://localhost:8080/'>Back to Login Page</a>");
});

app.use('/api', recipeRouter);
app.use('/api', ingredientsRouter);
app.use('/api', pantryRouter);
app.use('/api', authRouter);

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