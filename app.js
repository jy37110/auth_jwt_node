var express = require('express');
var app = express();
var routes = require('./Routes/router');

app.use('/', routes);

app.listen(3000, function(){
    console.log("Listening on port 3000");
});
