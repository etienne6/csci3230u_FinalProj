const express = require('express');
var bodyParser = require("body-parser");
const session = require("express-session");
var uuid = require('uuid/v1');
var mongoose = require('mongoose');
const app = express();


app.use(express.static("public"));
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
//Configuring the database
mongoose.Promise = global.Promise //don't know what it does
mongoose.connect('mongodb://localhost:27017/HoopsHub',
    { useNewUrlParser: true },
    function (error) {
        if (error) {
            return console.error('Unable to connect:', error);
        }
    });
mongoose.set('useCreateIndex', true); //?? read on this

//schemas for the database
var schema = mongoose.Schema;
var userSchema = new schema({
    username: {
        type: String,
        unique: true,
        index: true
    },
    password: String
}, { collection: 'users' });

var user = mongoose.model('user', userSchema);

//ROUTES
app.get('/', function (request, response) {
    username = request.session.username;
    response.render('main', { title: "HoopsHub Home", username: username });
});
app.get('/main', function (request, response) {
    username = request.session.username;
    response.render('main', { title: "HoopsHub Home", username: username });
});
app.get('/login', function (request, response) {
    response.render('login', { title: "Login" });
});
app.get('/register', function (request, response) {
    response.render('register', { title: "Login" });
});

//NAVBAR ROUTES
app.get('/college', function (request, response) {
    response.render('college', { title: "College" });
})
app.get('/international', function (request, response) {
    response.render('international', { title: "International" });
})
app.get('/nba', function (request, response) {
    response.render('nba', { title: "NBA" });
})

app.post('/processLogin', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
    user.findOne({ username: username }).then(function (user) {
      // check if user first exists in database
      if (user) { // if true
        if (user.password != password) {
            console.log("password error!");
            userMessage = "Password incorrect. Please try again.";
            response.render("login", {errorFlag: true});
        } else {
            request.session.username = username;
            response.render('main', { username: username });
        }
      } else {
        userMessage = User" + username + " does not exist in our database.";
        response.render('login', {errorFlag: true});
      }
    });
});


app.post('/processRegister', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;

    var newUser = new user({ username: username, password: password });
    //how does the stack work for this?
    newUser.save(function (error) {
        if (error) {
            //error is thrown because username has property: unique: true
            message = "Sorry, " + username + " is already taken...";
            response.render("register", {errorFlag: true});
        } else {
            response.render("login");
        }
    });
});


//setting up the port
app.set('port', process.env.PORT || 3000);
//web listener
app.listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});
''
