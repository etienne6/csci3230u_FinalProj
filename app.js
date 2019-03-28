var express = require('express');
var bodyParser = require("body-parser");
var session = require("express-session");
var uuid = require('uuid/v1');
var mongoose = require('mongoose');

var app = express();

// functions ***
// date
function getDate() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    var curr_time = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December']
    return (months[curr_month] + " " + curr_date + " " + curr_year);
}

// capitalize Tag
function renderTags(tags) {
    for (i = 0; i < tags.length; i++) {
        tags[i] = tags[i].toUpperCase();
    }
    return tags;
}

// split words
function renderText(text) {
    text = text.split("\n");
    return text;
}

//  configurations ***
// parsing files
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (error, req, res, next) {
    if (res.status == 404) {
        res.render('error', { errorCode: res.status, errorMessage: 'File Not Found' });
    } else {
        res.render('error', { errorCode: 500, errorMessage: 'Internal Error Message' });
    }
});

// static files
app.use(express.static("public"));

// session
app.use(session({
    genid: function (req) { return uuid(); },
    resave: false,
    saveUninitialized: false,
    secret: 'something something something'
}));

// view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// database
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/HoopsHub',
    { useNewUrlParser: true },
    function (error) {
        if (error) {
            return console.error('Unable to connect:', error);
        }
    });
mongoose.set('useCreateIndex', true);

// schema - Users
var schema = mongoose.Schema;
var userSchema = new schema({
    username: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    fullname: String,
    password: {
        type: String,
        required: true
    }
}, { collection: 'users' });

// schema - content
var contentSchema = new schema({
    title: String,
    date: String,
    author: String,
    content: String,
    tags: Array
}, { collection: 'sample_contents' });

//model definitions
var user = mongoose.model('user', userSchema);
var sample_content = mongoose.model('content', contentSchema);


// ROUTES
app.get('/', function (req, res) {
    res.redirect('/main');
});

app.get('/login', function (req, res) {
    res.render('login', { title: "Login" });
});
//login route
app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var fullname = req.body.fullName;
    var newUser = new user({ username: username, password: password, fullname: fullname });
    newUser.save(function (error) {
        if (username == "" || password == "") {
            message = "cannot leave username or password field empty!"
            res.render("register", { errorflag: true, message: message });
        }
        if (error) {
            //error is thrown because username has property: unique: true
            message = "This username isn't available. Please try another.";
            res.render("register", { errorflag: true, message: message });
        } else {
            res.render("login");
        }
    });
});
app.get('/register', function (req, res) {
    res.render('register', { title: "Login" });
});

// Navbar ROUTES
app.get('/college', function (req, res) {
    sample_content.find({ tags: "COLLEGE" }, function (err, results) {
        res.render('college', { title: "College | HoopsHub", contents: results, username: req.session.username });
    });
});
app.get('/international', function (req, res) {
    sample_content.find({ tags: "INTERNATIONAL" }, function (err, results) {
        res.render('international', { title: "World | HoopsHub", contents: results, username: req.session.username });
    });
});
app.get('/nba', function (req, res) {
    sample_content.find({ tags: "NBA" }, function (err, results) {
        res.render('nba', { title: "NBA | HoopsHub", contents: results, username: req.session.username });
    });
});
app.get('/addcontent', function (req, res) {
    if (!req.session.username) {
        res.redirect("/login")
    } else {
        res.render('addContent', { title: "Submit to HoopsHub", username: req.session.username });
    }
});



// Main Page
app.get('/main', function (req, res) {
    username = req.session.username;
    //TODO: get the objects from contents collection
    sample_content.find({}, null, { sort: { title: -1 } }, function (error, results) {
        if (error) return next(error);
        res.render("main", { title: "HoopsHub Main", username: username, contents: results })
    })
});
app.post('/main', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    user.findOne({ username: username }, function (error, user) {
        //TODO: Handle error when database is empty
        if (error) {
            return handleError(error);
        } else {
            if (user) {
                if (user.password != password) {
                    console.log("password error!");
                    userMessage = "Password incorrect. Please try again.";
                    res.render("login", { errorFlag: true });
                } else {
                    req.session.username = username
                    sample_content.find({}, function (error, results) {
                        if (error) return next(error);
                        res.render("main", { title: "HoopsHub Main", username: username, contents: results })
                    })
                }
            } else {
                userMessage = "The username you entered doesn't belong to an account. Please check your username and try again.";
                res.render('login', { errorFlag: true });
            }
        }
    });
});

//add Article contents to database to the database. Routing for post contents
app.post("/submitContent", function (req, res) {
    var title = req.body.title;
    var tags = renderTags(req.body.tags.split(","));
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

//renders individual posts --- see main.pug
app.get('/contents/:mainTag/:id/:article', function (req, res, next) {
    var ID = req.params.id;
    sample_content.findById(ID, function (err, article) {
        contents = renderText(article.content);
        res.render("article", { article: article, contents: contents });
    });
});

// user logout
app.get('/processLogout', function (req, res) {
    req.session.username = '';
    if (req.session.username == '') {
        res.redirect('/main');
        console.log("user has been logged out");
    }
});

// port configurations
app.set('port', process.env.PORT || 3000);
//web listener
app.listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});
