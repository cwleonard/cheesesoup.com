var express = require('express');
var fs = require('fs');
var http = require('http');
var markdown = require('markdown-it')();

var app = express();

var conf = JSON.parse(fs.readFileSync('config/config.json', { encoding: 'utf-8' }));

var db = require('./db')(conf.database);

app.set("view engine", "pug");

app.get('/', function (req, res) {
    db.getAllRecipes(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', { recipes: data })
        }
    })
});

app.get('/recipe/:name', function (req, res) {
    db.getRecipeByName(req.params.name, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            data.recipeHtml = markdown.render(data.recipe);
            res.render('recipe', data );
        }
    })
});

app.use(express.static('static'));

var server = http.createServer(app).listen(conf.port, function() {
    console.log('listening on port %d', server.address().port);
});