//first things first, create a home page
var express = require('express');
var app = express();

//setting up the port
app.set('port', process.env.PORT || 3000);
//setting up the views and the view engine. Will be using pug templating for this proj
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
//TO do: add a route for user login



