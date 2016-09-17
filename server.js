require('dotenv').config();
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');

var app = express();
var users = require('./routes/users');
var api = require('./routes/api');

app.use(bearerToken());
app.use(express.static('public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/users', users);
app.use('/api', api);

// redirect from # to remove from URL
app.get('*',function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

// JWT Middleware
app.use(function (req,res,next) {
  jwt.verify(req.token, process.env.SECRET,function (err,decoded) {
    if (!err) {
      next();
    } else {
      res.redirect('/');
    }
  });
});

app.listen(3000);
