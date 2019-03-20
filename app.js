var express = require('express');
var bodyParser = require("body-parser");
var session = require("express-session");
var uuid = require('uuid/v1');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// configure sessions
app.use(session({
    genid: function (request) { return uuid(); },
    resave: false,
    saveUninitialized: false,
    secret: 'something something something'
}));

//setting up the views and the view engine. Will be using pug templating for this proj
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//ROUTES
app.get('/', function (request, response) {
    username = request.session.username;
    response.render('main', { title: "HoopsHub Home", username: username });
});
app.get('/main', function (request, response) {
    username = request.session.username;
    response.render('main', { title: "HoopsHub Home", username:username});
});
app.get('/login', function (request, response) {
    response.render('login', { title: "Login" });
});
app.post('/processLogin', function (request, response) {
    /*
        how does this work?
        - how does body parser know to get user name and password
        - what does "method: post" mean under login tag
        why does process Login go to server not found? Is it because we need a response?
        response.render() -- see documentation
    */
    var username = request.body.username;
    var password = request.body.password;

    request.session.username = username
    //TO DO: authentication - check if the user exists. 
    //IF SUCCESSFUL AUTHENTICATION
    response.render('main', { username: username });
});
//TODO add database?


//setting up the port
app.set('port', process.env.PORT || 3000);
//web listener
app.listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});