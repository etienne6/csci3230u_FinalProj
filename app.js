// import express
var express = require('express');
// initialize the app
var app = express();



//setting up the port
app.set('port', process.env.PORT || 3000);
//setting up the views and the view engine. Will be using pug templating for this proj

// load view engine, can also use path.join if path is imported
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');



//ROUTES
app.listen(app.get('port'), function() {
	console.log('Server listening on port ' + app.get('port'));
});
app.get('/', function(request, response) {
    response.render('main', {title: "HoopsHub Home"});
    //request.sendfile('')
});
app.get('/main', function(request, response) {
    response.render('main', {title: "HoopsHub Home"});
    //request.sendfile('')
});
app.get('/login', function(request, response) {
    response.render('login', {title: "Login"});
});

//TO do: add a route for user login --------


// ROUTES for NBA COLLEGE INTERNATIONAL
app.get('/nba', function(request, response) {
	response.render('nba');
})

app.get('/college', function(request, response) {
	response.render('college', {title: "College | Homepage"});
})

app.get('/international', function(request, response) {
	response.render('international', {title: "International | Homepage"	});
})
