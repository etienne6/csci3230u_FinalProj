var express = require('express');
var bodyParser = require("body-parser");
var session = require("express-session");
var uuid = require('uuid/v1');
var mongoose = require('mongoose');

var app = express();

function getDate() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December']
    return (months[curr_month] + " " + curr_date + " " + curr_year);
}

app.use(express.static("public")); //directory where we're gonna be serving files from
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// configure sessions
app.use(session({
    genid: function (req) { return uuid(); },
    resave: false,
    saveUninitialized: false,
    secret: 'something something something'
}));

//setting up the views and the view engine. 
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
var contentSchema = new schema({
    title: String,
    date: String,
    author: String,
    content: String,
    tags: Array
}, { collection: 'sample_contents' });

//Defining model for db
var user = mongoose.model('user', userSchema);
var sample_content = mongoose.model('content', contentSchema);

//ROUTES
app.get('/', function (req, res) {
    res.redirect('/main')
});
//MAIN PAGE 
app.get('/main', function (req, res) {
    username = req.session.username;
    //TODO: get the objects from contents collection
    sample_content.find({}, function (error, results) {
        if (error) return next(error);
        res.render("main", { title: "HoopsHub Main", username: username, contents: results })
    })
});
app.get('/login', function (req, res) {
    res.render('login', { title: "Login" });
});
app.get('/register', function (req, res) {
    res.render('register', { title: "Login" });
});
//NAVBAR ROUTES
app.get('/college', function (req, res) {
    res.render('college', { title: "College", username: req.session.username });
})
app.get('/international', function (req, res) {
    res.render('international', { title: "International", username: req.session.username });
})
app.get('/nba', function (req, res) {
    res.render('nba', { title: "NBA", username: req.session.username });
})
app.get('/addcontent', function (req, res) {
    if (!req.session.username) {
        res.redirect("/login")
    } else {
        res.render('addContent', { title: "Submit to HoopsHub", username: req.session.username });
    }
})

//LOGIN POST METHOD
app.post('/main', function (req, res) {
    /*
        how does this work?
        - how does body parser know to get user name and password
        - what does "method: post" mean under login tag
        why does process Login go to server not found? Is it because we need a res?
        res.render() -- see documentation
    */
    var username = req.body.username;
    var password = req.body.password;

    user.findOne({ username: username }, function (error, user) {
        //needs to have a code that deals with errors
        if (error) {
            return handleError(error);
        } else {
            if (user.password != password) {
                console.log("password error!");
                res.render("login");
            } else {
                req.session.username = username
                res.render('main', { username: username });
            }
        }
    });
});
//registration post 
app.post('/processRegister', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    var newUser = new user({ username: username, password: password });
    //how does the stack work for this?
    newUser.save(function (error) {
        if (error) {
            //error is thrown because username has property: unique: true
            res.render("register");
            console.log("username already exists");
        } else {
            res.render("login");
        }
    });
});
//add Article contents to database to the database. Routing for post contents
app.post("/submitContent", function (req, res) {
    var title = req.body.title;
    var tags = req.body.tags.split(",");
    var content = req.body.content;
    var author = req.session.username;
    var date = getDate();
    var newContent = new sample_content({
        title: title,
        date: date,
        author: author,
        content: content,
        tags: tags
    });
    newContent.save(function (error) {
        if (error) {
            //error is thrown because username has property: unique: true
            res.redirect("/addContent");
            console.log("error");
        } else {
            res.redirect("/main");
        }
    });
});
app.param('author', function (req, res, next, author) {
    //do a db thing
    req.author = author;
    next();
  });
app.get('/contents/:author', function (req, res, next) {
    console.log('although this matches');
    console.log(req.author);
    res.redirect('/main');
});

//setting up the port
app.set('port', process.env.PORT || 3000);
//web listener
app.listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});
