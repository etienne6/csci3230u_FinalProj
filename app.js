var express = require('express');
var bodyParser = require("body-parser");
var session = require("express-session");
var uuid = require('uuid/v1');
var mongoose = require('mongoose');

var app = express();

//AUXILLARY FUNCTIONS 
function getDate() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December']
    return (months[curr_month] + " " + curr_date + " " + curr_year);
}
function renderTags(tags) {
    for (i = 0; i < tags.length; i++) {
        tags[i] = tags[i].toUpperCase();
    }
    return tags;
}
function renderText(text) {
    text = text.split("\n");
    return text;
}
//SETTING UP MIDDLEWARE
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

//SETTING UP VIEWS AND VIEW ENGINE
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//Configuring the database
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/HoopsHub',
    { useNewUrlParser: true },
    function (error) {
        if (error) {
            return console.error('Unable to connect:', error);
        }
    });
mongoose.set('useCreateIndex', true);

//schemas for the database
var schema = mongoose.Schema;
var userSchema = new schema({
    username: {
        type: String,
        unique: true,
        index: true
    },
    fullname: String,
    password: String
}, { collection: 'users' });
var contentSchema = new schema({
    title: String,
    date: String,
    author: String,
    content: String,
    tags: Array
}, { collection: 'contents' });

//Defining model for the database
var user = mongoose.model('user', userSchema);
var contents = mongoose.model('content', contentSchema);

//ROUTING
app.get('/', function (req, res) {
    res.redirect('/main')
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
//Main routing
app.post('/main', function (req, res) {
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
                contents.find({}, function (error, results) {
                    if (error) return next(error);
                    res.render("main", { title: "HoopsHub Main", username: username, contents: results })
                })
            }
        }
    });
});
app.get('/main', function (req, res) {
    username = req.session.username;
    //CODE CAUSING ERROR
    contents.find({}, function (error, results) {
        if (error) return next(error);
        res.status(200).render("main", { title: "HoopsHub Main", username: username, contents: results })
    })
});
//Login routes
//processes registration
app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var fullname = req.body.fullName

    var newUser = new user({ username: username, password: password, fullname: fullname});
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
app.get('/login', function (req, res) {
    res.render('login', { title: "Login" });
});
//add Article contents to database to the database. Routing for post contents
app.post("/submitContent", function (req, res) {
    var username = req.session.username //used for querying author name
    var title = req.body.title;
    var tags = renderTags(req.body.tags.split(","));
    var content = req.body.content;
    var author;
    //TODO: change author to an obj query by username
    user.findOne({username:username},function(err, user){
        //TODO: catch block for error
        author = user.fullname;
    });
    var date = getDate();
    var newContent = new contents({
        title: title,
        date: date,
        author: author,
        content: content,
        tags: tags
    });
    //TODO: add prompt that users cannot submit an empty field
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
    contents.findById(ID, function (err, article) {
        contents = renderText(article.content);
        console.log(article.author);
        res.render("article", { article: article, contents: contents, username: req.session.username });
    });
});
//setting up the port
app.set('port', process.env.PORT || 3000);
//web listener
app.listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});
